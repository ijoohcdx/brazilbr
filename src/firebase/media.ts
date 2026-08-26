import type { MediaEntry, MediaKind, MediaReference } from '../types';

const MAX_EXTERNAL_URL_LENGTH = 2000;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov)(\?|#|$)/i;

export interface ExternalURLValidationResult {
  ok: boolean;
  value?: string;
  message?: string;
}

export function normalizeExternalURL(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_EXTERNAL_URL_LENGTH) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validateExternalURL(value: string): ExternalURLValidationResult {
  const normalized = normalizeExternalURL(value);
  return normalized
    ? { ok: true, value: normalized }
    : { ok: false, message: 'Enter a valid http:// or https:// URL up to 2,000 characters.' };
}

export function inferExternalMediaKind(url: string): MediaKind {
  if (IMAGE_EXTENSIONS.test(url)) return 'image';
  if (VIDEO_EXTENSIONS.test(url)) return 'video';
  if (/menu|cardapio/i.test(url)) return 'menu';
  if (/instagram|youtube|booking|hostelworld|maps\.google|google\.com\/maps/i.test(url)) return 'website';
  return 'other';
}

const referenceId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export function createExternalMediaReference(value: string, contributorId: string, type?: MediaKind, caption?: string): MediaReference {
  const validation = validateExternalURL(value);
  if (!validation.ok || !validation.value) throw new Error(validation.message || 'The external URL is invalid.');
  return {
    id: referenceId(),
    externalUrl: validation.value,
    type: type || inferExternalMediaKind(validation.value),
    caption: caption?.trim() || undefined,
    contributorId,
    createdAt: new Date().toISOString(),
  };
}

export function mediaURL(entry: MediaEntry): string {
  return typeof entry === 'string' ? normalizeExternalURL(entry) || '' : normalizeExternalURL(entry.externalUrl) || '';
}

export function mediaKind(entry: MediaEntry): MediaKind {
  return typeof entry === 'string' ? inferExternalMediaKind(entry) : entry.type;
}

export function externalMediaLabel(entry: MediaEntry): string {
  const kind = mediaKind(entry);
  return kind === 'menu' ? 'View menu' : kind === 'website' ? 'Open website' : kind === 'video' ? 'Open video' : kind === 'image' ? 'Open image' : 'Open reference';
}
