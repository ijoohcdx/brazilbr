import React, { useEffect, useState } from 'react';
import { Edit3, FilePlus2, LogOut, MapPin, UserRound, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrimaryNav } from './PrimaryNav';
import { listConnectionsForUser } from '../firebase/connections';
import { listPostsByAuthor } from '../firebase/posts';
import { listContributionsByAuthor } from '../firebase/contributions';

interface MyProfileScreenProps {
  onNavigate: (path: string) => void;
}

export const MyProfileScreen: React.FC<MyProfileScreenProps> = ({ onNavigate }) => {
  const { user, userProfile, logout, actionLoading } = useAuth();
  const name = userProfile?.displayName || user?.displayName || 'Nomad Explorer';
  const photoURL = userProfile?.photoURL || user?.photoURL;
  const [stats, setStats] = useState({ posts: 0, friends: 0, contributions: 0 });

  useEffect(() => {
    if (!user) return;
    void Promise.allSettled([listPostsByAuthor(user.uid), listConnectionsForUser(user.uid), listContributionsByAuthor(user.uid)]).then(([posts, connections, contributions]) => {
      setStats({
        posts: posts.status === 'fulfilled' ? posts.value.length : 0,
        friends: connections.status === 'fulfilled' ? connections.value.filter((connection) => connection.status === 'accepted').length : 0,
        contributions: contributions.status === 'fulfilled' ? contributions.value.length : 0,
      });
    });
  }, [user?.uid]);

  return <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-stone-50 px-5 py-7 sm:px-8"><header><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Your profile</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">Show up as yourself.</h1></header><main className="my-auto space-y-5 py-7"><section className="rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-sm"><div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-emerald-100 text-3xl font-bold text-emerald-800">{photoURL ? <img src={photoURL} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase() || <UserRound className="h-8 w-8" />}</div><h2 className="mt-4 text-xl font-bold text-stone-900">{name}</h2><p className="mt-1 flex items-center justify-center gap-1 text-sm text-stone-500"><MapPin className="h-4 w-4 text-emerald-600" />{userProfile?.currentCity || 'Add your current city'}</p><p className="mt-4 text-sm leading-relaxed text-stone-600">{userProfile?.bio || 'Add a short bio so people know what kind of connection you are open to.'}</p><div className="mt-4 flex flex-wrap justify-center gap-2">{(userProfile?.interests || []).map((interest) => <span key={interest} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{interest}</span>)}</div></section><section className="grid grid-cols-3 gap-2"><div className="rounded-2xl border border-stone-200 bg-white p-3 text-center"><p className="text-lg font-extrabold text-stone-900">{stats.posts}</p><p className="mt-1 text-[11px] font-semibold text-stone-500">Posts</p></div><div className="rounded-2xl border border-stone-200 bg-white p-3 text-center"><p className="text-lg font-extrabold text-stone-900">{stats.friends}</p><p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500"><UsersRound className="h-3 w-3" />Friends</p></div><div className="rounded-2xl border border-stone-200 bg-white p-3 text-center"><p className="text-lg font-extrabold text-stone-900">{stats.contributions}</p><p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500"><FilePlus2 className="h-3 w-3" />Contributions</p></div></section><button type="button" onClick={() => onNavigate('/onboarding')} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"><Edit3 className="h-4 w-4" />Edit profile and context</button><button type="button" onClick={() => void logout()} disabled={actionLoading === 'logout'} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-700 disabled:opacity-60"><LogOut className="h-4 w-4" />{actionLoading === 'logout' ? 'Signing out...' : 'Sign out'}</button></main><footer className="pt-2"><PrimaryNav active="profile" onNavigate={onNavigate} /></footer></div>;
};
