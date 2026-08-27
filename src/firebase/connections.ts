import { collection, deleteDoc, doc, getDoc, getDocs, limit, query, updateDoc, setDoc, where } from '@firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Connection, type ConnectionStatus } from '../types';
import { createNotification } from './notifications';

export function connectionId(firstUid: string, secondUid: string): string {
  return [firstUid, secondUid].sort().join('__');
}

export async function getConnection(firstUid: string, secondUid: string): Promise<Connection | null> {
  const id = connectionId(firstUid, secondUid);
  try {
    const snapshot = await getDoc(doc(requireFirebaseFirestore(), 'connections', id));
    return snapshot.exists() ? ({ id, ...snapshot.data() } as Connection) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `connections/${id}`);
  }
}

export async function createConnection(initiatedBy: string, targetUid: string): Promise<Connection> {
  if (!initiatedBy || !targetUid || initiatedBy === targetUid) throw new Error('A connection needs two different people.');
  const id = connectionId(initiatedBy, targetUid);
  const now = new Date().toISOString();
  const connection: Connection = {
    id,
    users: [initiatedBy, targetUid].sort() as [string, string],
    initiatedBy,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(requireFirebaseFirestore(), 'connections', id), connection, { merge: false });
    void createNotification({ recipientId: targetUid, actorId: initiatedBy, type: 'friend-request', entityId: id, text: 'sent you a friend request.' }).catch((notificationError) => console.warn('Could not create friend request notification:', notificationError));
    return connection;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `connections/${id}`);
  }
}

export async function listConnectionsForUser(uid: string): Promise<Connection[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'connections'), where('users', 'array-contains', uid), limit(100)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Connection));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'connections');
  }
}

export async function updateConnectionStatus(
  connection: Connection,
  actorUid: string,
  status: Extract<ConnectionStatus, 'accepted' | 'declined' | 'blocked'>
): Promise<void> {
  if (connection.initiatedBy === actorUid && status !== 'blocked') {
    throw new Error('Only the recipient can accept or decline a connection request.');
  }
  if (!connection.users.includes(actorUid)) {
    throw new Error('You cannot update this connection.');
  }

  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'connections', connection.id), {
      status,
      updatedAt: new Date().toISOString(),
    });
    if (status === 'accepted') {
      const recipientId = connection.users.find((uid) => uid !== actorUid);
      if (recipientId) void createNotification({ recipientId, actorId: actorUid, type: 'friend-accepted', entityId: connection.id, text: 'accepted your friend request.' }).catch((notificationError) => console.warn('Could not create friend accepted notification:', notificationError));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `connections/${connection.id}`);
  }
}

export async function removeConnection(connection: Connection, actorUid: string): Promise<void> {
  if (!connection.users.includes(actorUid)) {
    throw new Error('You cannot remove this connection.');
  }

  try {
    await deleteDoc(doc(requireFirebaseFirestore(), 'connections', connection.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `connections/${connection.id}`);
  }
}
