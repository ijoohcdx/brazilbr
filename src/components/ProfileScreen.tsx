import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, Globe2, Link2, Loader2, MapPin, UserRound, X } from 'lucide-react';
import { getDiscoverableProfile, type PublicUserProfile } from '../firebase/discovery';
import { useAuth } from '../context/AuthContext';
import { createConnection, getConnection, removeConnection, updateConnectionStatus } from '../firebase/connections';
import { getOrCreateConversation } from '../firebase/messages';
import type { Connection } from '../types';

interface ProfileScreenProps {
  uid: string;
  onBack: () => void;
  onOpenConversation: (conversationId: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ uid, onBack, onOpenConversation }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [publicProfile, currentConnection] = await Promise.all([
        getDiscoverableProfile(uid),
        getConnection(user.uid, uid),
      ]);
      setProfile(publicProfile);
      setConnection(currentConnection);
    } catch (loadError) {
      console.error('Could not load public profile:', loadError);
      setError('This profile is not available right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [uid, user?.uid]);

  const runConnectionAction = async (action: () => Promise<void>) => {
    setActionLoading(true);
    setError(null);
    try {
      await action();
      await load();
    } catch (actionError) {
      console.error('Connection action failed:', actionError);
      setError('We could not update this connection. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const connectionAction = () => {
    if (!user || !connection) {
      if (user) void runConnectionAction(async () => { await createConnection(user.uid, uid); });
      return;
    }
    if (connection.status === 'pending' && connection.initiatedBy !== user.uid) {
      void runConnectionAction(() => updateConnectionStatus(connection, user.uid, 'accepted'));
      return;
    }
    if (connection.status === 'accepted') {
      void runConnectionAction(() => removeConnection(connection, user.uid));
      return;
    }
    if (connection.status === 'declined') {
      void runConnectionAction(async () => {
        await removeConnection(connection, user.uid);
        await createConnection(user.uid, uid);
      });
    }
  };

  const decline = () => {
    if (user && connection) void runConnectionAction(() => updateConnectionStatus(connection, user.uid, 'declined'));
  };

  const openConversation = async () => {
    if (!user || !connection || connection.status !== 'accepted') return;
    setActionLoading(true);
    setError(null);
    try {
      const conversation = await getOrCreateConversation(user.uid, uid);
      onOpenConversation(conversation.id);
    } catch (conversationError) {
      console.error('Could not open conversation:', conversationError);
      setError('We could not open this conversation. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const buttonLabel = !connection ? 'Connect' : connection.status === 'pending' && connection.initiatedBy !== user?.uid ? 'Accept connection' : connection.status === 'pending' ? 'Request sent' : connection.status === 'accepted' ? 'Connected · remove' : connection.status === 'declined' ? 'Connect again' : 'Blocked';

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <button type="button" onClick={onBack} className="mb-8 flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-stone-600 transition hover:bg-white hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Back to people</button>
      {loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {!loading && !error && profile && <div><div className="flex flex-col items-center text-center"><div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[2rem] bg-emerald-100 text-3xl font-bold text-emerald-800 shadow-sm">{profile.photoURL ? <img src={profile.photoURL} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : (profile.displayName || 'N').slice(0, 1).toUpperCase()}</div><h1 className="mt-4 text-2xl font-extrabold tracking-tight text-stone-900">{profile.displayName || 'BrazilBR member'}</h1><p className="mt-1 flex items-center gap-1 text-sm text-stone-500"><MapPin className="h-4 w-4 text-emerald-600" />{profile.currentCity || 'Brazil'}{profile.homeCountry ? ` · from ${profile.homeCountry}` : ''}</p></div><div className="mt-6 flex gap-2"><button type="button" disabled={actionLoading || connection?.status === 'blocked'} onClick={connectionAction} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : connection?.status === 'accepted' ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}{buttonLabel}</button>{connection?.status === 'accepted' && <button type="button" disabled={actionLoading} onClick={() => void openConversation()} className="rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">Message</button>}{connection?.status === 'pending' && connection.initiatedBy !== user?.uid && <button type="button" disabled={actionLoading} onClick={decline} className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-stone-600 transition hover:border-rose-200 hover:text-rose-700"><X className="h-4 w-4" /></button>}</div><div className="mt-7 space-y-4"><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><p className="text-sm leading-relaxed text-stone-700">{profile.bio || 'Open to new connections and local discoveries.'}</p></section><section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">About this person</h2><div className="mt-3 space-y-3 text-sm text-stone-700"><p className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-emerald-600" />{profile.languages.length ? profile.languages.join(' · ') : 'Languages not listed'}</p><p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-emerald-600" />{profile.travelStatus || 'Exploring Brazil'}{profile.travelStyle ? ` · ${profile.travelStyle}` : ''}</p></div><div className="mt-4 flex flex-wrap gap-2">{profile.interests.map((interest) => <span key={interest} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">{interest}</span>)}</div></section></div></div>}
      {!loading && !error && !profile && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center text-sm text-stone-600">This profile is no longer public.</div>}
    </div>
  );
};
