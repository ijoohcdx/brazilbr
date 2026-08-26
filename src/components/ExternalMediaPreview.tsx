import React, { useState } from 'react';
import { ExternalLink, ImageOff, Loader2 } from 'lucide-react';
import { externalMediaLabel, mediaKind, mediaURL } from '../firebase/media';
import type { MediaEntry } from '../types';

interface ExternalMediaPreviewProps {
  entry: MediaEntry;
  className?: string;
}

export const ExternalMediaPreview: React.FC<ExternalMediaPreviewProps> = ({ entry, className = 'h-40 w-full' }) => {
  const url = mediaURL(entry);
  const kind = mediaKind(entry);
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>(kind === 'image' || kind === 'video' ? 'loading' : 'loaded');

  if (!url) return <UnavailableMedia className={className} />;
  if (kind !== 'image' && kind !== 'video') return <a href={url} target="_blank" rel="noopener noreferrer" className={`flex ${className} items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 text-center text-xs font-bold text-emerald-800`}>{externalMediaLabel(entry)}<ExternalLink className="h-3.5 w-3.5" /></a>;
  if (state === 'error') return <UnavailableMedia className={className} />;

  return <div className={`relative overflow-hidden rounded-2xl bg-stone-100 ${className}`}>
    {state === 'loading' && <div className="absolute inset-0 z-10 flex items-center justify-center text-emerald-700"><Loader2 className="h-5 w-5 animate-spin" /></div>}
    {kind === 'video' ? <video src={url} controls preload="metadata" onLoadedData={() => setState('loaded')} onError={() => setState('error')} className="h-full w-full object-cover" /> : <img src={url} alt={typeof entry === 'string' ? 'External community media' : entry.caption || 'External community media'} loading="lazy" onLoad={() => setState('loaded')} onError={() => setState('error')} className="h-full w-full object-cover" />}
  </div>;
};

const UnavailableMedia: React.FC<{ className: string }> = ({ className }) => <div className={`flex ${className} items-center justify-center gap-2 rounded-2xl bg-stone-100 px-3 text-center text-xs font-semibold text-stone-500`}><ImageOff className="h-4 w-4" />Image unavailable</div>;
