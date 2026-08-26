import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { auth, requireFirebaseFirestore } from './config';
import { OperationType, type FirestoreErrorInfo, type UserContext, type UserProfile } from '../types';

const FIRESTORE_WRITE_TIMEOUT_MS = 15000;

function withFirestoreTimeout<T>(operation: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${FIRESTORE_WRITE_TIMEOUT_MS / 1000} seconds.`)), FIRESTORE_WRITE_TIMEOUT_MS);
    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

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
    showOnMap: data.showOnMap ?? false,
  };
}

function publicProfileData(profile: Partial<UserProfile>) {
  return {
    uid: profile.uid,
    displayName: profile.displayName ?? null,
    photoURL: profile.photoURL ?? null,
    bio: profile.bio ?? '',
    homeCountry: profile.homeCountry ?? '',
    currentCountry: profile.currentCountry ?? 'Brazil',
    currentCity: profile.currentCity ?? '',
    languages: profile.languages ?? [],
    interests: profile.interests ?? [],
    travelStatus: profile.travelStatus ?? null,
    travelStyle: profile.travelStyle ?? null,
    onboardingCompleted: profile.onboardingCompleted ?? false,
    showOnMap: profile.showOnMap ?? false,
    updatedAt: profile.updatedAt ?? new Date().toISOString(),
  };
}

/** Creates or updates the authenticated user's private profile and its public projection. */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  const nowIso = new Date().toISOString();
  const firestore = requireFirebaseFirestore();
  const userDocRef = doc(firestore, 'users', user.uid);
  const publicDocRef = doc(firestore, 'publicProfiles', user.uid);

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

    await setDoc(publicDocRef, publicProfileData(profile), { merge: true });
    return profile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/** Fetches the private profile from Firestore by UID. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(requireFirebaseFirestore(), 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/** Saves private profile fields and updates a public projection without copying the email. */
export async function saveUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'bio' | 'homeCountry' | 'currentCountry' | 'currentCity' | 'languages' | 'interests' | 'travelStatus' | 'travelStyle' | 'onboardingCompleted' | 'showOnMap'>>
): Promise<void> {
  const path = `users/${uid}`;
  const now = new Date().toISOString();
  try {
    await withFirestoreTimeout(
      setDoc(doc(requireFirebaseFirestore(), 'users', uid), { uid, ...data, updatedAt: now, lastActiveAt: now }, { merge: true }),
      'Saving your private profile',
    );
    await withFirestoreTimeout(
      setDoc(doc(requireFirebaseFirestore(), 'publicProfiles', uid), publicProfileData({ uid, ...data, updatedAt: now }), { merge: true }),
      'Saving your public profile',
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

export async function saveUserContext(uid: string, currentNeed: string, currentCity: string): Promise<UserContext> {
  const path = `userContext/${uid}`;
  const context: UserContext = { uid, currentNeed, currentCity, updatedAt: new Date().toISOString() };
  try {
    await withFirestoreTimeout(
      setDoc(doc(requireFirebaseFirestore(), 'userContext', uid), context, { merge: true }),
      'Saving your current context',
    );
    return context;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
