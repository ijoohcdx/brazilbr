import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Conversation, type Message } from '../types';
import { createNotification } from './notifications';

export function conversationId(firstUid: string, secondUid: string): string {
  return [firstUid, secondUid].sort().join('__');
}

export async function getOrCreateConversation(firstUid: string, secondUid: string): Promise<Conversation> {
  const id = conversationId(firstUid, secondUid);
  const conversationRef = doc(requireFirebaseFirestore(), 'conversations', id);
  try {
    const existing = await getDoc(conversationRef);
    if (existing.exists()) return { id, ...existing.data() } as Conversation;

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id,
      participants: [firstUid, secondUid].sort() as [string, string],
      createdAt: now,
      updatedAt: now,
      lastMessage: '',
      lastMessageAt: now,
    };
    await setDoc(conversationRef, conversation);
    return conversation;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${id}`);
  }
}

export async function getConversation(id: string): Promise<Conversation | null> {
  try {
    const snapshot = await getDoc(doc(requireFirebaseFirestore(), 'conversations', id));
    return snapshot.exists() ? ({ id, ...snapshot.data() } as Conversation) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `conversations/${id}`);
  }
}

export async function listConversations(uid: string): Promise<Conversation[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'conversations'), where('participants', 'array-contains', uid), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Conversation))
      .sort((left, right) => right.lastMessageAt.localeCompare(left.lastMessageAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'conversations');
  }
}

export async function listMessages(conversation: Conversation): Promise<Message[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'conversations', conversation.id, 'messages'), orderBy('createdAt', 'asc'), limit(100)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Message));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `conversations/${conversation.id}/messages`);
  }
}

export async function sendMessage(conversation: Conversation, senderId: string, text: string): Promise<Message> {
  const cleanText = text.trim();
  if (!cleanText) throw new Error('Message cannot be empty.');
  if (!conversation.participants.includes(senderId)) throw new Error('You are not part of this conversation.');

  const now = new Date().toISOString();
  const messageData = {
    conversationId: conversation.id,
    senderId,
    text: cleanText,
    createdAt: now,
    readAt: null,
  };

  try {
    const messageRef = await addDoc(collection(requireFirebaseFirestore(), 'conversations', conversation.id, 'messages'), messageData);
    await updateDoc(doc(requireFirebaseFirestore(), 'conversations', conversation.id), {
      lastMessage: cleanText,
      lastMessageAt: now,
      updatedAt: now,
    });
    const recipientId = conversation.participants.find((uid) => uid !== senderId);
    if (recipientId) void createNotification({ recipientId, actorId: senderId, type: 'message', entityId: conversation.id, text: 'sent you a new message.' }).catch((notificationError) => console.warn('Could not create message notification:', notificationError));
    return { id: messageRef.id, ...messageData };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `conversations/${conversation.id}/messages`);
  }
}
