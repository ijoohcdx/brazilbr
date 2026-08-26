import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BedDouble, BriefcaseBusiness, CalendarDays, Compass, Loader2, MapPinned, MessageCircle, Navigation, Search, Sparkles, Utensils, UsersRound, Wifi } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listMapProfiles, type PublicUserProfile } from '../firebase/discovery';
import { listPlaces } from '../firebase/places';
import type { Place, PlaceCategory } from '../types';
import { PrimaryNav } from './PrimaryNav';

interface MapScreenProps {
  onNavigate: (path: string) => void;
  onOpenPlace: (placeId: string) => void;
  onOpenProfile: (uid: string) => void;
}

type MapFilter = 'all' | 'people' | 'sleep' | 'food' | 'internet' | 'work' | 'events' | 'places';
type Coordinates = L.LatLngTuple;

const filters: { id: MapFilter; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Compass }, { id: 'people', label: 'People', icon: UsersRound }, { id: 'sleep', label: 'Sleep', icon: BedDouble }, { id: 'food', label: 'Food', icon: Utensils }, { id: 'internet', label: 'Internet', icon: Wifi }, { id: 'work', label: 'Work', icon: BriefcaseBusiness }, { id: 'events', label: 'Events', icon: CalendarDays }, { id: 'places', label: 'Places', icon: MapPinned },
];

const placeBuckets: Record<Exclude<MapFilter, 'all' | 'people'>, PlaceCategory[]> = {
  sleep: ['hostel', 'hotel', 'accommodation', 'camping'], food: ['restaurant', 'cafe', 'bar'], internet: ['cafe', 'coworking', 'wifi'], work: ['coworking', 'job'], events: ['event'], places: ['attraction', 'shop', 'service', 'other'],
};

const cityCoordinates: Record<string, Coordinates> = {
  'sao paulo': [-23.5505, -46.6333], 'são paulo': [-23.5505, -46.6333], rio: [-22.9068, -43.1729], 'rio de janeiro': [-22.9068, -43.1729], fortaleza: [-3.7319, -38.5267], recife: [-8.0476, -34.877], salvador: [-12.9777, -38.5016], brasilia: [-15.7939, -47.8828], brasília: [-15.7939, -47.8828], 'belo horizonte': [-19.9167, -43.9345], curitiba: [-25.4284, -49.2733], florianopolis: [-27.5949, -48.5482], florianópolis: [-27.5949, -48.5482], manaus: [-3.119, -60.0217], 'porto alegre': [-30.0346, -51.2177], natal: [-5.7945, -35.211], joao: [-7.115, -34.864], 'joão pessoa': [-7.115, -34.864],
};

const coordinatesForCity = (city: string): Coordinates => cityCoordinates[city.trim().toLowerCase()] || [-14.235, -51.9253];
const coordinatesForPlace = (place: Place): Coordinates => typeof place.latitude === 'number' && typeof place.longitude === 'number' ? [place.latitude, place.longitude] : coordinatesForCity(place.city);
const coordinatesForPerson = (profile: PublicUserProfile): Coordinates => coordinatesForCity(profile.currentCity);
const escapeHtml = (value: string) => value.replace(/[&<>\"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[character] || character));

const placeIcon = () => L.divIcon({ className: 'brazilbr-place-marker', html: '<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:3px solid white;border-radius:9999px;background:#f59e0b;color:#451a03;box-shadow:0 2px 7px rgba(0,0,0,.22);font-size:16px">●</span>', iconSize: [30, 30], iconAnchor: [15, 15] });
const personIcon = () => L.divIcon({ className: 'brazilbr-person-marker', html: '<span style="display:flex;width:30px;height:30px;align-items:center;justify-content:center;border:3px solid white;border-radius:9999px;background:#059669;color:white;box-shadow:0 2px 7px rgba(0,0,0,.22);font-size:14px">●</span>', iconSize: [30, 30], iconAnchor: [15, 15] });

export const MapScreen: React.FC<MapScreenProps> = ({ onNavigate, onOpenPlace, onOpenProfile }) => {
  const { user, userProfile } = useAuth();
  const [filter, setFilter] = useState<MapFilter>('all');
  const [city, setCity] = useState(userProfile?.currentCity || '');
  const [draftCity, setDraftCity] = useState(userProfile?.currentCity || '');
  const [places, setPlaces] = useState<Place[]>([]);
  const [people, setPeople] = useState<PublicUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const visiblePlaces = useMemo(() => filter === 'all' ? places : filter === 'people' ? [] : places.filter((place) => placeBuckets[filter].includes(place.category)), [filter, places]);
  const visiblePeople = filter === 'people' || filter === 'all' ? people : [];

  const load = async (selectedCity = city) => {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      const [placesResult, peopleResult] = await Promise.allSettled([
        listPlaces({ city: selectedCity.trim() || undefined }),
        listMapProfiles(user.uid, selectedCity.trim() || undefined),
      ]);
      const placesLoaded = placesResult.status === 'fulfilled';
      const peopleLoaded = peopleResult.status === 'fulfilled';
      setPlaces(placesLoaded ? placesResult.value : []);
      setPeople(peopleLoaded ? peopleResult.value : []);
      if (!placesLoaded && !peopleLoaded) {
        const loadError = placesResult.status === 'rejected' ? placesResult.reason : peopleResult.reason;
        console.error('Could not load BrazilBR map:', loadError);
        setError('The map data is unavailable right now. Please try again.');
      } else if (!placesLoaded || !peopleLoaded) {
        const partialError = placesResult.status === 'rejected' ? placesResult.reason : peopleResult.status === 'rejected' ? peopleResult.reason : undefined;
        console.warn('Part of the BrazilBR map data could not be loaded:', partialError);
        setError('Some map data is temporarily unavailable; showing what we could load.');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;
    const map = L.map(mapElementRef.current, { center: [-14.235, -51.9253], zoom: 4, minZoom: 3, maxZoom: 17, zoomControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 }).addTo(map);
    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markerLayerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = markerLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const markerCoordinates: Coordinates[] = [];
    visiblePlaces.forEach((place) => {
      const coordinates = coordinatesForPlace(place);
      markerCoordinates.push(coordinates);
      L.marker(coordinates, { icon: placeIcon(), title: place.name }).bindPopup(`<strong>${escapeHtml(place.name)}</strong><br /><span>${escapeHtml(place.city)} · ${escapeHtml(place.category.replace('-', ' '))}</span><br /><button data-place-id="${escapeHtml(place.id)}" style="margin-top:8px;border:0;border-radius:8px;background:#059669;color:white;padding:6px 9px;font-weight:700;cursor:pointer">Open Place Profile</button>`).on('popupopen', (event) => {
        const button = event.popup.getElement()?.querySelector('[data-place-id]');
        button?.addEventListener('click', () => onOpenPlace(place.id));
      }).addTo(layer);
    });
    visiblePeople.forEach((profile) => {
      const coordinates = coordinatesForPerson(profile);
      markerCoordinates.push(coordinates);
      L.marker(coordinates, { icon: personIcon(), title: profile.displayName || 'BrazilBR person' }).bindPopup(`<strong>${escapeHtml(profile.displayName || 'BrazilBR person')}</strong><br /><span>${escapeHtml(profile.currentCity || 'Brazil')} · city-level visibility</span><br /><button data-profile-id="${escapeHtml(profile.uid)}" style="margin-top:8px;border:0;border-radius:8px;background:#059669;color:white;padding:6px 9px;font-weight:700;cursor:pointer">Open Profile</button>`).on('popupopen', (event) => {
        const button = event.popup.getElement()?.querySelector('[data-profile-id]');
        button?.addEventListener('click', () => onOpenProfile(profile.uid));
      }).addTo(layer);
    });
    if (markerCoordinates.length > 0) map.fitBounds(L.latLngBounds(markerCoordinates), { padding: [28, 28], maxZoom: city ? 12 : 6 });
    else map.setView(city ? coordinatesForCity(city) : [-14.235, -51.9253], city ? 7 : 4);
  }, [city, onOpenPlace, onOpenProfile, visiblePlaces, visiblePeople]);

  useEffect(() => {
    if (!city && userProfile?.currentCity) { setCity(userProfile.currentCity); setDraftCity(userProfile.currentCity); }
  }, [userProfile?.currentCity]);
  useEffect(() => { void load(); }, [user?.uid, city]);

  const hasMarkers = visiblePlaces.length > 0 || visiblePeople.length > 0;
  const chooseCity = () => setCity(draftCity.trim());

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">BrazilBR map</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">Find your next useful place.</h1><p className="mt-2 text-sm leading-relaxed text-stone-600">A living map of people and community knowledge, starting at city level.</p></div><button type="button" onClick={() => onNavigate('/contribute')} className="rounded-2xl bg-emerald-600 p-3 text-white shadow-sm" aria-label="Add contribution"><Sparkles className="h-5 w-5" /></button></header>
      <section className="mt-5 flex gap-2"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" /><input value={draftCity} onChange={(event) => setDraftCity(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') chooseCity(); }} placeholder="Choose a city, e.g. Recife" className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" /></div><button type="button" onClick={chooseCity} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-emerald-800">Go</button></section>
      <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">{filters.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setFilter(id)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-bold transition ${filter === id ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-300 hover:text-emerald-700'}`}><Icon className="h-3.5 w-3.5" />{label}</button>)}</div>
      {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      <section className="relative mt-5 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-[#d9eadf] shadow-sm"><div ref={mapElementRef} className="h-[24rem] w-full" aria-label="Interactive BrazilBR map" />{loading && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/25"><Loader2 className="h-7 w-7 animate-spin text-emerald-700" /></div>}{!loading && !hasMarkers && <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-8 text-center"><div className="pointer-events-auto rounded-3xl bg-white/90 p-5 shadow-sm"><MapPinned className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">There isn't much here yet.</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">Add the first recommendation or turn on your city-level map visibility.</p><button type="button" onClick={() => onNavigate('/contribute')} className="mt-4 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white">Add a recommendation</button></div></div>}<div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between"><span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900">{city || 'Brazil'} · coarse view</span><a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="pointer-events-auto rounded-full bg-white/90 p-2 text-emerald-800" aria-label="Open map provider"><Navigation className="h-4 w-4" /></a></div></section>
      <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />People opted in</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Places</span><button type="button" onClick={() => onNavigate('/onboarding')} className="font-bold text-emerald-700">Map privacy</button></div>
      <section className="mt-7 space-y-3"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">{filter === 'people' ? 'People on the map' : filter === 'all' ? 'Nearby knowledge' : `${filters.find((item) => item.id === filter)?.label} nearby`}</p><h2 className="mt-1 text-xl font-extrabold tracking-tight text-stone-900">{visiblePlaces.length + visiblePeople.length} result{visiblePlaces.length + visiblePeople.length === 1 ? '' : 's'}</h2></div><button type="button" onClick={() => onNavigate('/search')} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">Search <Search className="h-3.5 w-3.5" /></button></div>{visiblePlaces.slice(0, 5).map((place) => <button key={place.id} type="button" onClick={() => onOpenPlace(place.id)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-800"><MapPinned className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-stone-900">{place.name}</p><p className="mt-1 text-xs capitalize text-stone-500">{place.category.replace('-', ' ')} · {place.city}</p></div><span className="text-xs font-bold text-emerald-700">Open</span></button>)}{visiblePeople.slice(0, 5).map((profile) => <button key={profile.uid} type="button" onClick={() => onOpenProfile(profile.uid)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 font-bold text-emerald-800">{profile.photoURL ? <img src={profile.photoURL} alt="" className="h-full w-full object-cover" /> : (profile.displayName || 'P').slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-stone-900">{profile.displayName || 'BrazilBR person'}</p><p className="mt-1 text-xs text-stone-500">{profile.currentCity || 'Brazil'} · city-level visibility</p></div><MessageCircle className="h-4 w-4 text-emerald-700" /></button>)}</section>
      <footer className="mt-7"><PrimaryNav active="map" onNavigate={onNavigate} /></footer>
    </div>
  );
};
