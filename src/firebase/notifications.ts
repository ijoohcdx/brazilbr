import { collection, doc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type NotificationType, type UserNotification } from '../types';

export interface NotificationInput {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  text: string;
}

export async function createNotification(input: NotificationInput): Promise<UserNotification> {
  const firestore = requireFirebaseFirestore();
  const notificationRef = doc(collection(firestore, 'notifications'));
  const notification: UserNotification = {
    id: notificationRef.id,
    ...input,
    read: false,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(notificationRef, notification);
    return notification;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `notifications/${notification.id}`);
  }
}

export async function listNotifications(recipientId: string): Promise<UserNotification[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'notifications'), where('recipientId', '==', recipientId), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as UserNotification))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `notifications?recipientId=${recipientId}`);
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'notifications', notificationId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}
