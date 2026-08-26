import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType } from '../types';

export type SearchResultType = 'person' | 'contribution' | 'post';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  description: string;
  authorId?: string;
  category?: string;
}

const searchableText = (value: unknown) => Array.isArray(value) ? value.join(' ') : String(value ?? '');

const matches = (data: Record<string, unknown>, term: string) => {
  const haystack = [
    data.displayName,
    data.bio,
    data.currentCity,
    data.city,
    data.title,
    data.name,
    data.description,
    data.summary,
    data.category,
    data.type,
    data.content,
    data.tags,
    data.locationName,
  ].map(searchableText).join(' ').toLowerCase();
  return haystack.includes(term);
};

export async function searchAcrossBrazilBR(term: string, currentUid: string): Promise<SearchResult[]> {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return [];

  try {
    const firestore = requireFirebaseFirestore();
    const [profilesSnapshot, contributionsSnapshot, postsSnapshot] = await Promise.all([
      getDocs(query(collection(firestore, 'publicProfiles'), limit(100))),
      getDocs(query(collection(firestore, 'contributions'), where('status', '==', 'published'), limit(100))),
      getDocs(query(collection(firestore, 'posts'), where('visibility', '==', 'public'), limit(100))),
    ]);

    const people = profilesSnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown>))
      .filter((data) => data.uid !== currentUid && matches(data, normalized))
      .map((data) => ({
        id: String(data.uid || data.id),
        type: 'person' as const,
        title: String(data.displayName || 'BrazilBR member'),
        subtitle: String(data.currentCity || data.currentCountry || 'Brazil'),
        description: String(data.bio || 'Open to meeting people and sharing local discoveries.'),
      }));

    const contributions = contributionsSnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown>))
      .filter((data) => matches(data, normalized))
      .map((data) => ({
        id: String(data.id),
        type: 'contribution' as const,
        title: String(data.title || data.name || data.locationName || 'Brazil contribution'),
        subtitle: String(data.category || data.type || data.city || 'Contribution'),
        description: String(data.summary || data.description || ''),
        authorId: String(data.authorId || data.ownerId || ''),
        category: String(data.category || data.type || ''),
      }));

    const posts = postsSnapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown>))
      .filter((data) => matches(data, normalized))
      .map((data) => ({
        id: String(data.id),
        type: 'post' as const,
        title: String(data.authorName || 'BrazilBR post'),
        subtitle: 'Community post',
        description: String(data.content || data.text || ''),
        authorId: String(data.authorId || ''),
      }));

    return [...people, ...contributions, ...posts].slice(0, 50);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'search');
  }
}
