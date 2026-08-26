import React, { useEffect, useState } from 'react';
import { Compass, Globe2, Loader2, MapPin, RefreshCw, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { type PublicUserProfile, listDiscoverableProfiles } from '../firebase/discovery';
import { getUserContext } from '../firebase/userProfile';
import type { UserContext } from '../types';
import { PrimaryNav } from './PrimaryNav';

interface DiscoverScreenProps {
  onOpenProfile: (uid: string) => void;
}

const initials = (name: string | null) => (name || 'Nomad').trim().slice(0, 1).toUpperCase();

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onOpenProfile }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PublicUserProfile[]>([]);
  const [context, setContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const currentContext = await getUserContext(user.uid);
      setContext(currentContext);
      setProfiles(await listDiscoverableProfiles(user.uid, currentContext));
    } catch (loadError) {
      console.error('Could not load discoverable profiles:', loadError);
      setError('People discovery is unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.uid]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-7 flex items-start justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"><Compass className="h-3.5 w-3.5" />Discover</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">People like you.</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">Find people who are nearby, curious and open to the same kind of connection.</p>
        </div>
        <button type="button" aria-label="Refresh discovery" onClick={() => void load()} className="rounded-2xl border border-stone-200 bg-white p-3 text-stone-500 shadow-sm transition hover:text-emerald-700"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
      </header>

      {context && <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Your current context</p><p className="mt-1 text-sm font-semibold text-emerald-950">{context.currentNeed}</p><p className="mt-1 flex items-center gap-1 text-xs text-emerald-800"><MapPin className="h-3.5 w-3.5" />{context.currentCity || 'Brazil'}</p></div>}

      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && profiles.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><UserRound className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">You are early.</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">There are no other completed profiles to show yet. Check back soon or invite a friend.</p></div>}

      {!loading && profiles.length > 0 && <div className="space-y-3">{profiles.map((profile) => <button key={profile.uid} type="button" onClick={() => onOpenProfile(profile.uid)} className="w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"><div className="flex gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-lg font-bold text-emerald-800">{profile.photoURL ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : initials(profile.displayName)}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="truncate font-bold text-stone-900">{profile.displayName || 'BrazilBR member'}</h2><span className="text-xs font-semibold text-emerald-700">View</span></div><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{profile.currentCity || 'Brazil'}{profile.homeCountry ? ` · from ${profile.homeCountry}` : ''}</p><p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">{profile.bio || 'Open to meeting people and sharing local discoveries.'}</p></div></div><div className="mt-3 flex flex-wrap gap-1.5">{profile.languages.slice(0, 3).map((language) => <span key={language} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold text-stone-600"><Globe2 className="h-3 w-3" />{language}</span>)}{profile.interests.slice(0, 3).map((interest) => <span key={interest} className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-800">{interest}</span>)}</div></button>)}</div>}
      <footer className="mt-7"><PrimaryNav active="discover" onNavigate={(path) => { window.history.pushState(null, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }} /></footer>
    </div>
  );
};
