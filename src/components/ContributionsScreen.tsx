import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, FilePlus2, Link2, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createContribution, deleteContribution, listContributions } from '../firebase/contributions';
import { createPlace } from '../firebase/places';
import { createExternalMediaReference, mediaURL, normalizeExternalURL, validateExternalURL } from '../firebase/media';
import { ExternalMediaPreview } from './ExternalMediaPreview';
import { CONTRIBUTION_TYPES, type Contribution, type ContributionType, type MediaEntry, type PlaceCategory } from '../types';

interface ContributionsScreenProps { onBack: () => void; onOpenPlace?: (placeId: string) => void; }

const labels: Record<ContributionType, string> = {
  place: 'Add Place', restaurant: 'Restaurant', hostel: 'Hostel', hotel: 'Hotel', cafe: 'Café', coworking: 'Coworking', bar: 'Bar', event: 'Event', job: 'Job', accommodation: 'Accommodation', attraction: 'Attraction', shop: 'Shop', wifi: 'Wi-Fi', camping: 'Camping', 'local-tip': 'Local Tip', guide: 'Guide', photo: 'Photo URL', video: 'Video URL', service: 'Service', other: 'Other',
};
const typeChoices = CONTRIBUTION_TYPES as readonly ContributionType[];
const directPlaceTypes = new Set<ContributionType>(['place', 'restaurant', 'hostel', 'hotel', 'cafe', 'coworking', 'bar', 'event', 'job', 'accommodation', 'attraction', 'shop', 'wifi', 'camping', 'service']);
const placeCategoryForType = (type: ContributionType): PlaceCategory => type === 'place' ? 'other' : type as PlaceCategory;
const metadataPrompts: Partial<Record<ContributionType, string>> = { restaurant: 'Cuisine or price range (optional)', hotel: 'Amenities, room type or breakfast (optional)', hostel: 'Dorm/private room or amenities (optional)', event: 'Date, time or venue (optional)', job: 'Company, position or work mode (optional)', cafe: 'Wi-Fi, outlets or work suitability (optional)', coworking: 'Day pass, workspace or Wi-Fi details (optional)' };

const MediaPreview: React.FC<{ media: MediaEntry[] }> = ({ media }) => media.length > 0 ? <div className="mt-3 grid grid-cols-2 gap-2">{media.map((entry, index) => <ExternalMediaPreview key={`${mediaURL(entry)}-${index}`} entry={entry} className="h-32 w-full" />)}</div> : null;

export const ContributionsScreen: React.FC<ContributionsScreenProps> = ({ onBack, onOpenPlace }) => {
  const { user, userProfile } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [type, setType] = useState<ContributionType>('place');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState(userProfile?.currentCity || '');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');
  const [externalMediaURL, setExternalMediaURL] = useState('');
  const [metadata, setMetadata] = useState('');
  const [createPlaceProfile, setCreatePlaceProfile] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCreatedPlaceId, setLastCreatedPlaceId] = useState<string | null>(null);

  const load = async () => { setLoading(true); setError(null); try { setContributions(await listContributions()); } catch (loadError) { console.error('Could not load contributions:', loadError); setError('Community contributions are unavailable right now. Please try again.'); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (userProfile?.currentCity && !city) setCity(userProfile.currentCity); }, [userProfile?.currentCity, city]);

  const canCreatePlace = useMemo(() => directPlaceTypes.has(type), [type]);
  const publish = async () => {
    if (!user || !title.trim() || !description.trim() || !city.trim()) { setError('Add a title, city and short description first.'); return; }
    setSaving(true); setError(null); setSuccess(null); setLastCreatedPlaceId(null);
    try {
      const normalizedLink = link.trim() ? validateExternalURL(link).value : undefined;
      if (link.trim() && !normalizedLink) throw new Error('Enter a valid http:// or https:// link.');
      const media = externalMediaURL.trim() ? [createExternalMediaReference(externalMediaURL, user.uid)] : [];
      let placeId: string | null = null;
      if (createPlaceProfile && canCreatePlace) {
        const place = await createPlace({ name: title, category: placeCategoryForType(type), description, city, country: userProfile?.currentCountry || 'Brazil', address: location, mapsUrl: normalizedLink && /maps|goo\.gl/i.test(normalizedLink) ? normalizedLink : '', media, createdBy: user.uid });
        placeId = place.id; setLastCreatedPlaceId(place.id);
      }
      const contribution = await createContribution({ authorId: user.uid, type, title, description, location, city, country: userProfile?.currentCountry || 'Brazil', media, links: normalizedLink ? [normalizedLink] : [], metadata: metadata.trim() ? { details: metadata.trim() } : {}, placeId });
      setContributions((current) => [contribution, ...current]);
      setTitle(''); setDescription(''); setLocation(''); setLink(''); setExternalMediaURL(''); setMetadata('');
      setSuccess(placeId ? 'Place Profile and contribution created successfully.' : 'Contribution published successfully.');
    } catch (publishError) { console.error('Could not publish contribution:', publishError); setError(publishError instanceof Error ? publishError.message : 'We could not publish this contribution yet. Please try again.'); }
    finally { setSaving(false); }
  };

  const remove = async (contribution: Contribution) => {
    if (!user || contribution.authorId !== user.uid) return;
    setDeletingId(contribution.id); setError(null); setSuccess(null);
    try { await deleteContribution(contribution); setContributions((current) => current.filter((item) => item.id !== contribution.id)); setSuccess('Contribution deleted.'); }
    catch (deleteError) { console.error('Could not delete contribution:', deleteError); setError('We could not remove this contribution yet. Please try again.'); }
    finally { setDeletingId(null); }
  };

  return <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8"><header className="mb-6 flex items-center gap-3"><button type="button" onClick={onBack} aria-label="Back" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Contribution Engine</p><h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Help the next person.</h1></div></header><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">What are you contributing?</p><div className="mt-3 grid grid-cols-2 gap-2">{typeChoices.map((choice) => <button key={choice} type="button" onClick={() => setType(choice)} className={`rounded-2xl border px-3 py-3 text-left text-xs font-bold transition ${type === choice ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-emerald-200'}`}>{labels[choice]}</button>)}</div><div className="mt-5 space-y-3"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`${labels[type]} name or title`} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description — what should another person know?" rows={4} className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><div className="grid grid-cols-2 gap-3"><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Address or location" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /></div><label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">External link (optional)</span><div className="relative"><Link2 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-emerald-600" /><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Maps, website, menu, Booking, WhatsApp..." type="url" className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500" /></div></label><label className="block"><span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-stone-500">External image or video URL (optional)</span><input value={externalMediaURL} onChange={(event) => setExternalMediaURL(event.target.value)} placeholder="https://example.com/photo.jpg" type="url" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><p className="mt-1 text-[10px] leading-relaxed text-stone-500">BrazilBR stores only the http/https reference. It does not upload, download or proxy the file.</p></label>{metadataPrompts[type] && <input value={metadata} onChange={(event) => setMetadata(event.target.value)} placeholder={metadataPrompts[type]} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" />}{canCreatePlace && <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3"><input type="checkbox" checked={createPlaceProfile} onChange={(event) => setCreatePlaceProfile(event.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" /><span className="text-xs leading-relaxed text-emerald-900"><strong>Create a persistent Place Profile.</strong><br />Other people can add recommendations and corrections later.</span></label>}<button type="button" onClick={() => void publish()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{saving ? 'Publishing' : 'Publish contribution'}</button>{lastCreatedPlaceId && onOpenPlace && <button type="button" onClick={() => onOpenPlace(lastCreatedPlaceId)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><MapPin className="h-4 w-4" />Open the new Place Profile</button>}</div></section>{success && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{success}</div>}{error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}<section className="mt-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Community contributions</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">Useful things, together.</h2></div><FilePlus2 className="h-5 w-5 text-emerald-600" /></div>{loading && <div className="flex min-h-36 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}{!loading && !error && contributions.length === 0 && <div className="mt-4 rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-center"><FilePlus2 className="mx-auto h-7 w-7 text-stone-400" /><h3 className="mt-3 font-bold text-stone-900">Be the first to contribute.</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Add a Place, a link, a menu, an event, a job or a local tip.</p></div>}{!loading && contributions.length > 0 && <div className="mt-4 space-y-3">{contributions.map((contribution) => <article key={contribution.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{labels[contribution.type]}</span><h3 className="mt-2 font-bold text-stone-900">{contribution.title}</h3></div>{user?.uid === contribution.authorId && <button type="button" onClick={() => void remove(contribution)} disabled={deletingId === contribution.id} aria-label="Delete contribution" className="rounded-xl p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-700">{deletingId === contribution.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>}</div><p className="mt-2 text-sm leading-relaxed text-stone-600">{contribution.description}</p><MediaPreview media={contribution.media || []} /><div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-stone-500">{(contribution.city || contribution.location) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{contribution.location || contribution.city}</span>}{normalizeExternalURL(contribution.links[0] || '') && <a href={normalizeExternalURL(contribution.links[0] || '') || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-700"><ExternalLink className="h-3.5 w-3.5" />Open link</a>}{contribution.placeId && onOpenPlace && <button type="button" onClick={() => onOpenPlace(contribution.placeId || '')} className="inline-flex items-center gap-1 text-emerald-700"><MapPin className="h-3.5 w-3.5" />Place Profile</button>}</div></article>)}</div>}</section></div>;
};
