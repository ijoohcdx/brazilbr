import React, { useState } from 'react';
import { isFirebaseConfigured } from '../firebase/config';
import { KeyRound, CheckCircle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

export const FirebaseSetupBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isFirebaseConfigured) {
    return null;
  }

  const envSample = `VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 pt-3">
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-3.5 shadow-xs text-xs text-amber-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <KeyRound className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Firebase Configuration Notice</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-medium underline text-[11px] cursor-pointer"
          >
            {isOpen ? (
              <>
                <span>Hide details</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Setup Guide</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        <p className="mt-1 text-amber-800 text-[11px] leading-relaxed">
          Provide your Firebase environment variables to connect live Google &amp; Email Authentication.
        </p>

        {isOpen && (
          <div className="mt-3 pt-3 border-t border-amber-200/70 space-y-2.5">
            <p className="font-semibold text-stone-800">
              Required environment variables:
            </p>
            <div className="relative">
              <pre className="bg-stone-900 text-stone-100 p-2.5 rounded-xl text-[10px] overflow-x-auto font-mono">
                {envSample}
              </pre>
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute top-2 right-2 p-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-md transition-colors"
                title="Copy snippet"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <ul className="space-y-1 text-[11px] text-amber-900 list-disc list-inside">
              <li>Enable <strong>Google</strong> &amp; <strong>Email/Password</strong> in Firebase Console.</li>
              <li>Create a <strong>Cloud Firestore</strong> database. Firebase Storage is not required for the MVP.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
