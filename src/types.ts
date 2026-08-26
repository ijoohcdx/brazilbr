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

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface Connection {
  id: string;
  users: [string, string];
  initiatedBy: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: [string, string];
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt: string | null;
}

export interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  createdAt: string;
}

export interface UserGroup {
  id: string;
  ownerId: string;
  name: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type PostVisibility = 'public' | 'friends';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  city: string;
  linkUrl: string | null;
  mediaUrl: string | null;
  visibility: PostVisibility;
  reactionCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export type NotificationType = 'friend-request' | 'friend-accepted' | 'message' | 'comment' | 'reaction';

export interface UserNotification {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  entityId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export const CONTRIBUTION_TYPES = [
  'place',
  'restaurant',
  'hotel',
  'event',
  'job',
  'accommodation',
  'local-tip',
  'guide',
  'photo',
  'video',
  'service',
  'other',
] as const;

export type ContributionType = (typeof CONTRIBUTION_TYPES)[number];
export type ContributionStatus = 'published' | 'draft';

export interface Contribution {
  id: string;
  authorId: string;
  type: ContributionType;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  media: string[];
  links: string[];
  metadata: Record<string, string>;
  status: ContributionStatus;
  createdAt: string;
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
