/**
 * BrazilBR — Core Type Definitions
 * Authentication, profile and nomad context foundation.
 */

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  bio: string;
  homeCountry: string;
  currentCountry: string;
  currentCity: string;
  languages: string[];
  interests: string[];
  travelStatus: string | null;
  travelStyle: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
}

export const USER_NEEDS = [
  'Meet people',
  'Find food',
  'Find a place',
  'Explore the city',
  'Find events',
  'Find work',
  'Practice Portuguese',
  'Get local help',
  'Travel somewhere',
  'Just explore',
] as const;

export type UserNeed = (typeof USER_NEEDS)[number];

export interface UserContext {
  uid: string;
  currentNeed: UserNeed | string;
  currentCity: string;
  updatedAt: string;
}

export type AuthMode = 'welcome' | 'email-signin' | 'email-signup';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
