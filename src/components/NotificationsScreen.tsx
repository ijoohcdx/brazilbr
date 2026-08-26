import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listNotifications, markNotificationRead } from '../firebase/notifications';
import type { UserNotification } from '../types';

interface NotificationsScreenProps {
  onBack: () => void;
}

const notificationLabel = (notification: UserNotification) => {
  if (notification.type === 'friend-request') return 'Friend request';
  if (notification.type === 'friend-accepted') return 'Friend request accepted';
  if (notification.type === 'message') return 'New message';
  if (notification.type === 'comment') return 'Comment';
  return 'Reaction';
};

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setNotifications(await listNotifications(user.uid));
    } catch (loadError) {
      console.error('Could not load notifications:', loadError);
      setError('Notifications are unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.uid]);

  const read = async (notification: UserNotification) => {
    if (notification.read) return;
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    try {
      await markNotificationRead(notification.id);
    } catch (readError) {
      console.error('Could not mark notification as read:', readError);
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: false } : item));
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-7 flex items-center gap-3"><button type="button" onClick={onBack} aria-label="Back" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Your updates</p><h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Notifications</h1></div></header>
      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {loading && <div className="flex min-h-48 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && notifications.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><Bell className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">You are all caught up.</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">Friend requests, messages and community activity will show up here.</p></div>}
      {!loading && !error && notifications.length > 0 && <div className="space-y-3">{notifications.map((notification) => <button key={notification.id} type="button" onClick={() => void read(notification)} className={`flex w-full gap-3 rounded-3xl border p-4 text-left shadow-sm transition ${notification.read ? 'border-stone-200 bg-white' : 'border-emerald-200 bg-emerald-50/70'}`}><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700"><Bell className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{notificationLabel(notification)}</p><p className="mt-1 text-sm leading-relaxed text-stone-700">{notification.text}</p>{!notification.read && <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700"><CheckCheck className="h-3.5 w-3.5" />Tap to mark read</span>}</div></button>)}</div>}
    </div>
  );
};
