import React from 'react';
import { Compass, House, MessageCircle, UserRound, UsersRound } from 'lucide-react';

interface PrimaryNavProps {
  active: 'home' | 'discover' | 'messages' | 'profile' | 'groups';
  onNavigate: (path: string) => void;
}

const items = [
  { id: 'home' as const, label: 'Home', path: '/home', icon: House },
  { id: 'discover' as const, label: 'Discover', path: '/discover', icon: Compass },
  { id: 'messages' as const, label: 'Messages', path: '/messages', icon: MessageCircle },
  { id: 'groups' as const, label: 'Groups', path: '/groups', icon: UsersRound },
  { id: 'profile' as const, label: 'Profile', path: '/profile', icon: UserRound },
];

export const PrimaryNav: React.FC<PrimaryNavProps> = ({ active, onNavigate }) => (
  <nav className="grid grid-cols-5 gap-1 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-xs" aria-label="Primary navigation">
    {items.map(({ id, label, path, icon: Icon }) => <button key={id} type="button" onClick={() => onNavigate(path)} className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-bold transition ${active === id ? 'bg-emerald-600 text-white' : 'text-stone-500 hover:bg-emerald-50 hover:text-emerald-700'}`}><Icon className="h-4 w-4" />{label}</button>)}
  </nav>
);
