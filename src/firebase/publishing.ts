import { collection, doc, writeBatch } from '@firebase/firestore';
import { requireFirebaseFirestore } from './config';
import { handleFirestoreError } from './userProfile';
import { OperationType, type Contribution, type ContributionType, type MediaEntry, type Place, type PlaceCategory } from '../types';
import type { PlaceInput } from './places';

const asText = (value: string | undefined | null) => value?.trim() || '';

export interface PlaceAndContributionInput {
  place: PlaceInput;
  contribution: {
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
  };
}

function buildPlace(input: PlaceInput, id: string, now: string): Place {
  const name = asText(input.name);
  const description = asText(input.description);
  const city = asText(input.city);
  if (!name || !description || !city) throw new Error('Place name, description and city are required.');

  return {
    id,
    name,
    category: input.category as PlaceCategory,
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
}

export async function createPlaceAndContribution(input: PlaceAndContributionInput): Promise<{ place: Place; contribution: Contribution }> {
  const title = input.contribution.title.trim();
  const description = input.contribution.description.trim();
  const city = input.contribution.city.trim();
  if (!title || !description || !city) throw new Error('Contribution title, description and city are required.');

  const firestore = requireFirebaseFirestore();
  const placeRef = doc(collection(firestore, 'places'));
  const contributionRef = doc(collection(firestore, 'contributions'));
  const now = new Date().toISOString();
  const place = buildPlace(input.place, placeRef.id, now);
  const contribution: Contribution = {
    id: contributionRef.id,
    authorId: input.contribution.authorId,
    type: input.contribution.type,
    title,
    description,
    location: input.contribution.location.trim(),
    city,
    country: input.contribution.country.trim() || 'Brazil',
    media: input.contribution.media || [],
    links: input.contribution.links || [],
    metadata: input.contribution.metadata || {},
    placeId: place.id,
    status: 'published',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const batch = writeBatch(firestore);
    batch.set(placeRef, place);
    batch.set(contributionRef, contribution);
    await batch.commit();
    return { place, contribution };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `places/${place.id}/with-contribution`);
  }
}
