import React from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  HeartHandshake,
  MapPin,
  MapPinned,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { SeoHead } from './SeoHead';
import type { PublicSeoConfig } from '../seo';

const START_HREF = '/#start';

const iconForCard = [UsersRound, MapPinned, MessageCircle, ShieldCheck];

export const SeoLandingPage: React.FC<{ config: PublicSeoConfig }> = ({ config }) => {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f5ef] text-stone-900">
      <SeoHead path={config.path} />
      <header className="sticky top-0 z-30 border-b border-stone-900/10 bg-[#f7f5ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-10">
          <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="BrazilBR home">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-sm font-extrabold tracking-wider text-white shadow-sm">BR</span>
            <span className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-stone-900 sm:text-base">BrazilBR</span>
          </a>
          <nav className="hidden items-center gap-5 text-xs font-bold text-stone-500 md:flex" aria-label="SEO page navigation">
            <a href="#why" className="transition hover:text-emerald-700">Why BrazilBR</a>
            <a href="#how" className="transition hover:text-emerald-700">How it works</a>
            <a href="#faq" className="transition hover:text-emerald-700">FAQ</a>
          </nav>
          <a href={START_HREF} className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[.98]">Get started <ArrowRight className="h-3.5 w-3.5" /></a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-stone-900/10 bg-[#e1eee5]">
          <div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(15,61,46,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,61,46,.08)_1px,transparent_1px)] [background-size:34px_34px]" />
          <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[1.03fr_.97fr] lg:items-center lg:gap-16 lg:px-10 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/15 bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-emerald-900"><Sparkles className="h-3.5 w-3.5 text-amber-600" />{config.eyebrow}</div>
              <h1 className="mt-6 max-w-2xl font-display text-[clamp(2.6rem,10vw,5.4rem)] font-extrabold leading-[.94] tracking-[-0.055em] text-stone-950">{config.headline}</h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-stone-700 sm:text-lg">{config.subheadline}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"><a href={START_HREF} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_30px_rgba(4,120,87,.18)] transition hover:bg-emerald-800 active:scale-[.98]">Start free <ArrowRight className="h-4 w-4" /></a><a href="#how" className="inline-flex items-center justify-center rounded-2xl border border-stone-900/15 bg-white/60 px-5 py-4 text-sm font-bold text-stone-800 transition hover:bg-white">See how it works</a></div>
              <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-stone-600"><ShieldCheck className="h-4 w-4 text-emerald-700" />No paid plan is active in the current MVP.</p>
            </div>
            <div className="relative lg:pl-4">
              <div className="absolute -right-5 -top-6 h-28 w-28 rounded-full bg-amber-300/40 blur-2xl sm:-right-2" />
              <div className="relative rounded-[2rem] border border-stone-900/10 bg-[#fdfcf8] p-3 shadow-[0_24px_70px_rgba(39,64,49,.16)] sm:p-5" role="img" aria-label="BrazilBR product preview showing city, current need, people and Places">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-stone-500"><span>BrazilBR preview</span><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">Not live data</span></div>
                <div className="mt-4 rounded-[1.5rem] bg-[#dbece0] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-900/60">Your context</p><p className="mt-1 text-lg font-extrabold tracking-tight text-emerald-950">A city in Brazil</p></div><div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5 text-[10px] font-bold text-emerald-900"><MapPin className="h-3.5 w-3.5" /> city-level</div></div><div className="mt-5 rounded-2xl border border-emerald-900/10 bg-white/75 p-3.5"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-500">What do you need right now?</p><div className="mt-3 grid grid-cols-2 gap-2"><span className="rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white">Meet people</span><span className="rounded-xl bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-700">Find food</span><span className="rounded-xl bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-700">Find a place</span><span className="rounded-xl bg-stone-100 px-3 py-2.5 text-xs font-bold text-stone-700">Find work</span></div></div></div>
                <div className="mt-3 grid grid-cols-3 gap-2">{[{ icon: UsersRound, label: 'People' }, { icon: MapPinned, label: 'Places' }, { icon: MessageCircle, label: 'Messages' }].map(({ icon: Icon, label }) => <div key={label} className="rounded-2xl border border-stone-200 bg-white p-3 text-center"><Icon className="mx-auto h-4 w-4 text-emerald-700" /><p className="mt-2 text-[10px] font-extrabold uppercase tracking-wider text-stone-600">{label}</p></div>)}</div>
                <div className="mt-3 flex flex-wrap gap-2 rounded-2xl border border-stone-200 bg-white p-3"><span className="rounded-full bg-stone-100 px-3 py-1.5 text-[10px] font-bold text-stone-700">Maps</span><span className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-bold text-amber-900">Menu</span><span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-bold text-emerald-900">WhatsApp</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20"><div className="grid gap-8 border-b border-stone-900/10 pb-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-20"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Search intent: {config.intentLabel}</p><h2 className="mt-3 max-w-md font-display text-3xl font-extrabold leading-tight tracking-[-0.035em] text-stone-950 sm:text-4xl">{config.problemTitle}</h2></div><div className="max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg"><p>{config.problemBody}</p><p className="mt-4 font-bold text-stone-900">{config.audienceTitle}. {config.audienceBody}</p></div></div></section>

        <section id="why" className="scroll-mt-24 bg-[#153f32] text-[#f7f5ef]"><div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-24"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">The solution</p><h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">{config.solutionTitle}</h2><p className="mt-5 max-w-xl text-base leading-relaxed text-emerald-50/75 sm:text-lg">{config.solutionBody}</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{config.cards.map(({ title, body }, index) => { const Icon = iconForCard[index % iconForCard.length]; return <article key={title} className="rounded-[1.5rem] border border-white/10 bg-white/[.07] p-5 transition hover:bg-white/[.11]"><Icon className="h-5 w-5 text-amber-300" /><h3 className="mt-8 text-lg font-extrabold leading-snug text-white">{title}</h3><p className="mt-3 text-sm leading-relaxed text-emerald-50/70">{body}</p></article>; })}</div></div></section>

        <section id="how" className="scroll-mt-24 border-b border-stone-900/10 bg-[#f0ede4]"><div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-24"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">How it works</p><h2 className="mt-3 max-w-xl font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">A direct path from context to action.</h2></div><p className="max-w-sm text-sm leading-relaxed text-stone-600">Give context, find something relevant and decide what to do next.</p></div><div className="mt-10 grid gap-4 md:grid-cols-3">{config.steps.map(({ number, title, body }) => <article key={number} className="rounded-[1.5rem] border border-stone-900/10 bg-[#fbfaf6] p-6 shadow-sm"><div className="flex items-center justify-between"><span className="font-display text-3xl font-extrabold tracking-tight text-emerald-700/35">{number}</span><ArrowRight className="h-5 w-5 text-emerald-700" /></div><h3 className="mt-8 text-lg font-extrabold text-stone-900">{title}</h3><p className="mt-3 text-sm leading-relaxed text-stone-600">{body}</p></article>)}</div></div></section>

        <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-24"><div className="grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:gap-20"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-700">Why BrazilBR</p><h2 className="mt-3 max-w-md font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Local context, without promising what the MVP cannot prove.</h2></div><div className="grid gap-x-8 gap-y-8 sm:grid-cols-2"><div className="border-t border-stone-900/15 pt-4"><BriefcaseBusiness className="h-5 w-5 text-emerald-700" /><h3 className="mt-5 text-lg font-extrabold text-stone-900">Practical references</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Open Places and follow external references for Maps, menus, websites, bookings or contact.</p></div><div className="border-t border-stone-900/15 pt-4"><HeartHandshake className="h-5 w-5 text-emerald-700" /><h3 className="mt-5 text-lg font-extrabold text-stone-900">People with context</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Discover public profiles by city, languages, interests and the context they choose to share.</p></div><div className="border-t border-stone-900/15 pt-4"><MapPinned className="h-5 w-5 text-emerald-700" /><h3 className="mt-5 text-lg font-extrabold text-stone-900">City-level boundary</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">Map visibility is optional and the product is designed around city-level context.</p></div><div className="border-t border-stone-900/15 pt-4"><ShieldCheck className="h-5 w-5 text-emerald-700" /><h3 className="mt-5 text-lg font-extrabold text-stone-900">A focused start</h3><p className="mt-2 text-sm leading-relaxed text-stone-600">The current MVP does not claim nationwide coverage, guaranteed availability or verified response times.</p></div></div></div></section>

        <section id="faq" className="scroll-mt-24 border-t border-stone-900/10 bg-[#f0ede4]"><div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 lg:py-24"><div className="max-w-xl"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">FAQ</p><h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] text-stone-950 sm:text-5xl">Before you start.</h2></div><div className="mt-8 divide-y divide-stone-900/10 border-y border-stone-900/10">{config.faq.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-left text-base font-extrabold text-stone-900 marker:hidden [&::-webkit-details-marker]:hidden"><span>{question}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 transition group-open:rotate-45"><span className="text-xl font-normal leading-none">+</span></span></summary><p className="max-w-2xl pr-10 pt-3 text-sm leading-relaxed text-stone-600">{answer}</p></details>)}</div></div></section>

        <section className="bg-[#153f32] text-[#f7f5ef]"><div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:px-10 lg:py-20"><div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-amber-300">Next step</p><h2 className="mt-3 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-5xl">Start with the city you are in.</h2><p className="mt-4 max-w-xl text-base leading-relaxed text-emerald-50/75">Create your profile, add your current context and see whether BrazilBR can help with the next thing on your list.</p></div><a href={START_HREF} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-4 text-sm font-extrabold text-emerald-950 transition hover:bg-amber-200 active:scale-[.98]">Create your free profile <ArrowRight className="h-4 w-4" /></a></div></div></section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16"><div className="border-t border-stone-900/10 pt-8"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-stone-500">Explore more BrazilBR</p><div className="mt-4 grid gap-3 sm:grid-cols-3">{config.related.map(({ label, path }) => <a key={path} href={path} className="flex items-center justify-between rounded-2xl border border-stone-900/10 bg-white/60 px-4 py-4 text-sm font-bold text-stone-800 transition hover:border-emerald-700/30 hover:bg-white"><span>{label}</span><ArrowRight className="h-4 w-4 text-emerald-700" /></a>)}</div></div></section>
      </main>

      <footer className="bg-[#102d25] px-5 py-8 text-emerald-50/75 sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between lg:px-2"><div className="flex items-center gap-2 font-extrabold uppercase tracking-[0.14em] text-white"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-[10px] text-white">BR</span>BrazilBR</div><p>Useful local context for people making a life in Brazil.</p><p className="text-emerald-50/50">Current MVP · no paid plan active</p></div></footer>
    </div>
  );
};
