import React, { useState } from 'react';
import { ArrowLeft, Compass, FileText, Loader2, Search, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchAcrossBrazilBR, type SearchResult } from '../firebase/search';

interface SearchScreenProps {
  onBack: () => void;
  onOpenProfile: (uid: string) => void;
}

const resultIcon = (type: SearchResult['type']) => type === 'person' ? UsersRound : type === 'post' ? FileText : Compass;

export const SearchScreen: React.FC<SearchScreenProps> = ({ onBack, onOpenProfile }) => {
  const { user } = useAuth();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !term.trim()) return;
    setLoading(true);
    setSearched(true);
    setError(null);
    try {
      setResults(await searchAcrossBrazilBR(term, user.uid));
    } catch (searchError) {
      console.error('Could not search BrazilBR:', searchError);
      setError('Search is unavailable right now. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-stone-50 px-5 py-7 sm:px-8">
      <header className="mb-6 flex items-center gap-3"><button type="button" onClick={onBack} aria-label="Back" className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-600"><ArrowLeft className="h-4 w-4" /></button><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">BrazilBR search</p><h1 className="text-2xl font-extrabold tracking-tight text-stone-900">Find your next lead.</h1></div></header>
      <form onSubmit={submit} className="flex gap-2"><div className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-stone-400" /><input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="People, places, tips, events..." autoFocus className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></div><button type="submit" disabled={loading || !term.trim()} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}</button></form>
      <p className="mt-3 text-xs leading-relaxed text-stone-500">Search is intentionally lightweight for V1. Results are matched against public fields and can later move to a dedicated index.</p>
      {error && <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">{error}</div>}
      {searched && !loading && !error && results.length === 0 && <div className="mt-7 rounded-3xl border border-dashed border-stone-300 bg-white p-7 text-center"><Search className="mx-auto h-8 w-8 text-stone-400" /><h2 className="mt-3 font-bold text-stone-900">No results yet.</h2><p className="mt-2 text-sm leading-relaxed text-stone-600">Try a city, interest, place or topic with a little less detail.</p></div>}
      {results.length > 0 && <div className="mt-6 space-y-3">{results.map((result) => { const Icon = resultIcon(result.type); return <button key={`${result.type}-${result.id}`} type="button" onClick={() => result.type === 'person' && onOpenProfile(result.id)} className={`w-full rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-sm ${result.type === 'person' ? 'transition hover:border-emerald-300' : ''}`}><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></div><div className="min-w-0"><div className="flex items-center gap-2"><h2 className="truncate font-bold text-stone-900">{result.title}</h2><span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">{result.type}</span></div><p className="mt-1 text-xs font-semibold text-emerald-700">{result.subtitle}</p>{result.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-stone-600">{result.description}</p>}</div></div></button>; })}</div>}
    </div>
  );
};
