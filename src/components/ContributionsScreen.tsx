import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, ExternalLink, FilePlus2, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createContribution, deleteContribution, listContributions } from '../firebase/contributions';
import { CONTRIBUTION_TYPES, type Contribution, type ContributionType } from '../types';

interface ContributionsScreenProps {
  onBack: () => void;
}

const labels: Record<ContributionType, string> = {
  place: 'Place',
  restaurant: 'Restaurant',
  hotel: 'Hotel',
  event: 'Event',
  job: 'Job',
  accommodation: 'Accommodation',
  'local-tip': 'Local tip',
  guide: 'Guide',
  photo: 'Photo',
  video: 'Video',
  service: 'Service',
  other: 'Other',
};

const metadataPrompts: Partial<Record<ContributionType, string>> = {
  restaurant: 'Cuisine or price range (optional)',
  hotel: 'Accommodation type or amenities (optional)',
  event: 'Date, time or venue (optional)',
  job: 'Company, position or employment type (optional)',
};

export const ContributionsScreen: React.FC<ContributionsScreenProps> = ({ onBack }) => {
  const { user, userProfile } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [type, setType] = useState<ContributionType>('place');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState(userProfile?.currentCity || '');
  const [link, setLink] = useState('');
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setContributions(await listContributions());
    } catch (loadError) {
      console.error('Could not load contributions:', loadError);
      setError('Contributions are unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!city && userProfile?.currentCity) setCity(userProfile.currentCity);
  }, [userProfile?.currentCity]);

  const typeChoices = useMemo(() => [...CONTRIBUTION_TYPES], []);

  const publish = async () => {
    if (!user || !title.trim() || !description.trim()) {
      setError('Add a title and a short description first.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const contribution = await createContribution({
        authorId: user.uid,
        type,
        title,
        description,
        location,
        city,
        country: userProfile?.currentCountry || 'Brazil',
        links: link.trim() ? [link.trim()] : [],
        metadata: metadata.trim() ? { details: metadata.trim() } : {},
      });
      setContributions((current) => [contribution, ...current]);
      setTitle('');
      setDescription('');
      setLocation('');
      setLink('');
      setMetadata('');
    } catch (publishError) {
      console.error('Could not publish contribution:', publishError);
      setError('We could not publish this contribution yet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (contribution: Contribution) => {
    if (!user || contribution.authorId !== user.uid) return;
    setDeletingId(contribution.id);
    try {
      await deleteContribution(contribution.id);
      setContributions((current) => current.filter((item) => item.id !== contribution.id));
    } catch (deleteError) {
      console.error('Could not delete contribution:', deleteError);
      setError('We could not remove this contribution yet. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-6 flex items-center gap-3"><button type="button" onClick={onBack} aria-label="Back" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Contribution Engine</p><h1 className="text-2xl font-extrabold tracking-tight text-stone-900">What would you like to contribute?</h1></div></header>
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Choose a starting point</p><div className="mt-3 grid grid-cols-2 gap-2">{typeChoices.map((choice) => <button key={choice} type="button" onClick={() => setType(choice)} className={`rounded-2xl border px-3 py-3 text-left text-xs font-bold transition ${type === choice ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-emerald-200'}`}>{labels[choice]}</button>)}</div><div className="mt-5 space-y-3"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={`${labels[type]} name`} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description — what should another person know?" rows={4} className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><div className="grid grid-cols-2 gap-3"><input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /></div><input value={link} onChange={(event) => setLink(event.target.value)} placeholder="Link (optional)" type="url" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" />{metadataPrompts[type] && <input value={metadata} onChange={(event) => setMetadata(event.target.value)} placeholder={metadataPrompts[type]} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" />}<div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900"><div className="flex items-center gap-2 font-bold"><Camera className="h-4 w-4" />Photos and videos are ready for Storage</div><p className="mt-1">Text and links work now. Uploads will activate after Firebase Storage is configured and its rules are published.</p></div><button type="button" onClick={() => void publish()} disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}{saving ? 'Publishing' : 'Publish contribution'}</button></div></section>
      {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      <section className="mt-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Community contributions</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">Useful things, together.</h2></div><FilePlus2 className="h-5 w-5 text-emerald-600" /></div>{loading && <div className="flex min-h-36 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}{!loading && !error && contributions.length === 0 && <div className="mt-4 rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-center"><FilePlus2 className="mx-auto h-7 w-7 text-stone-400" /><h3 className="mt-3 font-bold text-stone-900">No contributions yet.</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Be the first to contribute something about Brazil.</p></div>}{!loading && contributions.length > 0 && <div className="mt-4 space-y-3">{contributions.map((contribution) => <article key={contribution.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{labels[contribution.type]}</span><h3 className="mt-2 font-bold text-stone-900">{contribution.title}</h3></div>{user?.uid === contribution.authorId && <button type="button" onClick={() => void remove(contribution)} disabled={deletingId === contribution.id} aria-label="Delete contribution" className="rounded-xl p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-700">{deletingId === contribution.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>}</div><p className="mt-2 text-sm leading-relaxed text-stone-600">{contribution.description}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-stone-500">{(contribution.city || contribution.location) && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{contribution.location || contribution.city}</span>}{contribution.links[0] && <a href={contribution.links[0]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700"><ExternalLink className="h-3.5 w-3.5" />Open link</a>}</div></article>)}</div>}</section>
    </div>
  );
};
