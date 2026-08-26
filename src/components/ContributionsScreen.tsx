import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, FilePlus2, ImagePlus, Loader2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { attachContributionMedia, createContribution, deleteContribution, listContributions } from '../firebase/contributions';
import { attachPlaceMedia, cleanupPlaceMediaReferences, createPlace } from '../firebase/places';
import { mediaURL, uploadMedia, validateMediaFile } from '../firebase/media';
import { CONTRIBUTION_TYPES, type Contribution, type ContributionType, type MediaEntry, type MediaReference, type PlaceCategory } from '../types';

interface ContributionsScreenProps {
  onBack: () => void;
  onOpenPlace?: (placeId: string) => void;
}

const labels: Record<ContributionType, string> = {
  place: 'Place', restaurant: 'Restaurant', hostel: 'Hostel', hotel: 'Hotel', cafe: 'Café', coworking: 'Coworking', bar: 'Bar', event: 'Event', job: 'Job', accommodation: 'Accommodation', attraction: 'Attraction', shop: 'Shop', wifi: 'Wi-Fi spot', camping: 'Camping', 'local-tip': 'Local tip', guide: 'Guide', photo: 'Photo', video: 'Video', service: 'Service', other: 'Other',
};

const directPlaceTypes = new Set<ContributionType>(['place', 'restaurant', 'hostel', 'hotel', 'cafe', 'coworking', 'bar', 'event', 'job', 'accommodation', 'attraction', 'shop', 'wifi', 'camping', 'service']);
const placeCategoryForType = (type: ContributionType): PlaceCategory => type === 'place' ? 'other' : type as PlaceCategory;
const metadataPrompts: Partial<Record<ContributionType, string>> = { restaurant: 'Cuisine or price range (optional)', hotel: 'Amenities, room type or breakfast (optional)', hostel: 'Dorm/private room or amenities (optional)', event: 'Date, time or venue (optional)', job: 'Company, position or work mode (optional)', cafe: 'Wi-Fi, outlets or work suitability (optional)', coworking: 'Day pass, workspace or Wi-Fi details (optional)' };

const MediaPreview: React.FC<{ media: MediaEntry[] }> = ({ media }) => media.length > 0 ? <div className="mt-3 grid grid-cols-2 gap-2">{media.slice(0, 4).map((item, index) => <div key={`${mediaURL(item)}-${index}`} className="overflow-hidden rounded-2xl bg-stone-100">{(typeof item !== 'string' && item.kind === 'video') || /\.(mp4|webm)(\?|$)/i.test(mediaURL(item)) ? <video src={mediaURL(item)} controls preload="metadata" className="h-32 w-full object-cover" /> : <img src={mediaURL(item)} alt="Contribution media" loading="lazy" className="h-32 w-full object-cover" />}</div>)}</div> : null;

export const ContributionsScreen: React.FC<ContributionsScreenProps> = ({ onBack, onOpenPlace }) => {
  const { user, userProfile } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [type, setType] = useState<ContributionType>('place');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState(userProfile?.currentCity || '');
  const [link, setLink] = useState('');
  const [metadata, setMetadata] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [retryFiles, setRetryFiles] = useState<Record<string, File[]>>({});
  const [createPlaceProfile, setCreatePlaceProfile] = useState(true);
  const [lastCreatedPlaceId, setLastCreatedPlaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setContributions(await listContributions()); }
    catch (loadError) { console.error('Could not load contributions:', loadError); setError('Contributions are unavailable right now. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => { if (!city && userProfile?.currentCity) setCity(userProfile.currentCity); }, [userProfile?.currentCity]);

  const typeChoices = useMemo(() => [...CONTRIBUTION_TYPES], []);
  const canCreatePlace = directPlaceTypes.has(type);

  const uploadContributionFiles = async (files: File[], contributionId: string, placeId: string | null): Promise<MediaReference[]> => {
    if (!user) throw new Error('You must be signed in to upload media.');
    const references: MediaReference[] = [];
    for (const [index, file] of files.entries()) {
      references.push(await uploadMedia(file, { owner: placeId ? 'place' : 'contribution', authorId: user.uid, associatedId: placeId || contributionId }, (progress) => setUploadProgress(Math.round(((index + progress / 100) / files.length) * 100))));
    }
    return references;
  };

  const publish = async () => {
    if (!user || !title.trim() || !description.trim()) { setError('Add a title and a short description first.'); return; }
    const files = mediaFiles;
    setSaving(true); setUploadProgress(files.length > 0 ? 0 : null); setError(null); setSuccess(null); setLastCreatedPlaceId(null);
    let createdContribution: Contribution | null = null;
    try {
      let placeId: string | null = null;
      if (canCreatePlace && createPlaceProfile) {
        const place = await createPlace({ name: title, category: placeCategoryForType(type), description, address: location, city, country: userProfile?.currentCountry || 'Brazil', website: link, createdBy: user.uid });
        placeId = place.id; setLastCreatedPlaceId(place.id);
      }
      createdContribution = await createContribution({ authorId: user.uid, type, title, description, location, city, country: userProfile?.currentCountry || 'Brazil', media: [], links: link.trim() ? [link.trim()] : [], metadata: metadata.trim() ? { details: metadata.trim() } : {}, placeId });
      setContributions((current) => [createdContribution as Contribution, ...current]);
      setTitle(''); setDescription(''); setLocation(''); setLink(''); setMetadata(''); setMediaFiles([]);
      if (files.length > 0) {
        const references = await uploadContributionFiles(files, createdContribution.id, placeId);
        await attachContributionMedia(createdContribution.id, references);
        if (placeId) {
          try { await attachPlaceMedia(placeId, references); }
          catch (placeError) { await cleanupPlaceMediaReferences(placeId, references); throw placeError; }
        }
        setContributions((current) => current.map((item) => item.id === createdContribution?.id ? { ...item, media: references } : item));
        setSuccess('Contribution and media published successfully.');
      } else setSuccess('Contribution published successfully.');
    } catch (publishError) {
      console.error('Could not publish contribution or media:', publishError);
      if (createdContribution && files.length > 0) { setRetryFiles((current) => ({ ...current, [createdContribution?.id || '']: files })); setError('Your contribution was saved, but the media upload failed. Retry it below.'); }
      else setError('We could not publish this contribution yet. Please try again.');
    } finally { setSaving(false); setUploadProgress(null); }
  };

  const retryMedia = async (contribution: Contribution) => {
    const files = retryFiles[contribution.id];
    if (!files || !user) return;
    setUploadingFor(contribution.id); setUploadProgress(0); setError(null); setSuccess(null);
    try {
      const references = await uploadContributionFiles(files, contribution.id, contribution.placeId || null);
      await attachContributionMedia(contribution.id, references);
      if (contribution.placeId) {
        try { await attachPlaceMedia(contribution.placeId, references); }
        catch (placeError) { await cleanupPlaceMediaReferences(contribution.placeId, references); throw placeError; }
      }
      setContributions((current) => current.map((item) => item.id === contribution.id ? { ...item, media: references } : item));
      setRetryFiles((current) => { const next = { ...current }; delete next[contribution.id]; return next; });
      setSuccess('Contribution media uploaded successfully.');
    } catch (retryError) { console.error('Could not retry contribution media:', retryError); setError('Media upload failed again. Check your connection and retry.'); }
    finally { setUploadingFor(null); setUploadProgress(null); }
  };

  const chooseMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []) as File[];
    event.target.value = '';
    const valid: File[] = []; const invalid: string[] = [];
    selected.slice(0, 6).forEach((file) => { const result = validateMediaFile(file, 'contribution'); if (result.ok) valid.push(file); else invalid.push(result.message || file.name); });
    setMediaFiles(valid); setError(invalid.length > 0 ? invalid.join(' ') : null);
  };

  const remove = async (contribution: Contribution) => {
    if (!user || contribution.authorId !== user.uid) return;
    setDeletingId(contribution.id);
    try { await deleteContribution(contribution); setContributions((current) => current.filter((item) => item.id !== contribution.id)); }
    catch (deleteError) { console.error('Could not delete contribution:', deleteError); setError('We could not remove this contribution yet. Please try again.'); }
    finally { setDeletingId(null); }
  };

  return <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8"><header className="mb-6 flex items-center gap-3"><button type="button" onClick={onBack} aria-label="Back" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Contribution Engine</p><h1 className="text-2xl font-extrabold tracking-tight text-stone-900">What would you like to contribute?</h1></div></header><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Choose a starting point</p><div className="mt-3 grid grid-cols-2 gap-2">{typeChoices.map((choice) => <button key={choice} type="button" onClick={() => setType(choice)} className={`rounded-2xl border px-3 py-3 text-left text-xs font-bold transition ${type === choice ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-emerald-200'}`}>{labels[choice]}</button>)}</div><div className="mt-5 space-y-3"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`${labels[type]} name`} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description — what should another person know?" rows={4} className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><div className="grid grid-cols-2 gap-3"><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Address or location" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /></div><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Website, Maps or booking link (optional)" type="url" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" />{metadataPrompts[type] && <input value={metadata} onChange={(event) => setMetadata(event.target.value)} placeholder={metadataPrompts[type]} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" />}{canCreatePlace && <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3"><input type="checkbox" checked={createPlaceProfile} onChange={(event) => setCreatePlaceProfile(event.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" /><span className="text-xs leading-relaxed text-emerald-900"><strong>Create a persistent Place Profile.</strong><br />Other people can add recommendations and corrections later.</span></label>}<label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3"><ImagePlus className="h-4 w-4 text-emerald-700" /><span className="flex-1 text-xs leading-relaxed text-stone-700"><strong>Add photos or a video.</strong><br />Images up to 10 MB; videos up to 50 MB.</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={chooseMedia} className="w-24 text-[10px]" /></label>{mediaFiles.length > 0 && <div className="flex flex-wrap gap-2">{mediaFiles.map((file) => <span key={`${file.name}-${file.size}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800"><span className="max-w-36 truncate">{file.name}</span><button type="button" onClick={() => setMediaFiles((current) => current.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}><X className="h-3 w-3" /></button></span>)}</div>}<button type="button" onClick={() => void publish()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{saving ? uploadProgress !== null ? `Uploading ${uploadProgress}%` : 'Publishing' : 'Publish contribution'}</button>{lastCreatedPlaceId && onOpenPlace && <button type="button" onClick={() => onOpenPlace(lastCreatedPlaceId)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><MapPin className="h-4 w-4" />Open the new Place Profile</button>}</div></section>{success && <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{success}</div>}{error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}<section className="mt-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Community contributions</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">Useful things, together.</h2></div><FilePlus2 className="h-5 w-5 text-emerald-600" /></div>{loading && <div className="flex min-h-36 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}{!loading && !error && contributions.length === 0 && <div className="mt-4 rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-center"><FilePlus2 className="mx-auto h-7 w-7 text-stone-400" /><h3 className="mt-3 font-bold text-stone-900">No contributions yet.</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Be the first to contribute something useful.</p></div>}{!loading && contributions.length > 0 && <div className="mt-4 space-y-3">{contributions.map((contribution) => <article key={contribution.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{labels[contribution.type]}</span><h3 className="mt-2 font-bold text-stone-900">{contribution.title}</h3></div>{user?.uid === contribution.authorId && <button type="button" onClick={() => void remove(contribution)} disabled={deletingId === contribution.id} aria-label="Delete contribution" className="rounded-xl p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-700">{deletingId === contribution.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>}</div><p className="mt-2 text-sm leading-relaxed text-stone-600">{contribution.description}</p><MediaPreview media={contribution.media || []} />{retryFiles[contribution.id] && <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3"><p className="text-xs leading-relaxed text-amber-900">Media upload failed. Your contribution is safe.</p><button type="button" onClick={() => void retryMedia(contribution)} disabled={uploadingFor === contribution.id} className="shrink-0 rounded-xl bg-amber-500 px-3 py-2 text-[11px] font-bold text-amber-950 disabled:opacity-50">{uploadingFor === contribution.id ? 'Retrying' : 'Retry'}</button></div>}<div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-stone-500">{(contribution.city || contribution.location) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{contribution.location || contribution.city}</span>}{contribution.links[0] && <a href={contribution.links[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700"><ExternalLink className="h-3.5 w-3.5" />Open link</a>}{contribution.placeId && onOpenPlace && <button type="button" onClick={() => onOpenPlace(contribution.placeId || '')} className="inline-flex items-center gap-1 text-emerald-700"><MapPin className="h-3.5 w-3.5" />Place Profile</button>}</div></article>)}</div>}</section></div>;
};
