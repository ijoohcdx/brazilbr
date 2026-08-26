import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MessagesScreen } from './components/MessagesScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { MyProfileScreen } from './components/MyProfileScreen';
import { FirebaseSetupBanner } from './components/FirebaseSetupBanner';
import { Loader2 } from 'lucide-react';

const KNOWN_PATHS = new Set(['/','/home','/onboarding','/discover','/profile','/messages','/conversation']);

const pathnameFrom = (path: string) => new URL(path, window.location.origin).pathname;

const MainApp: React.FC = () => {
  const { user, userProfile, loading, profileLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const path = window.location.pathname;
    return KNOWN_PATHS.has(path) ? path : '/';
  });

  const navigate = (path: string, replace = false) => {
    if (replace) {
      window.history.replaceState(null, '', path);
    } else {
      window.history.pushState(null, '', path);
    }
    setCurrentPath(pathnameFrom(path));
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(KNOWN_PATHS.has(path) ? path : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (currentPath !== '/') navigate('/', true);
      return;
    }

    if (!userProfile || profileLoading) return;

    if (!userProfile.onboardingCompleted && currentPath !== '/onboarding') {
      navigate('/onboarding', true);
      return;
    }

    if (userProfile.onboardingCompleted && (currentPath === '/' || currentPath === '/onboarding')) {
      navigate('/home', true);
    }
  }, [user, userProfile, loading, profileLoading, currentPath]);

  const profileUid = new URLSearchParams(window.location.search).get('uid');
  const activeConversationId = new URLSearchParams(window.location.search).get('id');

  const handleOnboardingComplete = () => {
    navigate('/home', true);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-stone-50 p-6 text-stone-800 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white shadow-md">BR</div>
          <div className="space-y-1 text-center">
            <h1 className="font-display text-xl font-extrabold uppercase tracking-tight text-stone-900">BrazilBR</h1>
            <p className="text-xs font-medium text-stone-500">Your Nomadic Friend in Brazil</p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-emerald-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-start">
      <FirebaseSetupBanner />
      {user && currentPath === '/onboarding' ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : user && currentPath === '/discover' ? (
        <DiscoverScreen onOpenProfile={(uid) => navigate(`/profile?uid=${encodeURIComponent(uid)}`)} />
      ) : user && currentPath === '/profile' && profileUid ? (
        <ProfileScreen uid={profileUid} onBack={() => navigate('/discover')} onOpenConversation={(conversationId) => navigate(`/conversation?id=${encodeURIComponent(conversationId)}`)} />
      ) : user && currentPath === '/profile' ? (
        <MyProfileScreen onNavigate={navigate} />
      ) : user && currentPath === '/messages' ? (
        <MessagesScreen onOpenConversation={(conversation) => navigate(`/conversation?id=${encodeURIComponent(conversation.id)}`)} />
      ) : user && currentPath === '/conversation' && activeConversationId ? (
        <ConversationScreen conversationId={activeConversationId} onBack={() => navigate('/messages')} />
      ) : user && (currentPath === '/' || currentPath === '/home') ? (
        <HomeScreen onNavigate={navigate} />
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
