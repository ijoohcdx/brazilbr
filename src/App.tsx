import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SeoHead } from './components/SeoHead';
import { SeoLandingPage } from './components/SeoLandingPage';
import { getSeoConfig, PUBLIC_SEO_PATHS } from './seo';
import { HomeScreen } from './components/HomeScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DiscoverScreen } from './components/DiscoverScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { MessagesScreen } from './components/MessagesScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { MyProfileScreen } from './components/MyProfileScreen';
import { GroupsScreen } from './components/GroupsScreen';
import { SearchScreen } from './components/SearchScreen';
import { ContributionsScreen } from './components/ContributionsScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { FriendsScreen } from './components/FriendsScreen';
import { MapScreen } from './components/MapScreen';
import { PlaceProfileScreen } from './components/PlaceProfileScreen';
import { FirebaseSetupBanner } from './components/FirebaseSetupBanner';
import { Loader2 } from 'lucide-react';

const KNOWN_PATHS = new Set([...PUBLIC_SEO_PATHS, '/home','/onboarding','/map','/place','/discover','/profile','/messages','/conversation','/groups','/search','/contribute','/notifications','/friends']);

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

    if (PUBLIC_SEO_PATHS.has(currentPath) && currentPath !== '/') return;

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
  const activePlaceId = new URLSearchParams(window.location.search).get('placeId') || (currentPath === '/place' ? new URLSearchParams(window.location.search).get('id') : null);

  const handleOnboardingComplete = () => {
    navigate('/home', true);
  };

  if (PUBLIC_SEO_PATHS.has(currentPath) && currentPath !== '/') {
    return <SeoLandingPage config={getSeoConfig(currentPath)} />;
  }

    if (loading || (user && profileLoading)) {
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
      <SeoHead path={currentPath} noindex={!PUBLIC_SEO_PATHS.has(currentPath)} />
      <FirebaseSetupBanner />
      {user && currentPath === '/onboarding' ? (
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      ) : user && currentPath === '/map' ? (
        <MapScreen onNavigate={navigate} onOpenPlace={(placeId) => navigate(`/place?id=${encodeURIComponent(placeId)}`)} onOpenProfile={(uid) => navigate(`/profile?uid=${encodeURIComponent(uid)}`)} />
      ) : user && currentPath === '/place' && activePlaceId ? (
        <PlaceProfileScreen placeId={activePlaceId} onBack={() => navigate('/map')} onNavigate={navigate} />
      ) : user && currentPath === '/discover' ? (
        <DiscoverScreen onOpenProfile={(uid) => navigate(`/profile?uid=${encodeURIComponent(uid)}`)} onOpenSearch={() => navigate('/search')} />
      ) : user && currentPath === '/profile' && profileUid ? (
        <ProfileScreen uid={profileUid} onBack={() => navigate('/discover')} onOpenConversation={(conversationId) => navigate(`/conversation?id=${encodeURIComponent(conversationId)}`)} />
      ) : user && currentPath === '/profile' ? (
        <MyProfileScreen onNavigate={navigate} />
      ) : user && currentPath === '/messages' ? (
        <MessagesScreen onOpenConversation={(conversation) => navigate(`/conversation?id=${encodeURIComponent(conversation.id)}`)} />
      ) : user && currentPath === '/groups' ? (
        <GroupsScreen onNavigate={navigate} />
      ) : user && currentPath === '/search' ? (
        <SearchScreen onBack={() => navigate('/discover')} onOpenProfile={(uid) => navigate(`/profile?uid=${encodeURIComponent(uid)}`)} onOpenPlace={(placeId) => navigate(`/place?id=${encodeURIComponent(placeId)}`)} />
      ) : user && currentPath === '/contribute' ? (
        <ContributionsScreen onBack={() => navigate('/home')} onOpenPlace={(placeId) => navigate(`/place?id=${encodeURIComponent(placeId)}`)} />
      ) : user && currentPath === '/notifications' ? (
        <NotificationsScreen onBack={() => navigate('/home')} />
      ) : user && currentPath === '/friends' ? (
        <FriendsScreen onBack={() => navigate('/home')} onOpenGroups={() => navigate('/groups')} onOpenProfile={(uid) => navigate(`/profile?uid=${encodeURIComponent(uid)}`)} />
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
