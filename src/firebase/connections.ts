import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, setDoc, where } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Connection, type ConnectionStatus } from '../types';

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
    return connection;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `connections/${id}`);
  }
}

export async function listConnectionsForUser(uid: string): Promise<Connection[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'connections'), where('users', 'array-contains', uid)));
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
  if (!connection.users.includes(actorUid)) {
    throw new Error('You cannot update this connection.');
  }

  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'connections', connection.id), {
      status,
      updatedAt: new Date().toISOString(),
    });
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
