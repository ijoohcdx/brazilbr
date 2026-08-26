import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BedDouble, ExternalLink, ImagePlus, Loader2, MapPin, MessageCircle, Phone, Send, ShieldCheck, Sparkles, Trash2, Utensils, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addPlaceContribution, addPlaceMediaReferences, getPlace, listPlaceContributions, listPlaceMedia, removePlaceMediaReference } from '../firebase/places';
import { createExternalMediaReference, mediaURL, normalizeExternalURL, validateExternalURL } from '../firebase/media';
import { ExternalMediaPreview } from './ExternalMediaPreview';
import type { MediaEntry, MediaReference, Place, PlaceContribution } from '../types';

interface PlaceProfileScreenProps { placeId: string; onBack: () => void; onNavigate?: (path: string) => void; }
const placeLabel = (category: Place['category']) => category.replace('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const PlaceGallery: React.FC<{ entries: MediaEntry[]; userId?: string; onDelete?: (entry: MediaReference) => void }> = ({ entries, userId, onDelete }) => {
  const visible = entries.filter((entry) => mediaURL(entry));
  if (visible.length === 0) return <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">No external photos yet. Add the first community reference to help the next nomad.</div>;
  return <div className="mt-4 grid grid-cols-2 gap-2">{visible.slice(0, 12).map((entry, index) => { const reference = typeof entry === 'string' ? null : entry; return <figure key={`${mediaURL(entry)}-${index}`} className="relative overflow-hidden rounded-2xl bg-stone-100"><ExternalMediaPreview entry={entry} className="h-36 w-full" /><figcaption className="absolute inset-x-0 bottom-0 bg-stone-950/65 px-2 py-1.5 text-[10px] text-white">{reference ? `Reference by ${reference.contributorId === userId ? 'you' : 'a community member'}` : 'External community reference'}</figcaption>{reference && reference.contributorId === userId && onDelete && <button type="button" onClick={() => onDelete(reference)} className="absolute right-2 top-2 rounded-full bg-stone-950/70 p-1.5 text-white" aria-label="Delete your external place reference"><Trash2 className="h-3.5 w-3.5" /></button>}</figure>; })}</div>;
};

export const PlaceProfileScreen: React.FC<PlaceProfileScreenProps> = ({ placeId, onBack }) => {
  const { user } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [contributions, setContributions] = useState<PlaceContribution[]>([]);
  const [gallery, setGallery] = useState<MediaReference[]>([]);
  const [kind, setKind] = useState<PlaceContribution['kind']>('recommendation');
  const [text, setText] = useState('');
  const [galleryURL, setGalleryURL] = useState('');
  const [contributionURL, setContributionURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingMedia, setAddingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    const [placeResult, contributionsResult, galleryResult] = await Promise.allSettled([getPlace(placeId), listPlaceContributions(placeId), listPlaceMedia(placeId)]);
    if (placeResult.status === 'rejected') { console.error('Could not load Place Profile:', placeResult.reason); setError('This Place Profile is unavailable right now.'); }
    else setPlace(placeResult.value);
    setContributions(contributionsResult.status === 'fulfilled' ? contributionsResult.value : []);
    setGallery(galleryResult.status === 'fulfilled' ? galleryResult.value : []);
    if (contributionsResult.status === 'rejected') console.warn('Place community contributions could not be loaded.');
    setLoading(false);
  };

  useEffect(() => { void load(); }, [placeId]);
  const legacyMedia = useMemo(() => place?.media || [], [place?.media]);
  const galleryEntries: MediaEntry[] = [...gallery, ...legacyMedia.filter((entry) => typeof entry === 'string' || !gallery.some((item) => item.id === entry.id))];
  const externalLinks = place ? [['Website', place.website], ['Maps', place.mapsUrl], ['Menu', place.menuUrl], ['Booking', place.bookingUrl], ['Hostelworld', place.hostelworldUrl], ['Reservations', place.reservationUrl], ['Instagram', place.instagramUrl], ['Tickets', place.ticketUrl], ['Apply', place.applicationUrl]].map(([label, url]) => [label, normalizeExternalURL(url)] as [string, string | null]).filter((item): item is [string, string] => Boolean(item[1])) : [];

  const addGalleryReference = async () => {
    if (!user || !place || !galleryURL.trim()) return;
    const validation = validateExternalURL(galleryURL);
    if (!validation.ok || !validation.value) { setError(validation.message || 'Enter a valid external URL.'); return; }
    setAddingMedia(true); setError(null); setSuccess(null);
    try {
      const reference = createExternalMediaReference(validation.value, user.uid);
      await addPlaceMediaReferences(place.id, [reference]);
      setGallery((current) => [reference, ...current]); setGalleryURL(''); setSuccess('External media reference added to this Place Profile.');
    } catch (addError) { console.error('Could not add external Place media:', addError); setError('We could not add that external reference yet. Please try again.'); }
    finally { setAddingMedia(false); }
  };

  const deleteGalleryMedia = async (media: MediaReference) => {
    if (!user || media.contributorId !== user.uid) return;
    try { await removePlaceMediaReference(placeId, media, user.uid); setGallery((current) => current.filter((item) => item.id !== media.id)); setSuccess('Your external media reference was deleted.'); }
    catch (deleteError) { console.error('Could not delete Place media reference:', deleteError); setError('We could not delete that reference yet. Please try again.'); }
  };

  const submitContribution = async () => {
    if (!user || !text.trim()) return;
    setSaving(true); setError(null); setSuccess(null);
    try {
      const media = contributionURL.trim() ? [createExternalMediaReference(contributionURL, user.uid, kind === 'photo' ? 'image' : undefined)] : [];
      const contribution = await addPlaceContribution(placeId, { authorId: user.uid, kind, text: text.trim(), media, metadata: {} });
      setContributions((current) => [contribution, ...current]); setText(''); setContributionURL(''); setSuccess('Your community contribution was added.');
    } catch (submitError) { console.error('Could not add Place contribution:', submitError); setError(submitError instanceof Error ? submitError.message : 'We could not add this contribution right now. Please try again.'); }
    finally { setSaving(false); }
  };

  return <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8"><button type="button" onClick={onBack} className="mb-7 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-stone-600 hover:bg-white hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Back to map</button>{loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-7 w-7 animate-spin" /></div>}{error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}{!loading && !place && !error && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><MapPin className="mx-auto h-8 w-8 text-stone-400" /><h1 className="mt-3 font-bold text-stone-900">This Place Profile is not available.</h1></div>}{!loading && place && <div className="space-y-5"><section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{placeLabel(place.category)}</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900">{place.name}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500"><MapPin className="h-4 w-4 text-emerald-600" />{place.city}{place.country ? ` · ${place.country}` : ''}</p></div>{place.verified && <ShieldCheck className="h-6 w-6 text-emerald-600" aria-label="Verified place" />}</div><p className="mt-5 text-sm leading-relaxed text-stone-700">{place.description}</p><PlaceGallery entries={galleryEntries} userId={user?.uid} onDelete={(media) => void deleteGalleryMedia(media)} /><div className="mt-5 grid grid-cols-2 gap-2 text-xs text-stone-600">{place.address && <p className="rounded-2xl bg-stone-50 p-3"><strong>Address</strong><br />{place.address}</p>}{place.priceRange && <p className="rounded-2xl bg-stone-50 p-3"><strong>Price</strong><br />{place.priceRange}</p>}{place.openingHours && <p className="rounded-2xl bg-stone-50 p-3"><strong>Hours</strong><br />{place.openingHours}</p>}{place.wifiAvailable !== null && <p className="rounded-2xl bg-stone-50 p-3"><strong>Wi-Fi</strong><br />{place.wifiAvailable ? 'Available' : 'Not listed'}</p>}{place.roomTypes && <p className="rounded-2xl bg-stone-50 p-3"><strong>Rooms</strong><br />{place.roomTypes}</p>}{place.services.length > 0 && <p className="rounded-2xl bg-stone-50 p-3"><strong>Services</strong><br />{place.services.join(', ')}</p>}</div><div className="mt-5 flex flex-wrap gap-2">{place.phone && <a href={`tel:${place.phone}`} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700"><Phone className="h-3.5 w-3.5" />Call</a>}{place.whatsapp && <a href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}{externalLinks.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700"><ExternalLink className="h-3.5 w-3.5" />{label}</a>)}</div></section><section className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5"><div className="flex items-center gap-2"><ImagePlus className="h-5 w-5 text-emerald-700" /><h2 className="font-bold text-emerald-950">Add an external reference</h2></div><p className="mt-2 text-sm leading-relaxed text-emerald-900">Paste a public image, video or menu URL. BrazilBR stores only the http/https URL; it never uploads, downloads or proxies the file.</p><div className="mt-4 flex gap-2"><input value={galleryURL} onChange={(event) => setGalleryURL(event.target.value)} type="url" placeholder="https://example.com/photo.jpg" className="min-w-0 flex-1 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600" /><button type="button" onClick={() => void addGalleryReference()} disabled={addingMedia || !galleryURL.trim()} className="shrink-0 rounded-2xl bg-emerald-700 px-3 py-3 text-xs font-bold text-white disabled:opacity-60">{addingMedia ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}</button></div></section><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-600" /><h2 className="font-bold text-stone-900">Improve this place</h2></div><p className="mt-2 text-sm leading-relaxed text-stone-600">Add a recommendation, correction, menu note, Wi-Fi detail or review. Your authorship stays attached.</p>{success && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">{success}</div>}<div className="mt-4 space-y-3"><select value={kind} onChange={(event) => setKind(event.target.value as PlaceContribution['kind'])} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"><option value="recommendation">Recommendation</option><option value="correction">Correction</option><option value="menu">Menu information</option><option value="wifi">Wi-Fi information</option><option value="tip">Local tip</option><option value="review">Review</option><option value="photo">Photo URL</option></select><textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder="What should another nomad know?" className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><input value={contributionURL} onChange={(event) => setContributionURL(event.target.value)} type="url" placeholder="Related menu, Maps or image URL (optional)" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><button type="button" onClick={() => void submitContribution()} disabled={saving || !text.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{saving ? 'Adding' : 'Add contribution'}</button></div></section><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-stone-900">Community knowledge</h2><span className="text-xs font-semibold text-stone-500">{contributions.length}</span></div>{contributions.length === 0 ? <p className="mt-3 rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">No community contributions yet. Be the first to improve this profile.</p> : <div className="mt-4 space-y-3">{contributions.map((item) => <article key={item.id} className="rounded-2xl bg-stone-50 p-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{item.kind}</span><span className="text-[10px] text-stone-500">{new Date(item.createdAt).toLocaleDateString()}</span></div><p className="mt-2 text-sm leading-relaxed text-stone-700">{item.text}</p>{item.media?.length > 0 && <div className="mt-2 grid grid-cols-2 gap-2">{item.media.map((entry, index) => <ExternalMediaPreview key={`${mediaURL(entry)}-${index}`} entry={entry} className="h-28 w-full" />)}</div>}<p className="mt-2 text-[10px] text-stone-500">Added by a BrazilBR community member</p></article>)}</div>}</section><div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-stone-500"><div className="rounded-2xl bg-white p-3"><BedDouble className="mx-auto h-4 w-4 text-emerald-600" /><span className="mt-1 block">Sleep</span></div><div className="rounded-2xl bg-white p-3"><Utensils className="mx-auto h-4 w-4 text-amber-600" /><span className="mt-1 block">Food</span></div><div className="rounded-2xl bg-white p-3"><Wifi className="mx-auto h-4 w-4 text-sky-600" /><span className="mt-1 block">Internet</span></div></div></div>}</div>;
};
