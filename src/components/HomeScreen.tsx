import React, { useEffect, useState } from 'react';
import { Bell, Compass, FilePlus2, HelpCircle, Loader2, LogOut, MapPin, MapPinned, MessageCircle, User as UserIcon, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserContext } from '../firebase/userProfile';
import { PrimaryNav } from './PrimaryNav';
import { FeedScreen } from './FeedScreen';
import type { UserContext } from '../types';

interface HomeScreenProps {
  onNavigate?: (path: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { userProfile, user, logout, actionLoading } = useAuth();
  const [context, setContext] = useState<UserContext | null>(null);
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void getUserContext(user.uid)
      .then(setContext)
      .catch((error) => console.warn('Could not load current context:', error))
      .finally(() => setContextLoading(false));
  }, [user?.uid]);

  const rawName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Friend';
  const firstName = rawName.trim().split(' ')[0] || 'Friend';
  const fullName = userProfile?.displayName || user?.displayName || 'Nomad Explorer';
  const photoURL = userProfile?.photoURL || user?.photoURL;
  const isLoggingOut = actionLoading === 'logout';

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-gradient-to-b from-emerald-50/50 via-stone-50 to-stone-100 px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between"><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm">BR</div><div><span className="text-base font-bold uppercase tracking-tight text-stone-900">BrazilBR</span><p className="mt-0.5 text-[11px] font-medium leading-none text-stone-500">Your Nomadic Friend</p></div></div><div className="flex items-center gap-2"><button type="button" onClick={() => onNavigate?.('/notifications')} aria-label="Open notifications" className="rounded-full border border-stone-200/80 bg-white/80 p-2 text-stone-500 transition hover:text-emerald-700"><Bell className="h-4 w-4" /></button><button type="button" onClick={() => void logout()} disabled={isLoggingOut} className="flex items-center gap-1.5 rounded-full border border-stone-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-stone-500 transition hover:text-rose-600 disabled:opacity-50">{isLoggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}Sign out</button></div></header>

      <main className="my-auto space-y-5 py-7"><div><p className="text-sm font-semibold text-emerald-700">Good to see you, {firstName}.</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">What is happening with you?</h1><p className="mt-2 text-sm leading-relaxed text-stone-600">BrazilBR helps you understand where you are, what you need and who to connect with.</p></div>
        <section className="flex items-center gap-4 rounded-3xl border border-stone-200/80 bg-white p-4 shadow-sm">{photoURL ? <img src={photoURL} alt={fullName} referrerPolicy="no-referrer" className="h-14 w-14 rounded-2xl border-2 border-emerald-500/20 object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-500/20 bg-emerald-100 text-xl font-bold text-emerald-800">{firstName.charAt(0).toUpperCase() || <UserIcon className="h-6 w-6" />}</div>}<div className="min-w-0 flex-1"><h2 className="truncate font-bold text-stone-900">{fullName}</h2><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{userProfile?.currentCity || 'Add your current city'}</p></div><button type="button" onClick={() => onNavigate?.('/profile')} className="rounded-xl px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50">View</button></section>
        <section className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-sm"><div className="flex items-center gap-2"><div className="rounded-xl bg-white/15 p-2"><Compass className="h-5 w-5 text-amber-300" /></div><h2 className="font-bold tracking-tight">Your current context</h2></div>{contextLoading ? <div className="mt-4 flex items-center gap-2 text-xs text-emerald-100"><Loader2 className="h-4 w-4 animate-spin" />Loading your context...</div> : context ? <div className="mt-4 rounded-2xl bg-white/10 p-4"><p className="text-lg font-bold">{context.currentNeed}</p><p className="mt-1 flex items-center gap-1 text-xs text-emerald-100"><MapPin className="h-3.5 w-3.5" />{context.currentCity || 'Brazil'}</p><button type="button" onClick={() => onNavigate?.('/onboarding')} className="mt-3 text-xs font-bold text-amber-200 underline underline-offset-2">Change context</button></div> : <div className="mt-4 rounded-2xl bg-white/10 p-4"><p className="text-sm leading-relaxed text-emerald-50">Tell BrazilBR what you need right now so we can surface useful people and ideas.</p><button type="button" onClick={() => onNavigate?.('/onboarding')} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-800"><HelpCircle className="h-4 w-4" />Set your context</button></div>}</section>
        <section className="grid grid-cols-2 gap-3"><button type="button" onClick={() => onNavigate?.('/map')} className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"><MapPinned className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-sm font-bold text-stone-900">Open the map</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Find people, sleep, food and work.</p></button><button type="button" onClick={() => onNavigate?.('/discover')} className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"><Compass className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-sm font-bold text-stone-900">Find people</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Discover relevant nomads nearby.</p></button><button type="button" onClick={() => onNavigate?.('/messages')} className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"><MessageCircle className="h-5 w-5 text-amber-600" /><p className="mt-3 text-sm font-bold text-stone-900">Messages</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Keep conversations close.</p></button><button type="button" onClick={() => onNavigate?.('/contribute')} className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"><FilePlus2 className="h-5 w-5 text-rose-500" /><p className="mt-3 text-sm font-bold text-stone-900">Contribute</p><p className="mt-1 text-xs leading-relaxed text-stone-500">Share a useful local find.</p></button><button type="button" onClick={() => onNavigate?.('/friends')} className="rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"><UsersRound className="h-5 w-5 text-violet-500" /><p className="mt-3 text-sm font-bold text-stone-900">Friends</p><p className="mt-1 text-xs leading-relaxed text-stone-500">See connections and requests.</p></button></section>
        <FeedScreen onNavigate={onNavigate} />
      </main>
      <footer className="pt-2"><PrimaryNav active="home" onNavigate={(path) => onNavigate?.(path)} /></footer>
    </div>
  );
};
