import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth, requireFirebaseFirestore } from './config';
import { OperationType, type FirestoreErrorInfo, type UserContext, type UserProfile } from '../types';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
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

function profileFromData(data: Partial<UserProfile>, user: User, nowIso: string): UserProfile {
  return {
    uid: user.uid,
    email: user.email ?? data.email ?? null,
    displayName: user.displayName ?? data.displayName ?? (user.email ? user.email.split('@')[0] : null),
    photoURL: user.photoURL ?? data.photoURL ?? null,
    bio: data.bio ?? '',
    homeCountry: data.homeCountry ?? '',
    currentCountry: data.currentCountry ?? 'Brazil',
    currentCity: data.currentCity ?? '',
    languages: data.languages ?? [],
    interests: data.interests ?? [],
    travelStatus: data.travelStatus ?? null,
    travelStyle: data.travelStyle ?? null,
    onboardingCompleted: data.onboardingCompleted ?? false,
    createdAt: data.createdAt || nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
    lastActiveAt: nowIso,
  };
}

/** Creates or updates the authenticated user's profile while preserving onboarding data. */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const nowIso = new Date().toISOString();
  const userDocRef = doc(requireFirebaseFirestore(), 'users', user.uid);

  try {
    const docSnap = await getDoc(userDocRef);
    const existingData = docSnap.exists() ? (docSnap.data() as Partial<UserProfile>) : {};
    const profile = profileFromData(existingData, user, nowIso);

    if (docSnap.exists()) {
      await updateDoc(userDocRef, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        email: profile.email,
        updatedAt: profile.updatedAt,
        lastLoginAt: profile.lastLoginAt,
        lastActiveAt: profile.lastActiveAt,
      });
    } else {
      await setDoc(userDocRef, profile);
    }

    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/** Fetches the user profile from Firestore by UID. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  const userDocRef = doc(requireFirebaseFirestore(), 'users', uid);

  try {
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/** Saves only public/profile onboarding fields owned by the current user. */
export async function saveUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'homeCountry' | 'currentCountry' | 'currentCity' | 'languages' | 'interests' | 'travelStatus' | 'travelStyle' | 'onboardingCompleted'>>
): Promise<void> {
  const path = `users/${uid}`;
  try {
    await setDoc(
      doc(requireFirebaseFirestore(), 'users', uid),
      { ...data, updatedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function getUserContext(uid: string): Promise<UserContext | null> {
  const path = `userContext/${uid}`;
  try {
    const snapshot = await getDoc(doc(requireFirebaseFirestore(), 'userContext', uid));
    return snapshot.exists() ? (snapshot.data() as UserContext) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserContext(
  uid: string,
  currentNeed: string,
  currentCity: string
): Promise<UserContext> {
  const path = `userContext/${uid}`;
  const context: UserContext = {
    uid,
    currentNeed,
    currentCity,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(requireFirebaseFirestore(), 'userContext', uid), context, { merge: true });
    return context;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
