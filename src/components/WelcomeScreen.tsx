import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { AuthMode } from '../types';

const featureCards = [
  {
    icon: Search,
    eyebrow: 'Start with context',
    title: 'Say where you are and what you need.',
    body: 'Your city and current need shape a more useful starting point than a generic feed.',
  },
  {
    icon: UsersRound,
    eyebrow: 'Find people',
    title: 'Meet people who fit the moment.',
    body: 'Discover public profiles by city, language, interests and the context they share.',
  },
  {
    icon: MapPinned,
    eyebrow: 'Useful places',
    title: 'Open practical local knowledge.',
    body: 'Find community Places with links to maps, menus, websites, bookings and contact.',
  },
  {
    icon: ShieldCheck,
    eyebrow: 'Keep your boundary',
    title: 'Share a city, not your exact location.',
    body: 'Map visibility is optional and designed around city-level privacy.',
  },
];

const faqs = [
  {
    question: 'Do I have to share my exact location?',
    answer: 'No. The current app uses city-level context. Map visibility is optional, and the product does not ask you to publish precise coordinates.',
  },
  {
    question: 'Is BrazilBR a booking platform?',
    answer: 'No. Place Profiles can point to external websites, Maps, menus, booking pages, WhatsApp and other references. You complete the action on the linked service.',
  },
  {
    question: 'Do I need to upload photos or files?',
    answer: 'No. The current MVP works with text, links and optional external HTTP/HTTPS media references. It does not require file uploads.',
  },
  {
    question: 'How much does it cost?',
    answer: 'The current MVP has no active paid plan or checkout. You can create a profile and use the core product without entering payment details.',
  },
  {
    question: 'What is the best time to use it?',
    answer: 'It is designed for people who are traveling, living, working or settling in a Brazilian city and have a concrete need they want to move forward today.',
  },
  {
    question: 'What happens after I create an account?',
    answer: 'You set up your city, languages, interests and current need. Then you can use Home, Discover, Map, Places, Feed, Contributions and private connections.',
  },
];

export const WelcomeScreen: React.FC = () => {
  const {
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    actionLoading,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const isBusy = actionLoading !== null;

  const clearAuthErrors = () => {
    clearError();
    setLocalError(null);
  };

  const openStart = (nextMode: AuthMode = 'email-signup') => {
    clearAuthErrors();
    setMode(nextMode);
    window.requestAnimationFrame(() => {
      document.getElementById('start')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleGoogleSignIn = async () => {
    clearAuthErrors();
    await loginWithGoogle();
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearAuthErrors();

    if (!email.trim()) {
      setLocalError('Please enter your email address.');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'email-signup') {
      await registerWithEmail(email, password, name);
    } else {
      await loginWithEmail(email, password);
    }
  };

  const displayedError = localError || error;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f5ef] text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-900/10 bg-[#f7f5ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="BrazilBR home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-sm font-extrabold tracking-wider text-white shadow-sm">BR</span>
            <span className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-stone-900 sm:text-base">BrazilBR</span>
          </a>
          <nav className="hidden items-center gap-5 text-xs font-bold text-stone-500 md:flex" aria-label="Main navigation">
            <a href="#how-it-works" className="transition hover:text-emerald-700">How it works</a>
            <a href="#why-brazilbr" className="transition hover:text-emerald-700">Why BrazilBR</a>
            <a href="#pricing" className="transition hover:text-emerald-700">Pricing</a>
            <a href="#faq" className="transition hover:text-emerald-700">FAQ</a>
          </nav>
          <button type="button" onClick={() => openStart()} className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[.98]">
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="relative isolate overflow-hidden border-b border-stone-900/10 bg-[#e1eee5]">
          <div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(15,61,46,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,61,46,.08)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:gap-16 lg:px-10 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                For people making a life in Brazil
              </div>
              <h1 className="mt-6 max-w-xl font-display text-[clamp(2.8rem,11vw,5.8rem)] font-extrabold leading-[.93] tracking-[-0.055em] text-stone-950">
                Resolve your next need in Brazil.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-700 sm:text-lg">
                BrazilBR brings people, places and practical local knowledge together around the city you are in.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={() => openStart()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(4,120,87,.18)] transition hover:bg-emerald-800 active:scale-[.98]">
                  Start free <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#how-it-works" className="inline-flex items-center justify-center rounded-2xl border border-stone-900/15 bg-white/60 px-5 py-4 text-sm font-bold text-stone-800 transition hover:bg-white">
                  See how it works
                </a>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-stone-600"><ShieldCheck className="h-4 w-4 text-emerald-700" />No paid plan is active in the current MVP.</p>
            </div>

            <div className="relative lg:pl-4">
              <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-amber-300/40 blur-2xl sm:-right-2" />
              <div className="relative rounded-[2rem] border border-stone-900/10 bg-[#fdfcf8] p-3 shadow-[0_24px_70px_rgba(39,64,49,.16)] sm:p-5" role="img" aria-label="Product preview showing city-level context, current need, people, places and actionable links">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-stone-500">
                  <span>BrazilBR preview</span>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Not live data</span>
                </div>
                <div className="mt-4 rounded-[1.5rem] bg-[#dbece0] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-900/60">Your context</p>
                      <p className="mt-1 text-lg font-extrabold tracking-tight text-emerald-950">São Paulo</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-bold text-emerald-900"><MapPin className="h-3.5 w-3.5" /> city-level</div>
                  </div>
                  <div className="mt-5 rounded-2xl border border-emerald-900/10 bg-white/75 p-3.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-500">What do you need right now?</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {['Meet people', 'Find food', 'Find a place', 'Find work'].map((item, index) => (
                        <div key={item} className={`rounded-xl px-3 py-2.5 text-xs font-bold ${index === 0 ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700'}`}>{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { icon: UsersRound, label: 'People' },
                    { icon: MapPinned, label: 'Places' },
                    { icon: MessageCircle, label: 'Messages' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="rounded-2xl border border-stone-200 bg-white p-3 text-center">
                      <Icon className="mx-auto h-4 w-4 text-emerald-700" />
                      <p className="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-600">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-3">
                  <span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-bold text-stone-700">Open Maps</span>
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold text-amber-900">Menu</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-bold text-emerald-900">WhatsApp</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
          <div className="grid gap-8 border-b border-stone-900/10 pb-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">The real friction</p>
              <h2 className="mt-3 max-w-md font-display text-3xl font-extrabold leading-tight tracking-[-0.035em] text-stone-950 sm:text-4xl">The answer is usually scattered.</h2>
            </div>
            <div className="max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
              <p>When you are new to a Brazilian city, the next useful answer can be spread across maps, chats, event pages, hostels and informal recommendations. The problem is not a lack of tabs. It is knowing what to trust and what to do next.</p>
              <p className="mt-4 font-bold text-stone-900">BrazilBR starts from the need, not from another feed to keep up with.</p>
            </div>
          </div>
        </section>

        <section id="why-brazilbr" className="scroll-mt-24 bg-[#153f32] text-[#f7f5ef]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">The BrazilBR approach</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">One city. One need. A more useful next step.</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-emerald-50/75 sm:text-lg">The current MVP connects context, people and Places so you can move from uncertainty to an action you can actually take.</p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map(({ icon: Icon, eyebrow, title, body }) => (
                <article key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[.07] p-5 transition hover:-translate-y-0.5 hover:bg-white/[.11]">
                  <Icon className="h-5 w-5 text-amber-300" />
                  <p className="mt-8 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-100/60">{eyebrow}</p>
                  <h3 className="mt-2 text-lg font-extrabold leading-snug text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-emerald-50/70">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 border-b border-stone-900/10 bg-[#f0ede4]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-24">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">How it works</p>
                <h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Start with the situation you are actually in.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-stone-600">The flow is deliberately simple: give context, find something relevant, take the next step.</p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                { number: '01', icon: MapPin, title: 'Tell us where you are', body: 'Set your current city in Brazil. You can choose whether to appear on the map at city level.' },
                { number: '02', icon: HeartHandshake, title: 'Choose what you need', body: 'Your current need, languages and interests make the next suggestions more useful.' },
                { number: '03', icon: ArrowRight, title: 'Act on what you find', body: 'Open a Place, connect with a person, send a message or follow an external link.' },
              ].map(({ number, icon: Icon, title, body }) => (
                <article key={number} className="relative rounded-[1.5rem] border border-stone-900/10 bg-[#fbfaf6] p-6 shadow-sm">
                  <div className="flex items-center justify-between"><span className="font-display text-3xl font-extrabold tracking-tight text-emerald-700/35">{number}</span><Icon className="h-5 w-5 text-emerald-700" /></div>
                  <h3 className="mt-8 text-lg font-extrabold text-stone-900">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Why use it</p>
              <h2 className="mt-3 max-w-md font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Built for the next decision, not endless scrolling.</h2>
            </div>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {[
                { icon: BriefcaseBusiness, title: 'Practical by design', body: 'Discover useful places and references alongside people and community knowledge.' },
                { icon: MessageCircle, title: 'Human when it matters', body: 'Move from browsing to a private connection when another person can help.' },
                { icon: MapPinned, title: 'Local context first', body: 'Explore by city and current need instead of treating every traveler the same.' },
                { icon: ShieldCheck, title: 'Clearer boundaries', body: 'Use city-level visibility and decide what context you want to share.' },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="border-t border-stone-900/15 pt-4"><Icon className="h-5 w-5 text-emerald-700" /><h3 className="mt-5 text-lg font-extrabold text-stone-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-stone-900/10 bg-[#e1eee5]">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-10 lg:py-24">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">A focused alternative</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Not another feed to keep up with.</h2>
            </div>
            <div className="rounded-[1.75rem] border border-emerald-900/10 bg-white/70 p-6 sm:p-8">
              <p className="text-base leading-relaxed text-stone-700 sm:text-lg">BrazilBR is designed around a practical sequence: <strong className="text-stone-950">city → need → relevant person or Place → next action.</strong></p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {['Context before content', 'People and Places together', 'External links you can act on', 'Optional city-level visibility'].map((item) => <div key={item} className="flex items-start gap-2.5 text-sm font-bold text-stone-800"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</div>)}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-stone-500">The current MVP does not claim nationwide coverage, verified response times or guaranteed availability. It is a focused starting point for useful local context.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Pricing</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Free to use today.</h2>
            <p className="mt-5 text-base leading-relaxed text-stone-600 sm:text-lg">The current MVP has no active paid plan or checkout. Use the core experience without entering payment details while the product is being validated.</p>
          </div>
          <div className="mx-auto mt-8 max-w-xl rounded-[1.75rem] border-2 border-emerald-700/20 bg-[#e1eee5] p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-800">Current MVP</p><h3 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-950">Core BrazilBR access</h3></div><span className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-extrabold text-white">Free</span></div>
            <div className="mt-6 space-y-3">{['Create a profile and set your context', 'Explore people, Places and community knowledge', 'Use private connections and messages', 'Contribute text, links and external references'].map((item) => <div key={item} className="flex items-start gap-2.5 text-sm font-semibold text-stone-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{item}</div>)}</div>
            <button type="button" onClick={() => openStart()} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-extrabold text-white transition hover:bg-emerald-800 active:scale-[.98]">Create your free profile <ArrowRight className="h-4 w-4" /></button>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 border-t border-stone-900/10 bg-[#f0ede4]">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-18 lg:py-24">
            <div className="max-w-xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">FAQ</p><h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Before you start.</h2></div>
            <div className="mt-8 divide-y divide-stone-900/10 border-y border-stone-900/10">
              {faqs.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-extrabold text-stone-900 marker:hidden [&::-webkit-details-marker]:hidden"><span>{question}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 transition group-open:rotate-45"><span className="text-xl font-normal leading-none">+</span></span></summary><p className="max-w-2xl pr-10 pt-3 text-sm leading-relaxed text-stone-600">{answer}</p></details>)}
            </div>
          </div>
        </section>

        <section id="start" className="scroll-mt-24 bg-[#153f32] text-[#f7f5ef]">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[.95fr_1.05fr] lg:items-center lg:px-10 lg:py-24">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">Your next useful step</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">Start with the city you are in.</h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-emerald-50/75">Create your profile, add your current context and see whether BrazilBR can help with the next thing on your list.</p>
              <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-50/65"><ShieldCheck className="h-4 w-4 text-amber-300" />No payment or paid plan is active in the current MVP.</p>
            </div>

            <div className="rounded-[1.75rem] bg-[#fdfcf8] p-5 text-stone-900 shadow-[0_24px_70px_rgba(0,0,0,.18)] sm:p-7">
              {mode === 'welcome' ? (
                <div className="space-y-5">
                  <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Create your free profile</p><h3 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-950">Choose how to start.</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Your first step is authentication. You will set your BrazilBR context next.</p></div>
                  {displayedError && <div id="auth-error-banner" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /><div className="flex-1">{displayedError}</div></div>}
                  <div className="space-y-3">
                    <button id="btn-continue-google" type="button" onClick={handleGoogleSignIn} disabled={isBusy} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-stone-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60">{actionLoading === 'google' ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-stone-900">G</span>}<span>Continue with Google</span></button>
                    <button id="btn-continue-email" type="button" onClick={() => { clearAuthErrors(); setMode('email-signin'); }} disabled={isBusy} className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-stone-200 bg-white px-6 py-4 text-base font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 active:scale-[.99] disabled:opacity-60"><Mail className="h-5 w-5 text-stone-500" /><span>Continue with Email</span></button>
                  </div>
                  <p className="text-center text-xs text-stone-500">Already have an account? <button type="button" onClick={() => { clearAuthErrors(); setMode('email-signin'); }} className="font-bold text-emerald-700 hover:underline">Sign in</button></p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4"><button id="btn-back-to-welcome" type="button" onClick={() => { clearAuthErrors(); setMode('welcome'); }} className="flex items-center gap-1 text-sm font-medium text-stone-500 transition hover:text-stone-900"><ChevronLeft className="h-4 w-4" /><span>Back</span></button><h3 className="text-base font-bold text-stone-900">{mode === 'email-signup' ? 'Create Account' : 'Sign In'}</h3></div>
                  {displayedError && <div id="email-error-banner" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" /><div className="flex-1 text-xs leading-tight sm:text-sm">{displayedError}</div></div>}
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    {mode === 'email-signup' && <div><label htmlFor="input-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">Your Name <span className="font-normal normal-case">(Optional)</span></label><input id="input-name" type="text" placeholder="e.g. Alex Silva" value={name} onChange={(event) => setName(event.target.value)} disabled={isBusy} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>}
                    <div><label htmlFor="input-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">Email Address</label><input id="input-email" type="email" required placeholder="nomad@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isBusy} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
                    <div><label htmlFor="input-password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">Password</label><input id="input-password" type="password" required placeholder="At least 6 characters" value={password} onChange={(event) => setPassword(event.target.value)} disabled={isBusy} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" /></div>
                    <button id="btn-submit-email-auth" type="submit" disabled={isBusy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[.99] disabled:opacity-60">{actionLoading === 'email-signin' || actionLoading === 'email-signup' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>{mode === 'email-signup' ? 'Create account' : 'Sign in'}</span><ArrowRight className="h-4 w-4" /></>}</button>
                  </form>
                  <div className="border-t border-stone-100 pt-4 text-center text-xs text-stone-500">{mode === 'email-signup' ? <>Already have an account? <button id="btn-switch-to-signin" type="button" onClick={() => { clearAuthErrors(); setMode('email-signin'); }} className="font-bold text-emerald-700 hover:underline">Sign in</button></> : <>Don&apos;t have an account yet? <button id="btn-switch-to-signup" type="button" onClick={() => { clearAuthErrors(); setMode('email-signup'); }} className="font-bold text-emerald-700 hover:underline">Create account</button></>}</div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#102d25] px-5 py-8 text-emerald-50/75 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between lg:px-2"><div className="flex items-center gap-2 font-extrabold uppercase tracking-[0.14em] text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-[10px] text-white">BR</span>BrazilBR</div><p>Useful local context for people making a life in Brazil.</p><p className="text-emerald-50/50">Current MVP · no paid plan active</p></div>
      </footer>
    </div>
  );
};
