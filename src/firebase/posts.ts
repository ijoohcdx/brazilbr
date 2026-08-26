import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from '@firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Post, type PostComment, type PostReaction, type PostVisibility } from '../types';
import { createNotification } from './notifications';
import type { MediaEntry, MediaReference } from '../types';

export async function listFeedPosts(): Promise<Post[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'posts'), where('visibility', '==', 'public'), limit(30)));
    return snapshot.docs
      .map((item) => ({ id: item.id, media: [], ...item.data() } as Post))
      .filter((post) => post.visibility !== 'friends')
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'posts');
  }
}

export async function listPostsByAuthor(authorId: string): Promise<Post[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'posts'), where('authorId', '==', authorId), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, media: [], ...item.data() } as Post))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `posts?authorId=${authorId}`);
  }
}

export async function createPost(
  authorId: string,
  authorName: string,
  authorPhotoURL: string | null,
  content: string,
  city: string,
  visibility: PostVisibility = 'public',
  linkUrl: string | null = null,
  media: MediaEntry[] = [],
): Promise<Post> {
  const cleanContent = content.trim();
  if (!cleanContent) throw new Error('Post content cannot be empty.');

  const firestore = requireFirebaseFirestore();
  const postRef = doc(collection(firestore, 'posts'));
  const now = new Date().toISOString();
  const post: Post = {
    id: postRef.id,
    authorId,
    authorName: authorName.trim() || 'BrazilBR member',
    authorPhotoURL,
    content: cleanContent,
    city: city.trim(),
    linkUrl: linkUrl?.trim() || null,
    mediaUrl: null,
    media,
    visibility,
    reactionCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(postRef, post);
    return post;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `posts/${post.id}`);
  }
}

export async function getPostReaction(postId: string, userId: string): Promise<PostReaction | null> {
  const id = `${postId}__${userId}`;
  try {
    const snapshot = await getDoc(doc(requireFirebaseFirestore(), 'reactions', id));
    return snapshot.exists() ? ({ id, ...snapshot.data() } as PostReaction) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `reactions/${id}`);
  }
}

export async function togglePostReaction(postId: string, userId: string): Promise<boolean> {
  const firestore = requireFirebaseFirestore();
  const id = `${postId}__${userId}`;
  const reactionRef = doc(firestore, 'reactions', id);

  try {
    const postSnapshot = await getDoc(doc(firestore, 'posts', postId));
    const postAuthorId = postSnapshot.exists() ? String(postSnapshot.data().authorId || '') : '';
    const snapshot = await getDoc(reactionRef);
    if (snapshot.exists()) {
      await deleteDoc(reactionRef);
      return false;
    }
    const reaction: PostReaction = { id, postId, userId, createdAt: new Date().toISOString() };
    await setDoc(reactionRef, reaction);
    if (postAuthorId && postAuthorId !== userId) void createNotification({ recipientId: postAuthorId, actorId: userId, type: 'reaction', entityId: postId, text: 'reacted to your post.' }).catch((notificationError) => console.warn('Could not create reaction notification:', notificationError));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `reactions/${id}`);
  }
}

export async function listPostComments(postId: string): Promise<PostComment[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'comments'), where('postId', '==', postId), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as PostComment))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `comments?postId=${postId}`);
  }
}

export async function addPostComment(postId: string, authorId: string, authorName: string, text: string): Promise<PostComment> {
  const cleanText = text.trim();
  if (!cleanText) throw new Error('Comment cannot be empty.');

  const firestore = requireFirebaseFirestore();
  const commentRef = doc(collection(firestore, 'comments'));
  const comment: PostComment = {
    id: commentRef.id,
    postId,
    authorId,
    authorName: authorName.trim() || 'BrazilBR member',
    text: cleanText,
    createdAt: new Date().toISOString(),
  };

  try {
    const postSnapshot = await getDoc(doc(firestore, 'posts', postId));
    await setDoc(commentRef, comment);
    await updateDoc(doc(firestore, 'posts', postId), { commentCount: increment(1), updatedAt: new Date().toISOString() });
    const postAuthorId = postSnapshot.exists() ? String(postSnapshot.data().authorId || '') : '';
    if (postAuthorId && postAuthorId !== authorId) void createNotification({ recipientId: postAuthorId, actorId: authorId, type: 'comment', entityId: postId, text: 'commented on your post.' }).catch((notificationError) => console.warn('Could not create comment notification:', notificationError));
    return comment;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `comments/${comment.id}`);
  }
}

export async function addPostMediaReferences(postId: string, media: MediaReference[]): Promise<void> {
  if (media.length === 0) return;
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'posts', postId), { media, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${postId}/media`);
  }
}

export async function removePostMediaReference(post: Post, mediaId: string): Promise<void> {
  const media = (post.media || []).filter((item) => typeof item === 'string' || item.id !== mediaId);
  const removed = (post.media || []).find((item) => typeof item !== 'string' && item.id === mediaId);
  if (!removed || typeof removed === 'string') return;
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'posts', post.id), { media, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `posts/${post.id}/media`);
  }
}
