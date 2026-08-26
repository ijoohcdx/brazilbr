import React, { useEffect, useState } from 'react';
import { ArrowLeft, BedDouble, CalendarDays, ExternalLink, Loader2, MapPin, MessageCircle, Phone, Send, ShieldCheck, Sparkles, Utensils, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addPlaceContribution, getPlace, listPlaceContributions } from '../firebase/places';
import type { Place, PlaceContribution } from '../types';

interface PlaceProfileScreenProps {
  placeId: string;
  onBack: () => void;
  onNavigate: (path: string) => void;
}

const placeLabel = (category: string) => category.replace('-', ' ');

export const PlaceProfileScreen: React.FC<PlaceProfileScreenProps> = ({ placeId, onBack, onNavigate }) => {
  const { user } = useAuth();
  const [place, setPlace] = useState<Place | null>(null);
  const [contributions, setContributions] = useState<PlaceContribution[]>([]);
  const [text, setText] = useState('');
  const [kind, setKind] = useState<PlaceContribution['kind']>('recommendation');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const placeItem = await getPlace(placeId);
      setPlace(placeItem);
      if (placeItem) setContributions(await listPlaceContributions(placeId));
    } catch (loadError) {
      console.error('Could not load place profile:', loadError);
      setError('This place profile is unavailable right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [placeId]);

  const submitContribution = async () => {
    if (!user || !text.trim()) return;
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const contribution = await addPlaceContribution(placeId, { authorId: user.uid, kind, text: text.trim(), media: [], metadata: {} });
      setContributions((current) => [contribution, ...current]);
      setText('');
      setSuccess('Your community contribution was added.');
    } catch (saveError) {
      console.error('Could not add place contribution:', saveError);
      setError('We could not add this contribution yet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const externalLinks = [
    ['Website', place?.website], ['Google Maps', place?.mapsUrl], ['Menu', place?.menuUrl], ['Booking', place?.bookingUrl], ['Hostelworld', place?.hostelworldUrl], ['Reservations', place?.reservationUrl], ['Instagram', place?.instagramUrl], ['Ticket', place?.ticketUrl], ['Apply', place?.applicationUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <button type="button" onClick={onBack} className="mb-7 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-stone-600 hover:bg-white hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Back to map</button>
      {loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-7 w-7 animate-spin" /></div>}
      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {!loading && !place && !error && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><MapPin className="mx-auto h-8 w-8 text-stone-400" /><h1 className="mt-3 font-bold text-stone-900">This place profile is not available.</h1></div>}
      {!loading && place && <div className="space-y-5"><section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{placeLabel(place.category)}</span><h1 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900">{place.name}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-stone-500"><MapPin className="h-4 w-4 text-emerald-600" />{place.city}{place.country ? ` · ${place.country}` : ''}</p></div>{place.verified && <ShieldCheck className="h-6 w-6 text-emerald-600" aria-label="Verified place" />}</div><p className="mt-5 text-sm leading-relaxed text-stone-700">{place.description}</p>{place.media.length > 0 ? <div className="mt-5 grid grid-cols-2 gap-2">{place.media.slice(0, 4).map((mediaUrl) => <img key={mediaUrl} src={mediaUrl} alt={place.name} className="h-32 w-full rounded-2xl object-cover" loading="lazy" />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">Photo uploads will be available shortly. Community photo references will appear here after Storage is configured.</div>}<div className="mt-5 grid grid-cols-2 gap-2 text-xs text-stone-600">{place.address && <p className="rounded-2xl bg-stone-50 p-3"><strong>Address</strong><br />{place.address}</p>}{place.priceRange && <p className="rounded-2xl bg-stone-50 p-3"><strong>Price</strong><br />{place.priceRange}</p>}{place.openingHours && <p className="rounded-2xl bg-stone-50 p-3"><strong>Hours</strong><br />{place.openingHours}</p>}{place.wifiAvailable !== null && <p className="rounded-2xl bg-stone-50 p-3"><strong>Wi-Fi</strong><br />{place.wifiAvailable ? 'Available' : 'Not listed'}</p>}{place.roomTypes && <p className="rounded-2xl bg-stone-50 p-3"><strong>Rooms</strong><br />{place.roomTypes}</p>}{place.services.length > 0 && <p className="rounded-2xl bg-stone-50 p-3"><strong>Services</strong><br />{place.services.join(', ')}</p>}</div><div className="mt-5 flex flex-wrap gap-2">{place.phone && <a href={`tel:${place.phone}`} className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700"><Phone className="h-3.5 w-3.5" />Call</a>}{place.whatsapp && <a href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}{externalLinks.map(([label, url]) => <a key={label} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-700"><ExternalLink className="h-3.5 w-3.5" />{label}</a>)}</div></section>
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-600" /><h2 className="font-bold text-stone-900">Improve this place</h2></div><p className="mt-2 text-sm leading-relaxed text-stone-600">Add a recommendation, correction, menu note, Wi-Fi detail or review. Your authorship stays attached.</p>{success && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">{success}</div>}<div className="mt-4 space-y-3"><select value={kind} onChange={(event) => setKind(event.target.value as PlaceContribution['kind'])} className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"><option value="recommendation">Recommendation</option><option value="correction">Correction</option><option value="menu">Menu information</option><option value="wifi">Wi-Fi information</option><option value="tip">Local tip</option><option value="review">Review</option><option value="photo">Photo reference (Storage later)</option></select><textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder="What should another nomad know?" className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500" /><button type="button" onClick={() => void submitContribution()} disabled={saving || !text.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{saving ? 'Adding' : 'Add contribution'}</button></div></section>
      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-stone-900">Community knowledge</h2><span className="text-xs font-semibold text-stone-500">{contributions.length}</span></div>{contributions.length === 0 ? <p className="mt-3 rounded-2xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">No community contributions yet. Be the first to improve this profile.</p> : <div className="mt-4 space-y-3">{contributions.map((item) => <article key={item.id} className="rounded-2xl bg-stone-50 p-3"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{item.kind}</span><span className="text-[10px] text-stone-500">{new Date(item.createdAt).toLocaleDateString()}</span></div><p className="mt-2 text-sm leading-relaxed text-stone-700">{item.text}</p><p className="mt-2 text-[10px] text-stone-500">Added by a BrazilBR community member</p></article>)}</div>}</section>
      <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-stone-500"><div className="rounded-2xl bg-white p-3"><BedDouble className="mx-auto h-4 w-4 text-emerald-600" /><span className="mt-1 block">Sleep</span></div><div className="rounded-2xl bg-white p-3"><Utensils className="mx-auto h-4 w-4 text-amber-600" /><span className="mt-1 block">Food</span></div><div className="rounded-2xl bg-white p-3"><Wifi className="mx-auto h-4 w-4 text-sky-600" /><span className="mt-1 block">Internet</span></div></div></div>}
    </div>
  );
};
