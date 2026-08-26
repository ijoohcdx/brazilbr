import React, { useEffect, useState } from 'react';
import { ChevronRight, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listConversations } from '../firebase/messages';
import type { Conversation } from '../types';

interface MessagesScreenProps {
  onOpenConversation: (conversation: Conversation) => void;
}

const otherParticipant = (conversation: Conversation, uid: string) => conversation.participants.find((participant) => participant !== uid) || 'nomad';

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ onOpenConversation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setConversations(await listConversations(user.uid));
    } catch (loadError) {
      console.error('Could not load conversations:', loadError);
      setError('Messages are unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.uid]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-7 flex items-start justify-between"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"><MessageCircle className="h-3.5 w-3.5" />Messages</div><h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Your people.</h1><p className="mt-2 text-sm leading-relaxed text-stone-600">Keep useful conversations close while you move through Brazil.</p></div><button type="button" onClick={() => void load()} className="rounded-2xl border border-stone-200 bg-white p-3 text-stone-500 shadow-sm transition hover:text-emerald-700"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></header>
      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && conversations.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><MessageCircle className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">No conversations yet.</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">Connect with someone from Discover to start a private conversation.</p></div>}
      {!loading && conversations.length > 0 && <div className="space-y-3">{conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => onOpenConversation(conversation)} className="flex w-full items-center gap-3 rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-md"><div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 font-bold text-emerald-800">{otherParticipant(conversation, user?.uid || '').slice(0, 1).toUpperCase()}<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-400" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h2 className="truncate font-bold text-stone-900">Nomad {otherParticipant(conversation, user?.uid || '').slice(0, 8)}</h2><span className="text-[11px] text-stone-400">{conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ''}</span></div><p className="mt-1 truncate text-sm text-stone-600">{conversation.lastMessage || 'Conversation started'}</p></div><ChevronRight className="h-4 w-4 shrink-0 text-stone-400" /></button>)}</div>}
    </div>
  );
};
