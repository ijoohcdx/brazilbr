/**
 * Firebase App & Service Initialization
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

const requiredFirebaseConfigValues = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
];

const hasUsableValue = (value: string) =>
  Boolean(value) && value !== 'MY_FIREBASE_API_KEY' && !value.includes('YOUR_');

const hasFirebaseConfig = requiredFirebaseConfigValues.every(hasUsableValue);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (hasFirebaseConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
    console.error(
      'Firebase initialization failed. Check the VITE_FIREBASE_* environment variables.',
      error,
    );
  }
}

export const isFirebaseConfigured = Boolean(auth && db);

export function requireFirebaseAuth(): Auth {
  if (!auth) {
    const error = new Error(
      'Firebase Authentication is not configured. Set the VITE_FIREBASE_* environment variables.',
    ) as Error & { code: string };
    error.code = 'auth/configuration-not-found';
    throw error;
  }

  return auth;
}

export function requireFirebaseFirestore(): Firestore {
  if (!db) {
    throw new Error(
      'Cloud Firestore is not configured. Set the VITE_FIREBASE_* environment variables.',
    );
  }

  return db;
}

export function requireFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    const error = new Error('Firebase Storage is not configured. Enable Storage in the Firebase Console.') as Error & { code: string };
    error.code = 'storage/configuration-not-found';
    throw error;
  }
  return storage;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, auth, db, storage, firebaseConfig, googleProvider };
