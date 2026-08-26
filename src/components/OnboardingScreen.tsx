import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, MapPinned, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveUserContext, saveUserProfile } from '../firebase/userProfile';
import { USER_NEEDS } from '../types';

const LANGUAGES = ['Português', 'English', 'Español', 'Français', 'Italiano', 'Deutsch'];
const INTERESTS = ['Food', 'Culture', 'Nature', 'Nightlife', 'Work', 'Surf', 'Music', 'Wellness'];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { user, userProfile, completeOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [homeCountry, setHomeCountry] = useState(userProfile?.homeCountry || '');
  const [currentCity, setCurrentCity] = useState(userProfile?.currentCity || '');
  const [showOnMap, setShowOnMap] = useState(userProfile?.showOnMap ?? false);
  const [languages, setLanguages] = useState<string[]>(userProfile?.languages || []);
  const [interests, setInterests] = useState<string[]>(userProfile?.interests || []);
  const [travelStatus, setTravelStatus] = useState(userProfile?.travelStatus || '');
  const [travelStyle, setTravelStyle] = useState(userProfile?.travelStyle || '');
  const [currentNeed, setCurrentNeed] = useState('');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => `${Math.round((step / 3) * 100)}%`, [step]);

  const toggle = (value: string, values: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const next = () => {
    setError(null);
    if (step === 1 && (!displayName.trim() || !currentCity.trim())) {
      setError('Tell us your name and where you are now to continue.');
      return;
    }
    setStep((value) => Math.min(3, value + 1));
  };

  const finish = async () => {
    if (!user || !currentNeed) {
      setError('Choose what you need right now to finish.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const profileData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        homeCountry: homeCountry.trim(),
        currentCountry: 'Brazil',
        currentCity: currentCity.trim(),
        showOnMap,
        languages,
        interests,
        travelStatus: travelStatus || null,
        travelStyle: travelStyle || null,
        onboardingCompleted: true as const,
      };
      await saveUserProfile(user.uid, profileData);
      await saveUserContext(user.uid, currentNeed, currentCity.trim());
      completeOnboarding(profileData);
      onComplete();
    } catch (saveError) {
      console.error('Onboarding save failed:', saveError);
      setError('We could not save your profile yet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50/60 via-stone-50 to-stone-100 px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm">BR</div>
            <div>
              <span className="text-base font-bold uppercase tracking-tight text-stone-900">BrazilBR</span>
              <p className="mt-0.5 text-[11px] font-medium leading-none text-stone-500">Your Nomadic Friend</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">{progress}</span>
        </header>

        <main className="my-auto py-8">
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: progress }} />
          </div>

          <div className="mb-7 space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/70 bg-amber-100/80 px-3 py-1 text-xs font-medium text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              Your first BrazilBR setup
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
              {step === 1 ? 'Start with where you are.' : step === 2 ? 'What makes you, you?' : 'What do you need right now?'}
            </h1>
            <p className="text-sm leading-relaxed text-stone-600">
              {step === 1 ? 'A few details help BrazilBR connect you to the right people.' : step === 2 ? 'Choose only what feels useful. You can change it later.' : 'Your context is temporary and can change whenever your day changes.'}
            </p>
          </div>

          {error && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Your name</span>
                <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="How should people call you?" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Where are you from?</span>
                <input value={homeCountry} onChange={(event) => setHomeCountry(event.target.value)} placeholder="Country or city" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="block space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-500"><MapPin className="h-3.5 w-3.5 text-emerald-600" />Current city in Brazil</span>
                <input value={currentCity} onChange={(event) => setCurrentCity(event.target.value)} placeholder="e.g. Fortaleza" className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4"><input type="checkbox" checked={showOnMap} onChange={(event) => setShowOnMap(event.target.checked)} className="mt-0.5 h-4 w-4 accent-emerald-600" /><span><span className="flex items-center gap-1.5 text-sm font-bold text-stone-900"><MapPinned className="h-4 w-4 text-emerald-600" />Show me on the BrazilBR map</span><span className="mt-1 block text-xs leading-relaxed text-stone-500">Only your city will be shown. Your precise location is never shared.</span></span></label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Languages</p>
                <div className="flex flex-wrap gap-2">{LANGUAGES.map((item) => <button key={item} type="button" onClick={() => toggle(item, languages, setLanguages)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${languages.includes(item) ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-200 bg-white text-stone-700'}`}>{languages.includes(item) && <Check className="mr-1 inline h-3.5 w-3.5" />}{item}</button>)}</div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Interests</p>
                <div className="flex flex-wrap gap-2">{INTERESTS.map((item) => <button key={item} type="button" onClick={() => toggle(item, interests, setInterests)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${interests.includes(item) ? 'border-amber-500 bg-amber-400 text-amber-950' : 'border-stone-200 bg-white text-stone-700'}`}>{interests.includes(item) && <Check className="mr-1 inline h-3.5 w-3.5" />}{item}</button>)}</div>
              </div>
              <label className="block space-y-1.5"><span className="text-xs font-bold uppercase tracking-wider text-stone-500">A short bio <span className="font-normal normal-case">(optional)</span></span><textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} placeholder="What would you like people to know?" className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Your need today</p><div className="grid grid-cols-2 gap-2">{USER_NEEDS.map((need) => <button key={need} type="button" onClick={() => setCurrentNeed(need)} className={`rounded-2xl border p-3 text-left text-xs font-semibold transition ${currentNeed === need ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm' : 'border-stone-200 bg-white text-stone-700'}`}>{need}</button>)}</div></div>
              <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Travel status <span className="font-normal normal-case">(optional)</span></p><div className="flex flex-wrap gap-2">{['Living here', 'Visiting', 'Working remotely', 'Moving here'].map((item) => <button key={item} type="button" onClick={() => setTravelStatus(item)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${travelStatus === item ? 'border-emerald-600 bg-emerald-100 text-emerald-900' : 'border-stone-200 bg-white text-stone-700'}`}>{item}</button>)}</div></div>
              <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Travel style <span className="font-normal normal-case">(optional)</span></p><div className="flex flex-wrap gap-2">{['Slow travel', 'Adventure', 'Local life', 'Digital nomad'].map((item) => <button key={item} type="button" onClick={() => setTravelStyle(item)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${travelStyle === item ? 'border-amber-500 bg-amber-100 text-amber-950' : 'border-stone-200 bg-white text-stone-700'}`}>{item}</button>)}</div></div>
            </div>
          )}
        </main>

        <footer className="flex items-center justify-between gap-3 pt-4">
          <button type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1 || saving} className="flex items-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-500 transition hover:bg-white disabled:invisible"><ArrowLeft className="h-4 w-4" />Back</button>
          {step < 3 ? <button type="button" onClick={next} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700">Continue<ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={finish} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60">{saving ? 'Saving...' : 'Enter BrazilBR'}<ArrowRight className="h-4 w-4" /></button>}
        </footer>
      </div>
    </div>
  );
};
