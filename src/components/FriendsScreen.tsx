import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Loader2, UsersRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listConnectionsForUser, removeConnection, updateConnectionStatus } from '../firebase/connections';
import type { Connection } from '../types';

interface FriendsScreenProps {
  onBack: () => void;
  onOpenProfile: (uid: string) => void;
  onOpenGroups: () => void;
}

type FriendsTab = 'friends' | 'incoming' | 'sent';

export const FriendsScreen: React.FC<FriendsScreenProps> = ({ onBack, onOpenProfile, onOpenGroups }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [tab, setTab] = useState<FriendsTab>('friends');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setConnections(await listConnectionsForUser(user.uid));
    } catch (loadError) {
      console.error('Could not load friends:', loadError);
      setError('Friends are unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.uid]);

  const lists = useMemo(() => ({
    friends: connections.filter((connection) => connection.status === 'accepted'),
    incoming: connections.filter((connection) => connection.status === 'pending' && connection.initiatedBy !== user?.uid),
    sent: connections.filter((connection) => connection.status === 'pending' && connection.initiatedBy === user?.uid),
  }), [connections, user?.uid]);

  const current = lists[tab];

  const runAction = async (connection: Connection, action: 'accepted' | 'declined' | 'remove') => {
    if (!user) return;
    setActionId(connection.id);
    setError(null);
    try {
      if (action === 'remove') await removeConnection(connection, user.uid);
      else await updateConnectionStatus(connection, user.uid, action);
      await load();
    } catch (actionError) {
      console.error('Could not update friend connection:', actionError);
      setError('We could not update this connection yet. Please try again.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-6 flex items-center justify-between gap-3"><div className="flex items-center gap-3"><button type="button" onClick={onBack} aria-label="Back" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Your connections</p><h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Friends</h1></div></div><button type="button" onClick={onOpenGroups} className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700" aria-label="Open groups"><UsersRound className="h-4 w-4" /></button></header>
      <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-stone-200 bg-white p-1.5">{(['friends', 'incoming', 'sent'] as FriendsTab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-xl px-2 py-2 text-xs font-bold capitalize transition ${tab === item ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-stone-50'}`}>{item === 'incoming' ? 'Requests' : item}</button>)}</div>
      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && current.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><UsersRound className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">{tab === 'friends' ? "You don't have any friends on BrazilBR yet." : tab === 'incoming' ? 'No pending requests.' : 'No sent requests.'}</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">Discover people who share your city, interests or travel plans.</p></div>}
      {!loading && !error && current.length > 0 && <div className="space-y-3">{current.map((connection) => { const otherId = connection.users.find((uid) => uid !== user?.uid) || ''; return <article key={connection.id} className="flex items-center gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">{otherId.slice(0, 1).toUpperCase() || '?'}</div><div className="min-w-0 flex-1"><button type="button" onClick={() => onOpenProfile(otherId)} className="truncate text-left text-sm font-bold text-stone-900 hover:text-emerald-700">BrazilBR member</button><p className="mt-1 text-[11px] text-stone-500">ID {otherId.slice(0, 10)} · {connection.status}</p></div><div className="flex gap-1.5">{tab === 'incoming' && <><button type="button" onClick={() => void runAction(connection, 'accepted')} disabled={actionId === connection.id} aria-label="Accept request" className="rounded-xl bg-emerald-600 p-2 text-white disabled:opacity-50"><Check className="h-4 w-4" /></button><button type="button" onClick={() => void runAction(connection, 'declined')} disabled={actionId === connection.id} aria-label="Decline request" className="rounded-xl border border-stone-200 p-2 text-stone-500 disabled:opacity-50"><X className="h-4 w-4" /></button></>}{tab === 'friends' && <button type="button" onClick={() => void runAction(connection, 'remove')} disabled={actionId === connection.id} className="rounded-xl border border-stone-200 px-2.5 py-2 text-[11px] font-bold text-stone-500 disabled:opacity-50">Remove</button>}{tab === 'sent' && <span className="rounded-xl bg-stone-100 px-2.5 py-2 text-[11px] font-bold text-stone-500">Pending</span>}</div></article>; })}</div>}
    </div>
  );
};
