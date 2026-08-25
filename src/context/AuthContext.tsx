import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  signUpWithEmail as authSignUpWithEmail,
  logoutUser,
  getFriendlyAuthErrorMessage,
} from '../firebase/auth';
import { syncUserProfile, getUserProfile } from '../firebase/userProfile';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  actionLoading: 'google' | 'email-signin' | 'email-signup' | 'logout' | null;
  error: string | null;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<'google' | 'email-signin' | 'email-signup' | 'logout' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Listen to Firebase auth state changes
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!isMounted) return;

        if (firebaseUser) {
          setUser(firebaseUser);
          try {
            // Sync/fetch Firestore user profile
            const profile = await syncUserProfile(firebaseUser);
            if (isMounted) {
              setUserProfile(profile);
            }
          } catch (profileErr) {
            console.error('Failed to sync profile on auth state change:', profileErr);
            // Fallback profile representation if Firestore permissions or offline
            if (isMounted) {
              setUserProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Nomad'),
                photoURL: firebaseUser.photoURL,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString(),
              });
            }
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }

        if (isMounted) {
          setLoading(false);
        }
      },
      (authError) => {
        console.error('onAuthStateChanged error:', authError);
        if (isMounted) {
          setError(getFriendlyAuthErrorMessage(authError));
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    clearError();
    setActionLoading('google');
    try {
      const cred = await authSignInWithGoogle();
      if (cred.user) {
        const profile = await syncUserProfile(cred.user);
        setUserProfile(profile);
      }
      return true;
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [clearError]);

  const loginWithEmail = useCallback(async (email: string, pass: string): Promise<boolean> => {
    clearError();
    setActionLoading('email-signin');
    try {
      const cred = await authSignInWithEmail(email, pass);
      if (cred.user) {
        const profile = await syncUserProfile(cred.user);
        setUserProfile(profile);
      }
      return true;
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [clearError]);

  const registerWithEmail = useCallback(
    async (email: string, pass: string, name?: string): Promise<boolean> => {
      clearError();
      setActionLoading('email-signup');
      try {
        const cred = await authSignUpWithEmail(email, pass, name);
        if (cred.user) {
          const profile = await syncUserProfile(cred.user);
          setUserProfile(profile);
        }
        return true;
      } catch (err) {
        setError(getFriendlyAuthErrorMessage(err));
        return false;
      } finally {
        setActionLoading(null);
      }
    },
    [clearError]
  );

  const logout = useCallback(async () => {
    clearError();
    setActionLoading('logout');
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }, [clearError]);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    try {
      const profile = await getUserProfile(auth.currentUser.uid);
      if (profile) {
        setUserProfile(profile);
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      actionLoading,
      error,
      isConfigured: isFirebaseConfigured,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      clearError,
      refreshProfile,
    }),
    [
      user,
      userProfile,
      loading,
      actionLoading,
      error,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      clearError,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
