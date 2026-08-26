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
  profileLoading: boolean;
  actionLoading: 'google' | 'email-signin' | 'email-signup' | 'logout' | null;
  error: string | null;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function fallbackProfile(user: User): UserProfile {
  const now = new Date().toISOString();
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Nomad'),
    photoURL: user.photoURL,
    bio: '',
    homeCountry: '',
    currentCountry: 'Brazil',
    currentCity: '',
    languages: [],
    interests: [],
    travelStatus: null,
    travelStyle: null,
    onboardingCompleted: false,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    lastActiveAt: now,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<'google' | 'email-signin' | 'email-signup' | 'logout' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    let isMounted = true;

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      setProfileLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!isMounted) return;

        setUser(firebaseUser);
        setLoading(false);

        if (!firebaseUser) {
          setUserProfile(null);
          setProfileLoading(false);
          return;
        }

        setUserProfile(fallbackProfile(firebaseUser));
        setProfileLoading(true);

        void syncUserProfile(firebaseUser)
          .then((profile) => {
            if (isMounted && auth.currentUser?.uid === firebaseUser.uid) {
              setUserProfile(profile);
            }
          })
          .catch((profileErr) => {
            console.error('Failed to sync profile after auth state change:', profileErr);
          })
          .finally(() => {
            if (isMounted && auth.currentUser?.uid === firebaseUser.uid) {
              setProfileLoading(false);
            }
          });
      },
      (authError) => {
        console.error('onAuthStateChanged error:', authError);
        if (isMounted) {
          setError(getFriendlyAuthErrorMessage(authError));
          setLoading(false);
          setProfileLoading(false);
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
      await authSignInWithGoogle();
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
      await authSignInWithEmail(email, pass);
      return true;
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [clearError]);

  const registerWithEmail = useCallback(async (email: string, pass: string, name?: string): Promise<boolean> => {
    clearError();
    setActionLoading('email-signup');
    try {
      await authSignUpWithEmail(email, pass, name);
      return true;
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [clearError]);

  const logout = useCallback(async () => {
    clearError();
    setActionLoading('logout');
    try {
      await logoutUser();
      setUser(null);
      setUserProfile(null);
      setProfileLoading(false);
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  }, [clearError]);

  const completeOnboarding = useCallback((data: Partial<UserProfile>) => {
    if (!user) return;
    const now = new Date().toISOString();
    setUserProfile((currentProfile) => ({
      ...fallbackProfile(user),
      ...currentProfile,
      ...data,
      uid: user.uid,
      email: user.email ?? currentProfile?.email ?? null,
      photoURL: user.photoURL ?? currentProfile?.photoURL ?? null,
      onboardingCompleted: true,
      updatedAt: now,
      lastActiveAt: now,
    }));
    setProfileLoading(false);
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (!auth?.currentUser) return;
    setProfileLoading(true);
    try {
      setUserProfile(await getUserProfile(auth.currentUser.uid));
    } catch (err) {
      console.warn('Could not refresh profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      userProfile,
      loading,
      profileLoading,
      actionLoading,
      error,
      isConfigured: isFirebaseConfigured,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
      clearError,
      refreshProfile,
      completeOnboarding,
    }),
    [user, userProfile, loading, profileLoading, actionLoading, error, loginWithGoogle, loginWithEmail, registerWithEmail, logout, clearError, refreshProfile, completeOnboarding]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
