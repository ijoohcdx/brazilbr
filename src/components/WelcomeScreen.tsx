import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Loader2, AlertCircle, Sparkles, ChevronLeft, ShieldCheck } from 'lucide-react';
import type { AuthMode } from '../types';

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

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    await loginWithGoogle();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

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
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-b from-stone-100 via-stone-50 to-emerald-50/40 px-5 py-8 sm:py-12 sm:px-8 max-w-md mx-auto">
      {/* Top Brand Bar */}
      <header className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm text-white font-bold tracking-wider text-sm">
            BR
          </div>
          <span className="font-bold text-stone-900 tracking-wider text-base uppercase">
            BrazilBR
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-100/80 text-emerald-800 rounded-full border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          MVP Auth
        </div>
      </header>

      {/* Main Content Area */}
      <main className="my-auto py-8">
        {mode === 'welcome' ? (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Friendly Hero Banner */}
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-xs font-medium border border-amber-200/70">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>Your Nomadic Friend in Brazil</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                BRAZILBR
              </h1>

              <p className="text-stone-600 text-base sm:text-lg leading-relaxed font-normal">
                Discover what to do, where to go and what&apos;s possible around you.
              </p>
            </div>

            {/* Error Message */}
            {displayedError && (
              <div
                id="auth-error-banner"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5 animate-in slide-in-from-top-1"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{displayedError}</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3.5 pt-2">
              {/* Primary: Google Sign In */}
              <button
                id="btn-continue-google"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 active:scale-[0.99] text-white font-semibold py-4 px-6 rounded-2xl shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-base cursor-pointer"
              >
                {actionLoading === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.8 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Secondary: Email Option */}
              <button
                id="btn-continue-email"
                type="button"
                onClick={() => {
                  clearError();
                  setLocalError(null);
                  setMode('email-signin');
                }}
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-stone-50 active:scale-[0.99] text-stone-800 font-semibold py-4 px-6 rounded-2xl border border-stone-200/90 shadow-sm transition-all duration-200 disabled:opacity-60 text-base cursor-pointer"
              >
                <Mail className="w-5 h-5 text-stone-500" />
                <span>Continue with Email</span>
              </button>
            </div>
          </div>
        ) : (
          /* Email Auth Card */
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <button
                id="btn-back-to-welcome"
                type="button"
                onClick={() => {
                  clearError();
                  setLocalError(null);
                  setMode('welcome');
                }}
                className="flex items-center gap-1 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <h2 className="text-base font-bold text-stone-900">
                {mode === 'email-signup' ? 'Create Account' : 'Sign In'}
              </h2>
            </div>

            {/* Error Message */}
            {displayedError && (
              <div
                id="email-error-banner"
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs sm:text-sm font-medium leading-tight">
                  {displayedError}
                </div>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'email-signup' && (
                <div>
                  <label
                    htmlFor="input-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                  >
                    Your Name (Optional)
                  </label>
                  <input
                    id="input-name"
                    type="text"
                    placeholder="e.g. Alex Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isBusy}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="input-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="input-email"
                  type="email"
                  required
                  placeholder="nomad@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBusy}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
                />
              </div>

              <div>
                <label
                  htmlFor="input-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="input-password"
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBusy}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
                />
              </div>

              <button
                id="btn-submit-email-auth"
                type="submit"
                disabled={isBusy}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold py-3.5 px-5 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-60 text-sm cursor-pointer mt-2"
              >
                {actionLoading === 'email-signin' || actionLoading === 'email-signup' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{mode === 'email-signup' ? 'Create account' : 'Sign in'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-stone-100 text-center">
              {mode === 'email-signup' ? (
                <p className="text-xs text-stone-500">
                  Already have an account?{' '}
                  <button
                    id="btn-switch-to-signin"
                    type="button"
                    onClick={() => {
                      clearError();
                      setLocalError(null);
                      setMode('email-signin');
                    }}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </p>
              ) : (
                <p className="text-xs text-stone-500">
                  Don&apos;t have an account yet?{' '}
                  <button
                    id="btn-switch-to-signup"
                    type="button"
                    onClick={() => {
                      clearError();
                      setLocalError(null);
                      setMode('email-signup');
                    }}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Assurance */}
      <footer className="text-center pt-4">
        <div className="inline-flex items-center gap-1.5 text-xs text-stone-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Secure Firebase Authentication</span>
        </div>
      </footer>
    </div>
  );
};
