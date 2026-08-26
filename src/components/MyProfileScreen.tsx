import React, { useEffect, useMemo, useState } from 'react';
import { Edit3, ExternalLink, FilePlus2, Image, LogOut, MapPin, UserRound, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listConnectionsForUser } from '../firebase/connections';
import { listContributionsByAuthor } from '../firebase/contributions';
import { listPostsByAuthor } from '../firebase/posts';
import { PrimaryNav } from './PrimaryNav';
import type { Connection, Contribution, Post } from '../types';

interface MyProfileScreenProps {
  onNavigate: (path: string) => void;
}

type ProfileTab = 'about' | 'posts' | 'contributions' | 'photos' | 'friends';

export const MyProfileScreen: React.FC<MyProfileScreenProps> = ({ onNavigate }) => {
  const { user, userProfile, logout, actionLoading } = useAuth();
  const name = userProfile?.displayName || user?.displayName || 'Nomad Explorer';
  const photoURL = userProfile?.photoURL || user?.photoURL;
  const [tab, setTab] = useState<ProfileTab>('about');
  const [posts, setPosts] = useState<Post[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoadingHistory(true);
    setHistoryError(null);
    void Promise.allSettled([listPostsByAuthor(user.uid), listContributionsByAuthor(user.uid), listConnectionsForUser(user.uid)]).then(([postResult, contributionResult, connectionResult]) => {
      setPosts(postResult.status === 'fulfilled' ? postResult.value : []);
      setContributions(contributionResult.status === 'fulfilled' ? contributionResult.value : []);
      setConnections(connectionResult.status === 'fulfilled' ? connectionResult.value : []);
      if ([postResult, contributionResult, connectionResult].some((result) => result.status === 'rejected')) setHistoryError('Some profile history is temporarily unavailable.');
      setLoadingHistory(false);
    });
  }, [user?.uid]);

  const acceptedFriends = useMemo(() => connections.filter((connection) => connection.status === 'accepted'), [connections]);
  const contributionCounts = useMemo(() => contributions.reduce<Record<string, number>>((counts, contribution) => {
    counts[contribution.type] = (counts[contribution.type] || 0) + 1;
    return counts;
  }, {}), [contributions]);

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'posts', label: `Posts (${posts.length})` },
    { id: 'contributions', label: `Contributions (${contributions.length})` },
    { id: 'photos', label: 'Photos' },
    { id: 'friends', label: `Friends (${acceptedFriends.length})` },
  ];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-stone-50 px-5 py-7 sm:px-8">
      <header><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Your profile</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900">Show up as yourself.</h1></header>
      <main className="space-y-5 py-7">
        <section className="rounded-3xl border border-stone-200 bg-white p-5 text-center shadow-sm"><div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-emerald-100 text-3xl font-bold text-emerald-800">{photoURL ? <img src={photoURL} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase() || <UserRound className="h-8 w-8" />}</div><h2 className="mt-4 text-xl font-bold text-stone-900">{name}</h2><p className="mt-1 flex items-center justify-center gap-1 text-sm text-stone-500"><MapPin className="h-4 w-4 text-emerald-600" />{userProfile?.currentCity || 'Add your current city'}</p><p className="mt-4 text-sm leading-relaxed text-stone-600">{userProfile?.bio || 'Add a short bio so people know what kind of connection you are open to.'}</p><div className="mt-4 flex flex-wrap justify-center gap-2">{(userProfile?.interests || []).map((interest) => <span key={interest} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{interest}</span>)}</div></section>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">{tabs.map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition ${tab === item.id ? 'bg-emerald-600 text-white' : 'bg-white text-stone-500 hover:bg-emerald-50 hover:text-emerald-700'}`}>{item.label}</button>)}</div>
        {historyError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-900">{historyError}</div>}
        {loadingHistory && <div className="flex min-h-36 items-center justify-center text-emerald-700"><div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" /></div>}
        {!loadingHistory && tab === 'about' && <div className="space-y-4"><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">About</h2><div className="mt-3 space-y-3 text-sm text-stone-700"><p><strong>From:</strong> {userProfile?.homeCountry || 'Not listed'}</p><p><strong>Languages:</strong> {userProfile?.languages?.join(' · ') || 'Not listed'}</p><p><strong>Travel:</strong> {userProfile?.travelStatus || 'Exploring Brazil'}{userProfile?.travelStyle ? ` · ${userProfile.travelStyle}` : ''}</p></div></section><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="grid grid-cols-3 gap-2 text-center"><div><p className="text-xl font-extrabold text-stone-900">{posts.length}</p><p className="mt-1 text-[11px] font-semibold text-stone-500">Posts</p></div><div><p className="text-xl font-extrabold text-stone-900">{acceptedFriends.length}</p><p className="mt-1 text-[11px] font-semibold text-stone-500">Friends</p></div><div><p className="text-xl font-extrabold text-stone-900">{contributions.length}</p><p className="mt-1 text-[11px] font-semibold text-stone-500">Contributions</p></div></div><div className="mt-5 border-t border-stone-100 pt-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Contribution areas</p><div className="mt-3 flex flex-wrap gap-2">{Object.entries(contributionCounts).length ? Object.entries(contributionCounts).map(([type, count]) => <span key={type} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-800">{type.replace('-', ' ')} · {count}</span>) : <p className="text-sm text-stone-600">You haven't published any contributions yet.</p>}</div></div></section></div>}
        {!loadingHistory && tab === 'posts' && <div className="space-y-3">{posts.length === 0 ? <EmptyHistory icon={<FilePlus2 className="mx-auto h-7 w-7 text-stone-400" />} title="You haven't published anything yet." body="Your public posts will appear here." /> : posts.map((post) => <article key={post.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{post.content}</p>{post.linkUrl && <a href={post.linkUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1 truncate text-xs font-bold text-emerald-700"><ExternalLink className="h-3.5 w-3.5" />{post.linkUrl}</a>}<p className="mt-3 text-[11px] text-stone-500">{post.city || 'Brazil'} · {new Date(post.createdAt).toLocaleDateString()}</p></article>)}</div>}
        {!loadingHistory && tab === 'contributions' && <div className="space-y-3">{contributions.length === 0 ? <EmptyHistory icon={<FilePlus2 className="mx-auto h-7 w-7 text-stone-400" />} title="You haven't published anything yet." body="Be the first to contribute something useful." /> : contributions.map((contribution) => <article key={contribution.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">{contribution.type.replace('-', ' ')}</span><h3 className="mt-2 font-bold text-stone-900">{contribution.title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">{contribution.description}</p><p className="mt-3 text-[11px] text-stone-500">{contribution.city || 'Brazil'} · {new Date(contribution.createdAt).toLocaleDateString()}</p></article>)}</div>}
        {!loadingHistory && tab === 'photos' && <EmptyHistory icon={<Image className="mx-auto h-7 w-7 text-stone-400" />} title="Photo uploads will be available shortly." body="Firebase Storage will be activated in a separate phase. Your profile is ready for photo references." />}
        {!loadingHistory && tab === 'friends' && <div className="space-y-3">{acceptedFriends.length === 0 ? <EmptyHistory icon={<UsersRound className="mx-auto h-7 w-7 text-stone-400" />} title="You don't have any friends on BrazilBR yet." body="Discover people who share your city, interests or travel plans." /> : acceptedFriends.map((connection) => { const friendId = connection.users.find((uid) => uid !== user?.uid) || ''; return <button key={connection.id} type="button" onClick={() => onNavigate(`/profile?uid=${encodeURIComponent(friendId)}`)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">{friendId.slice(0, 1).toUpperCase() || '?'}</div><div><p className="text-sm font-bold text-stone-900">BrazilBR friend</p><p className="mt-1 text-[11px] text-stone-500">Open profile · {friendId.slice(0, 12)}</p></div></button>; })}</div>}
        <button type="button" onClick={() => onNavigate('/onboarding')} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"><Edit3 className="h-4 w-4" />Edit profile and context</button><button type="button" onClick={() => void logout()} disabled={actionLoading === 'logout'} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-700 disabled:opacity-60"><LogOut className="h-4 w-4" />{actionLoading === 'logout' ? 'Signing out...' : 'Sign out'}</button>
      </main><footer className="pt-2"><PrimaryNav active="profile" onNavigate={onNavigate} /></footer>
    </div>
  );
};

const EmptyHistory: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({ icon, title, body }) => <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center">{icon}<h2 className="mt-3 font-bold text-stone-900">{title}</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p></div>;
