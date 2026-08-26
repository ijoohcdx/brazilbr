import { collection, doc, getDocs, limit, query, setDoc, where } from '@firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type UserGroup } from '../types';

export async function listGroupsForUser(uid: string): Promise<UserGroup[]> {
  try {
    const snapshot = await getDocs(
      query(collection(requireFirebaseFirestore(), 'groups'), where('memberIds', 'array-contains', uid), limit(50)),
    );
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as UserGroup))
      .sort((left, right) => left.name.localeCompare(right.name));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'groups');
  }
}

export async function createGroup(ownerId: string, name: string, memberIds: string[]): Promise<UserGroup> {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Group name cannot be empty.');

  const now = new Date().toISOString();
  const group: UserGroup = {
    id: doc(collection(requireFirebaseFirestore(), 'groups')).id,
    ownerId,
    name: cleanName,
    memberIds: Array.from(new Set([ownerId, ...memberIds])),
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(requireFirebaseFirestore(), 'groups', group.id), group);
    return group;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `groups/${group.id}`);
  }
}
