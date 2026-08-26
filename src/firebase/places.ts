import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, updateDoc, where } from '@firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type MediaEntry, type MediaReference, type Place, type PlaceCategory, type PlaceContribution } from '../types';

const asText = (value: string | undefined | null) => value?.trim() || '';

export interface PlaceInput {
  name: string;
  category: PlaceCategory;
  description: string;
  address?: string;
  city: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  whatsapp?: string;
  website?: string;
  mapsUrl?: string;
  instagramUrl?: string;
  bookingUrl?: string;
  hostelworldUrl?: string;
  reservationUrl?: string;
  openingHours?: string;
  priceRange?: string;
  roomTypes?: string;
  amenities?: string[];
  services?: string[];
  media?: MediaEntry[];
  wifiAvailable?: boolean | null;
  breakfast?: boolean | null;
  checkIn?: string;
  checkOut?: string;
  menuUrl?: string;
  ticketUrl?: string;
  applicationUrl?: string;
  contact?: string;
  createdBy: string;
}

const toPlace = (id: string, data: Record<string, unknown>): Place => ({
  id,
  name: String(data.name || ''),
  category: (data.category || 'other') as PlaceCategory,
  description: String(data.description || ''),
  address: String(data.address || ''),
  city: String(data.city || ''),
  country: String(data.country || 'Brazil'),
  latitude: typeof data.latitude === 'number' ? data.latitude : null,
  longitude: typeof data.longitude === 'number' ? data.longitude : null,
  phone: String(data.phone || ''),
  whatsapp: String(data.whatsapp || ''),
  website: String(data.website || ''),
  mapsUrl: String(data.mapsUrl || ''),
  instagramUrl: String(data.instagramUrl || ''),
  bookingUrl: String(data.bookingUrl || ''),
  hostelworldUrl: String(data.hostelworldUrl || ''),
  reservationUrl: String(data.reservationUrl || ''),
  openingHours: String(data.openingHours || ''),
  priceRange: String(data.priceRange || ''),
  roomTypes: String(data.roomTypes || ''),
  amenities: Array.isArray(data.amenities) ? data.amenities.map(String) : [],
  services: Array.isArray(data.services) ? data.services.map(String) : [],
  media: Array.isArray(data.media) ? data.media.filter((entry): entry is MediaEntry => typeof entry === 'string' || (typeof entry === 'object' && entry !== null && typeof (entry as { externalUrl?: unknown }).externalUrl === 'string')) : [],
  wifiAvailable: typeof data.wifiAvailable === 'boolean' ? data.wifiAvailable : null,
  breakfast: typeof data.breakfast === 'boolean' ? data.breakfast : null,
  checkIn: String(data.checkIn || ''),
  checkOut: String(data.checkOut || ''),
  menuUrl: String(data.menuUrl || ''),
  ticketUrl: String(data.ticketUrl || ''),
  applicationUrl: String(data.applicationUrl || ''),
  contact: String(data.contact || ''),
  claimedBy: typeof data.claimedBy === 'string' ? data.claimedBy : null,
  verified: data.verified === true,
  verificationStatus: data.verificationStatus === 'verified' || data.verificationStatus === 'pending' ? data.verificationStatus : 'unverified',
  createdBy: String(data.createdBy || ''),
  createdAt: String(data.createdAt || ''),
  updatedAt: String(data.updatedAt || ''),
});

export async function getPlace(placeId: string): Promise<Place | null> {
  try {
    const snapshot = await getDoc(doc(requireFirebaseFirestore(), 'places', placeId));
    return snapshot.exists() ? toPlace(snapshot.id, snapshot.data()) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `places/${placeId}`);
  }
}

export async function listPlaces(options: { city?: string; category?: PlaceCategory } = {}): Promise<Place[]> {
  try {
    const firestore = requireFirebaseFirestore();
    const snapshot = options.city?.trim()
      ? await getDocs(query(collection(firestore, 'places'), where('city', '==', options.city.trim()), limit(50)))
      : await getDocs(query(collection(firestore, 'places'), limit(50)));
    return snapshot.docs
      .map((item) => toPlace(item.id, item.data()))
      .filter((place) => !options.category || place.category === options.category)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'places');
  }
}

export async function createPlace(input: PlaceInput): Promise<Place> {
  const name = asText(input.name);
  const description = asText(input.description);
  const city = asText(input.city);
  if (!name || !description || !city) throw new Error('Place name, description and city are required.');

  const firestore = requireFirebaseFirestore();
  const placeRef = doc(collection(firestore, 'places'));
  const now = new Date().toISOString();
  const place: Place = {
    id: placeRef.id,
    name,
    category: input.category,
    description,
    address: asText(input.address),
    city,
    country: asText(input.country) || 'Brazil',
    latitude: typeof input.latitude === 'number' ? input.latitude : null,
    longitude: typeof input.longitude === 'number' ? input.longitude : null,
    phone: asText(input.phone),
    whatsapp: asText(input.whatsapp),
    website: asText(input.website),
    mapsUrl: asText(input.mapsUrl),
    instagramUrl: asText(input.instagramUrl),
    bookingUrl: asText(input.bookingUrl),
    hostelworldUrl: asText(input.hostelworldUrl),
    reservationUrl: asText(input.reservationUrl),
    openingHours: asText(input.openingHours),
    priceRange: asText(input.priceRange),
    roomTypes: asText(input.roomTypes),
    amenities: input.amenities || [],
    services: input.services || [],
    media: input.media || [],
    wifiAvailable: input.wifiAvailable ?? null,
    breakfast: input.breakfast ?? null,
    checkIn: asText(input.checkIn),
    checkOut: asText(input.checkOut),
    menuUrl: asText(input.menuUrl),
    ticketUrl: asText(input.ticketUrl),
    applicationUrl: asText(input.applicationUrl),
    contact: asText(input.contact),
    claimedBy: null,
    verified: false,
    verificationStatus: 'unverified',
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(placeRef, place);
    return place;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `places/${place.id}`);
  }
}

export async function updatePlace(placeId: string, patch: Partial<Pick<Place, 'name' | 'category' | 'description' | 'address' | 'city' | 'country' | 'phone' | 'whatsapp' | 'website' | 'mapsUrl' | 'instagramUrl' | 'bookingUrl' | 'hostelworldUrl' | 'reservationUrl' | 'openingHours' | 'priceRange' | 'roomTypes' | 'amenities' | 'services' | 'media' | 'wifiAvailable' | 'breakfast' | 'checkIn' | 'checkOut' | 'menuUrl' | 'ticketUrl' | 'applicationUrl' | 'contact'>>): Promise<void> {
  try {
    await updateDoc(doc(requireFirebaseFirestore(), 'places', placeId), { ...patch, updatedAt: new Date().toISOString() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `places/${placeId}`);
  }
}

export async function listPlaceContributions(placeId: string): Promise<PlaceContribution[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'places', placeId, 'placeContributions'), orderBy('createdAt', 'desc'), limit(50)));
    return snapshot.docs.map((item) => ({ id: item.id, media: [], ...item.data() } as PlaceContribution));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `places/${placeId}/placeContributions`);
  }
}


export async function listPlaceMedia(placeId: string): Promise<MediaReference[]> {
  try {
    const snapshot = await getDocs(query(collection(requireFirebaseFirestore(), 'places', placeId, 'media'), orderBy('createdAt', 'desc'), limit(50)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as MediaReference));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `places/${placeId}/media`);
  }
}

export async function addPlaceMediaReferences(placeId: string, media: MediaReference[]): Promise<void> {
  if (media.length === 0) return;
  try {
    await Promise.all(media.map((item) => setDoc(doc(requireFirebaseFirestore(), 'places', placeId, 'media', item.id), { ...item, placeId })));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `places/${placeId}/media`);
  }
}

export async function removePlaceMediaReference(placeId: string, media: MediaReference, actorId: string): Promise<void> {
  if (media.contributorId !== actorId) throw new Error('Only the media contributor can remove this reference.');
  try {
    await deleteDoc(doc(requireFirebaseFirestore(), 'places', placeId, 'media', media.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `places/${placeId}/media/${media.id}`);
  }
}

export async function addPlaceContribution(placeId: string, input: Omit<PlaceContribution, 'id' | 'placeId' | 'createdAt'>): Promise<PlaceContribution> {
  const createdAt = new Date().toISOString();
  try {
    const contributionRef = await addDoc(collection(requireFirebaseFirestore(), 'places', placeId, 'placeContributions'), { ...input, placeId, createdAt });
    return { id: contributionRef.id, placeId, ...input, createdAt };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `places/${placeId}/placeContributions`);
  }
}
