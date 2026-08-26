import { collection, doc, getDoc, getDocs, limit, query } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type UserContext, type UserProfile } from '../types';

export type PublicUserProfile = Pick<
  UserProfile,
  | 'uid'
  | 'displayName'
  | 'photoURL'
  | 'bio'
  | 'homeCountry'
  | 'currentCountry'
  | 'currentCity'
  | 'languages'
  | 'interests'
  | 'travelStatus'
  | 'travelStyle'
>;

function toPublicProfile(data: Record<string, unknown>): PublicUserProfile | null {
  if (typeof data.uid !== 'string' || data.onboardingCompleted !== true) return null;
  return {
    uid: data.uid,
    displayName: typeof data.displayName === 'string' ? data.displayName : null,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    bio: typeof data.bio === 'string' ? data.bio : '',
    homeCountry: typeof data.homeCountry === 'string' ? data.homeCountry : '',
    currentCountry: typeof data.currentCountry === 'string' ? data.currentCountry : 'Brazil',
    currentCity: typeof data.currentCity === 'string' ? data.currentCity : '',
    languages: Array.isArray(data.languages) ? data.languages.filter((value): value is string => typeof value === 'string') : [],
    interests: Array.isArray(data.interests) ? data.interests.filter((value): value is string => typeof value === 'string') : [],
    travelStatus: typeof data.travelStatus === 'string' ? data.travelStatus : null,
    travelStyle: typeof data.travelStyle === 'string' ? data.travelStyle : null,
  };
}

function scoreProfile(profile: PublicUserProfile, currentUserId: string, context: UserContext | null): number {
  if (profile.uid === currentUserId) return -1;
  if (!context) return 0;

  let score = 0;
  if (context.currentCity && profile.currentCity.toLowerCase() === context.currentCity.toLowerCase()) score += 5;
  if (context.currentNeed && profile.interests.some((interest) => interest.toLowerCase() === context.currentNeed.toLowerCase())) score += 2;
  if (profile.languages.length > 0) score += 1;
  if (profile.travelStatus) score += 1;
  return score;
}

export async function listDiscoverableProfiles(currentUserId: string, context: UserContext | null): Promise<PublicUserProfile[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'users'), limit(50)));
    return snapshot.docs
      .map((item) => toPublicProfile(item.data()))
      .filter((profile): profile is PublicUserProfile => profile !== null && profile.uid !== currentUserId)
      .sort((left, right) => scoreProfile(right, currentUserId, context) - scoreProfile(left, currentUserId, context));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'users');
  }
}

export async function getDiscoverableProfile(uid: string): Promise<PublicUserProfile | null> {
  try {
    const snapshot = await getDoc(doc(requireFirebaseFirestore(), 'users', uid));
    return snapshot.exists() ? toPublicProfile(snapshot.data()) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}
