import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Compass,
  MapPin,
  HelpCircle,
  Wallet,
  Footprints,
  Loader2,
  CheckCircle2,
  User as UserIcon,
  House,
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate?: (path: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { userProfile, user, logout, actionLoading } = useAuth();

  // Extract first name cleanly
  const rawName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Friend';
  const firstName = rawName.trim().split(' ')[0] || 'Friend';
  const fullName = userProfile?.displayName || user?.displayName || user?.email || 'Nomad Explorer';
  const email = userProfile?.email || user?.email || 'No email provided';
  const photoURL = userProfile?.photoURL || user?.photoURL;

  const isLoggingOut = actionLoading === 'logout';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50/50 via-stone-50 to-stone-100 flex flex-col justify-between px-5 py-8 sm:py-12 sm:px-8 max-w-md mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            BR
          </div>
          <div>
            <span className="font-bold text-stone-900 tracking-tight text-base uppercase">
              BrazilBR
            </span>
            <p className="text-[11px] text-stone-500 font-medium leading-none mt-0.5">
              Your Nomadic Friend
            </p>
          </div>
        </div>

        {/* Minimal Sign Out in Header / Top Right */}
        <button
          id="btn-header-signout"
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-rose-600 bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-stone-200/80 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span>Sign out</span>
        </button>
      </header>

      {/* Main Body */}
      <main className="my-auto py-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Hey, {firstName}.
          </h1>
          <p className="text-stone-600 text-lg font-medium">
            Welcome to BrazilBR.
          </p>
        </div>

        {/* Small Profile Section */}
        <section
          id="user-profile-card"
          className="bg-white p-4.5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4"
        >
          {photoURL ? (
            <img
              src={photoURL}
              alt={fullName}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/20 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/90 text-emerald-800 font-bold text-xl flex items-center justify-center border-2 border-emerald-500/20 shadow-xs shrink-0">
              {firstName.charAt(0).toUpperCase() || <UserIcon className="w-6 h-6" />}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-stone-900 truncate">
                {fullName}
              </h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-xs text-stone-500 truncate mt-0.5 font-normal">
              {email}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-600 font-mono">
              <span className="truncate">UID: {userProfile?.uid ? `${userProfile.uid.slice(0, 8)}...` : 'Connected'}</span>
            </div>
          </div>
        </section>

        {/* Status Section */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs">
              <Compass className="w-5 h-5 text-amber-300 animate-spin-slow" />
            </div>
            <h3 className="font-bold text-base sm:text-lg tracking-tight">
              Your Nomadic Friend is getting ready.
            </h3>
          </div>
          <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
            The foundation is in place. Soon BrazilBR will guide your exploration across Brazil with local insights tailored to your journey.
          </p>
        </section>

        {/* Next Step Placeholder (Informational only, per specification) */}
        <section className="bg-stone-100/90 p-5 rounded-2xl border border-stone-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Coming in Next Stage
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
              Nomad Context
            </span>
          </div>

          <p className="text-xs text-stone-600">
            In the next update, BrazilBR will personalize your recommendations by asking:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200/60 text-stone-700 font-medium">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Where you are</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200/60 text-stone-700 font-medium">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>What you need</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200/60 text-stone-700 font-medium">
              <Wallet className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Your budget</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-stone-200/60 text-stone-700 font-medium">
              <Footprints className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>How you move</span>
            </div>
          </div>
        </section>
      </main>

      <nav className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-stone-200/80 bg-white/90 p-1.5 shadow-xs" aria-label="Primary navigation">
        <button type="button" onClick={() => onNavigate?.('/home')} className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white"><House className="h-4 w-4" />Home</button>
        <button type="button" onClick={() => onNavigate?.('/discover')} className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-600 transition hover:bg-emerald-50 hover:text-emerald-700"><Compass className="h-4 w-4" />Discover</button>
      </nav>

      {/* Footer / Primary Sign Out Action */}
      <footer className="pt-4">
        <button
          id="btn-signout-main"
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 active:scale-[0.99] font-semibold py-3.5 px-5 rounded-2xl border border-stone-200/90 shadow-xs transition-all duration-200 disabled:opacity-60 text-sm cursor-pointer"
        >
          {isLoggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
          ) : (
            <LogOut className="w-4 h-4 text-stone-400 group-hover:text-rose-600" />
          )}
          <span>Sign out</span>
        </button>
      </footer>
    </div>
  );
};
