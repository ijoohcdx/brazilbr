import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, auth } from './config';
import { OperationType, type FirestoreErrorInfo, type UserProfile } from '../types';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(errInfo.error);
}

/**
 * Creates or updates the user document in Firestore.
 * Preserves the original `createdAt` if user already exists.
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const nowIso = new Date().toISOString();
  const userDocRef = doc(db, 'users', user.uid);

  try {
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const existingData = docSnap.data() as Partial<UserProfile>;
      
      const updatedProfile: UserProfile = {
        uid: user.uid,
        email: user.email ?? existingData.email ?? null,
        displayName: user.displayName ?? existingData.displayName ?? (user.email ? user.email.split('@')[0] : null),
        photoURL: user.photoURL ?? existingData.photoURL ?? null,
        createdAt: existingData.createdAt || nowIso,
        updatedAt: nowIso,
        lastLoginAt: nowIso,
      };

      await updateDoc(userDocRef, {
        displayName: updatedProfile.displayName,
        photoURL: updatedProfile.photoURL,
        email: updatedProfile.email,
        updatedAt: updatedProfile.updatedAt,
        lastLoginAt: updatedProfile.lastLoginAt,
      });

      return updatedProfile;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email ?? null,
        displayName: user.displayName ?? (user.email ? user.email.split('@')[0] : null),
        photoURL: user.photoURL ?? null,
        createdAt: nowIso,
        updatedAt: nowIso,
        lastLoginAt: nowIso,
      };

      await setDoc(userDocRef, newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches the user profile from Firestore by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  const userDocRef = doc(db, 'users', uid);
  
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
