import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getConversation, listMessages, sendMessage } from '../firebase/messages';
import type { Conversation, Message } from '../types';

interface ConversationScreenProps {
  conversationId: string;
  onBack: () => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({ conversationId, onBack }) => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const currentConversation = await getConversation(conversationId);
      if (!currentConversation || !currentConversation.participants.includes(user.uid)) {
        setError('This conversation is not available.');
        return;
      }
      setConversation(currentConversation);
      setMessages(await listMessages(currentConversation));
    } catch (loadError) {
      console.error('Could not load conversation:', loadError);
      setError('This conversation could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [conversationId, user?.uid]);

  const otherUid = useMemo(() => conversation?.participants.find((participant) => participant !== user?.uid) || 'nomad', [conversation, user?.uid]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!conversation || !user || !text.trim()) return;
    setSending(true);
    setError(null);
    try {
      const newMessage = await sendMessage(conversation, user.uid, text);
      setMessages((current) => [...current, newMessage]);
      setText('');
      setConversation((current) => current ? { ...current, lastMessage: newMessage.text, lastMessageAt: newMessage.createdAt, updatedAt: newMessage.createdAt } : current);
    } catch (sendError) {
      console.error('Could not send message:', sendError);
      setError('Your message could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-stone-50 px-5 py-7 sm:px-8"><header className="flex items-center gap-3 border-b border-stone-200 pb-5"><button type="button" onClick={onBack} className="rounded-xl p-2 text-stone-500 transition hover:bg-white hover:text-emerald-700"><ArrowLeft className="h-5 w-5" /></button><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Conversation</p><h1 className="font-bold text-stone-900">Nomad {otherUid.slice(0, 8)}</h1></div></header>{error && <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">{error}</div>}{loading && <div className="flex flex-1 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}{!loading && conversation && <><div className="flex flex-1 flex-col gap-3 overflow-y-auto py-6">{messages.length === 0 && <div className="my-auto rounded-3xl border border-dashed border-stone-300 bg-white p-6 text-center"><p className="text-sm font-semibold text-stone-800">Start the conversation.</p><p className="mt-2 text-xs leading-relaxed text-stone-500">Say hello and share something useful about Brazil.</p></div>}{messages.map((message) => <div key={message.id} className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${message.senderId === user?.uid ? 'rounded-br-md bg-emerald-600 text-white' : 'rounded-bl-md border border-stone-200 bg-white text-stone-700'}`}><p>{message.text}</p><time className={`mt-1 block text-[10px] ${message.senderId === user?.uid ? 'text-emerald-100' : 'text-stone-400'}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div></div>)}</div><form onSubmit={submit} className="flex gap-2 border-t border-stone-200 pt-4"><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message..." className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" disabled={sending} /><button type="submit" disabled={sending || !text.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-50">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</button></form></>}</div>
  );
};
