import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from './config';

/**
 * Maps raw Firebase Auth errors to friendly, human-readable messages.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was canceled before finishing.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for BrazilBR.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Would you like to create one?';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please try again in a few moments.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled yet in the Firebase Console.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time.';
    case 'auth/internal-error':
      return 'Firebase service error. Please check your configuration and try again.';
    default:
      if (err.message && err.message.includes('API key not valid')) {
        return 'Firebase API key is invalid or not yet configured. Please set your Firebase credentials.';
      }
      return err.message || 'Authentication could not be completed. Please try again.';
  }
}

/**
 * Sign in using Google Popup
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  
  if (displayName && displayName.trim() && credential.user) {
    try {
      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });
    } catch (e) {
      console.warn('Could not set displayName on Auth user:', e);
    }
  }

  return credential;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email.trim(), pass);
}

/**
 * Sign out the current user
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}
