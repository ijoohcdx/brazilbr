import React, { useEffect, useState } from 'react';
import { Check, Group, Loader2, Plus, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listConnectionsForUser } from '../firebase/connections';
import { createGroup, listGroupsForUser } from '../firebase/groups';
import type { Connection, UserGroup } from '../types';
import { PrimaryNav } from './PrimaryNav';

interface GroupsScreenProps {
  onNavigate: (path: string) => void;
}

const GROUP_SUGGESTIONS = ['Travel Friends', 'Brazil Friends', 'Work', 'Family', 'People I Met', 'Favorites'];

export const GroupsScreen: React.FC<GroupsScreenProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [name, setName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [groupItems, connectionItems] = await Promise.all([
        listGroupsForUser(user.uid),
        listConnectionsForUser(user.uid),
      ]);
      setGroups(groupItems);
      setConnections(connectionItems.filter((connection) => connection.status === 'accepted'));
    } catch (loadError) {
      console.error('Could not load groups:', loadError);
      setError('Groups are unavailable right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [user?.uid]);

  const toggleMember = (uid: string) => {
    setSelectedMembers((current) => current.includes(uid) ? current.filter((item) => item !== uid) : [...current, uid]);
  };

  const save = async () => {
    if (!user || !name.trim()) {
      setError('Give your group a name first.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const group = await createGroup(user.uid, name, selectedMembers);
      setGroups((current) => [...current, group].sort((left, right) => left.name.localeCompare(right.name)));
      setName('');
      setSelectedMembers([]);
    } catch (saveError) {
      console.error('Could not create group:', saveError);
      setError('We could not create this group yet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const friendIds = connections.map((connection) => connection.users.find((uid) => uid !== user?.uid)).filter((uid): uid is string => Boolean(uid));

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900"><Group className="h-3.5 w-3.5" />Groups</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Your people, your way.</h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">Keep private lists for the people you want to find and share with.</p>
        </div>
      </header>

      {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}

      <section className="mb-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Create a group</p>
        <div className="mt-3 flex gap-2">
          <input value={name} onChange={(event) => setName(event.target.value)} list="group-suggestions" placeholder="e.g. Beach friends" className="min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          <datalist id="group-suggestions">{GROUP_SUGGESTIONS.map((suggestion) => <option key={suggestion} value={suggestion} />)}</datalist>
          <button type="button" onClick={() => void save()} disabled={saving} className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><Plus className="h-4 w-4" />{saving ? 'Saving' : 'Create'}</button>
        </div>
        {friendIds.length > 0 && <div className="mt-4"><p className="mb-2 text-xs font-semibold text-stone-500">Add accepted friends <span className="font-normal">(optional)</span></p><div className="space-y-2">{friendIds.map((friendId) => <button key={friendId} type="button" onClick={() => toggleMember(friendId)} className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2.5 text-left text-xs font-semibold transition ${selectedMembers.includes(friendId) ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-700'}`}><span className="flex items-center gap-2"><UsersRound className="h-4 w-4" />Friend {friendId.slice(0, 8)}</span>{selectedMembers.includes(friendId) && <Check className="h-4 w-4 text-emerald-600" />}</button>)}</div></div>}
      </section>

      {loading && <div className="flex min-h-40 items-center justify-center text-emerald-700"><Loader2 className="h-6 w-6 animate-spin" /></div>}
      {!loading && !error && groups.length === 0 && <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><UsersRound className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">No groups yet.</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">Create a private group to keep your BrazilBR connections organized.</p></div>}
      {!loading && !error && groups.length > 0 && <div className="space-y-3">{groups.map((group) => <article key={group.id} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><UsersRound className="h-5 w-5" /></div><div><h2 className="font-bold text-stone-900">{group.name}</h2><p className="mt-1 text-xs text-stone-500">{group.memberIds.length} {group.memberIds.length === 1 ? 'person' : 'people'}</p></div></div></article>)}</div>}

      <footer className="mt-7"><PrimaryNav active="groups" onNavigate={onNavigate} /></footer>
    </div>
  );
};
