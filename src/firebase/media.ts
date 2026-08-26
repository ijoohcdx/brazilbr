import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { requireFirebaseStorage } from './config';
import type { MediaEntry, MediaKind, MediaOwner, MediaReference } from '../types';

export interface MediaValidationResult {
  ok: boolean;
  message?: string;
  kind?: MediaKind;
}

export const mediaURL = (entry: MediaEntry): string => typeof entry === 'string' ? entry : entry.downloadURL;
export const mediaKind = (entry: MediaEntry): MediaKind | null => typeof entry === 'string' ? null : entry.kind;

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm']);
const PROFILE_MAX_BYTES = 5 * 1024 * 1024;
const MEDIA_MAX_BYTES = 10 * 1024 * 1024;
const VIDEO_MAX_BYTES = 50 * 1024 * 1024;

export const mediaLimits = {
  profile: PROFILE_MAX_BYTES,
  image: MEDIA_MAX_BYTES,
  video: VIDEO_MAX_BYTES,
};

export function validateMediaFile(file: File, owner: MediaOwner): MediaValidationResult {
  const kind = IMAGE_TYPES.has(file.type) ? 'image' : VIDEO_TYPES.has(file.type) ? 'video' : undefined;
  if (!kind) return { ok: false, message: 'Unsupported file type. Use JPG, PNG, WebP, MP4 or WebM.' };
  if (owner === 'profile' && kind !== 'image') return { ok: false, message: 'Profile photos must be JPG, PNG or WebP images.' };
  const maxBytes = owner === 'profile' ? PROFILE_MAX_BYTES : kind === 'video' ? VIDEO_MAX_BYTES : MEDIA_MAX_BYTES;
  if (file.size > maxBytes) return { ok: false, message: `${owner === 'profile' ? 'Profile images' : kind === 'video' ? 'Videos' : 'Images'} must be ${Math.round(maxBytes / (1024 * 1024))} MB or smaller.` };
  return { ok: true, kind };
}

const safeFileName = (file: File) => {
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined;
  const safeExtension = extension && /^[a-z0-9]{1,8}$/.test(extension) ? extension : 'bin';
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${Date.now()}-${randomPart}.${safeExtension}`;
};

export function storagePath(owner: MediaOwner, authorId: string, associatedId: string | undefined, file: File): string {
  const name = safeFileName(file);
  if (owner === 'profile') return `users/${authorId}/profile/${name}`;
  if (owner === 'post') return `users/${authorId}/posts/${associatedId || 'pending'}/${name}`;
  if (owner === 'contribution') return `users/${authorId}/contributions/${associatedId || 'pending'}/${name}`;
  return `places/${associatedId || 'pending'}/${authorId}/${name}`;
}

export async function uploadMedia(file: File, options: { owner: MediaOwner; authorId: string; associatedId?: string }, onProgress?: (progress: number) => void): Promise<MediaReference> {
  const validation = validateMediaFile(file, options.owner);
  if (!validation.ok || !validation.kind) throw new Error(validation.message || 'This file cannot be uploaded.');
  if ((options.owner === 'post' || options.owner === 'contribution') && !options.associatedId) throw new Error('The content must be created before attaching media.');
  if (options.owner === 'place' && !options.associatedId) throw new Error('The Place must be created before attaching media.');

  const path = storagePath(options.owner, options.authorId, options.associatedId, file);
  const storageRef = ref(requireFirebaseStorage(), path);
  const task = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: { authorId: options.authorId, owner: options.owner, associatedId: options.associatedId || '' },
  });

  await new Promise<void>((resolve, reject) => {
    task.on('state_changed', (snapshot) => {
      const progress = snapshot.totalBytes > 0 ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100) : 0;
      onProgress?.(progress);
    }, reject, resolve);
  });

  const downloadURL = await getDownloadURL(task.snapshot.ref);
  return { id: task.snapshot.ref.name, path, downloadURL, contentType: file.type, kind: validation.kind, size: file.size, authorId: options.authorId, owner: options.owner, associatedId: options.associatedId, createdAt: new Date().toISOString() };
}

export async function deleteMedia(media: Pick<MediaReference, 'path'>): Promise<void> {
  await deleteObject(ref(requireFirebaseStorage(), media.path));
}
