import { addDoc, collection, doc, setDoc } from '@firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Connection, type UserReport } from '../types';
import { connectionId } from './connections';

export async function reportUser(reporterId: string, reportedUserId: string, reason: string): Promise<UserReport> {
  if (!reporterId || !reportedUserId || reporterId === reportedUserId) throw new Error('You cannot report yourself.');
  const cleanReason = reason.trim();
  if (!cleanReason) throw new Error('Please provide a reason for the report.');
  const reportData = {
    reporterId,
    reportedUserId,
    reason: cleanReason.slice(0, 500),
    createdAt: new Date().toISOString(),
  };

  try {
    const reportRef = await addDoc(collection(requireFirebaseFirestore(), 'reports'), reportData);
    return { id: reportRef.id, ...reportData };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'reports');
  }
}

export async function blockUser(blockerId: string, blockedUserId: string): Promise<Connection> {
  if (!blockerId || !blockedUserId || blockerId === blockedUserId) throw new Error('You cannot block yourself.');
  const id = connectionId(blockerId, blockedUserId);
  const now = new Date().toISOString();
  const blockedConnection: Connection = {
    id,
    users: [blockerId, blockedUserId].sort() as [string, string],
    initiatedBy: blockerId,
    status: 'blocked',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(requireFirebaseFirestore(), 'connections', id), blockedConnection);
    return blockedConnection;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `connections/${id}`);
  }
}
