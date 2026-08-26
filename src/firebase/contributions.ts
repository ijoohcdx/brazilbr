import { collection, deleteDoc, doc, getDocs, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Contribution, type ContributionType } from '../types';

export async function listContributions(): Promise<Contribution[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'contributions'), where('status', '==', 'published'), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Contribution))
      .filter((contribution) => contribution.status === 'published');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'contributions');
  }
}

export async function listContributionsByAuthor(authorId: string): Promise<Contribution[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'contributions'), where('status', '==', 'published'), limit(50)));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Contribution))
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
  media?: string[];
  links?: string[];
  metadata?: Record<string, string>;
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

export async function updateContribution(id: string, patch: Partial<Pick<Contribution, 'type' | 'title' | 'description' | 'location' | 'city' | 'country' | 'media' | 'links' | 'metadata' | 'status'>>): Promise<void> {
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'contributions', id), { ...patch, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `contributions/${id}`);
  }
}

export async function deleteContribution(id: string): Promise<void> {
  try {
    await deleteDoc(doc(requireFirebaseFirestore(), 'contributions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `contributions/${id}`);
  }
}
