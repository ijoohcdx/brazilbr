import { collection, deleteDoc, doc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Contribution, type ContributionType, type MediaReference, type MediaEntry } from '../types';
import { deleteMedia } from './media';

export async function listContributions(): Promise<Contribution[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'contributions'), where('status', '==', 'published'), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, media: [], ...item.data() } as Contribution))
      .filter((contribution) => contribution.status === 'published');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'contributions');
  }
}

export async function listContributionsByAuthor(authorId: string): Promise<Contribution[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'contributions'), where('status', '==', 'published'), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, media: [], ...item.data() } as Contribution))
      .filter((contribution) => contribution.authorId === authorId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `contributions?authorId=${authorId}`);
  }
}

export interface ContributionInput {
  authorId: string;
  type: ContributionType;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  media?: MediaEntry[];
  links?: string[];
  metadata?: Record<string, string>;
  placeId?: string | null;
  status?: 'published' | 'draft';
}

export async function createContribution(input: ContributionInput): Promise<Contribution> {
  const title = input.title.trim();
  const description = input.description.trim();
  if (!title || !description) throw new Error('Contribution title and description are required.');

  const firestore = requireFirebaseFirestore();
  const contributionRef = doc(collection(firestore, 'contributions'));
  const now = new Date().toISOString();
  const contribution: Contribution = {
    id: contributionRef.id,
    authorId: input.authorId,
    type: input.type,
    title,
    description,
    location: input.location.trim(),
    city: input.city.trim(),
    country: input.country.trim() || 'Brazil',
    media: input.media || [],
    links: input.links || [],
    metadata: input.metadata || {},
    placeId: input.placeId || null,
    status: input.status || 'published',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(contributionRef, contribution);
    return contribution;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `contributions/${contribution.id}`);
  }
}

export async function attachContributionMedia(id: string, media: MediaReference[]): Promise<void> {
  if (media.length === 0) return;
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'contributions', id), { media, updatedAt: new Date().toISOString() });
  } catch (error) {
    await Promise.allSettled(media.map((item) => deleteMedia(item)));
    handleFirestoreError(error, OperationType.UPDATE, `contributions/${id}/media`);
  }
}

export async function removeContributionMedia(contribution: Contribution, mediaId: string): Promise<void> {
  const media = (contribution.media || []).filter((item) => typeof item !== 'string' && item.id !== mediaId);
  const removed = (contribution.media || []).find((item) => typeof item !== 'string' && item.id === mediaId);
  if (!removed || typeof removed === 'string') return;
  try {
    if (removed.owner !== 'place') await deleteMedia(removed);
    await updateDoc(doc(requireFirebaseFirestore(), 'contributions', contribution.id), { media, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contributions/${contribution.id}/media`);
  }
}

export async function updateContribution(id: string, patch: Partial<Pick<Contribution, 'type' | 'title' | 'description' | 'location' | 'city' | 'country' | 'media' | 'links' | 'metadata' | 'placeId' | 'status'>>): Promise<void> {
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'contributions', id), { ...patch, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contributions/${id}`);
  }
}

export async function deleteContribution(contribution: Contribution): Promise<void> {
  try {
    const media = (contribution.media || []).filter((item): item is MediaReference => typeof item !== 'string' && item.owner !== 'place');
    await deleteDoc(doc(requireFirebaseFirestore(), 'contributions', contribution.id));
    await Promise.allSettled(media.map((item) => deleteMedia(item)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `contributions/${contribution.id}`);
  }
}
