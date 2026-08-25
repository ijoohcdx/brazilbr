import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WelcomeScreen } from './components/WelcomeScreen';
import { HomeScreen } from './components/HomeScreen';
import { FirebaseSetupBanner } from './components/FirebaseSetupBanner';
import { Loader2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  
  // Track simple path state synced with window.location
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname === '/home' ? '/home' : '/';
  });

  // Handle URL change events (browser back/forward or manual navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname === '/home' ? '/home' : '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Protected route enforcement
  useEffect(() => {
    if (loading) return;

    if (!user && currentPath === '/home') {
      // Unauthenticated user trying to access /home -> redirect to /
      window.history.replaceState(null, '', '/');
      setCurrentPath('/');
    } else if (user && currentPath === '/') {
      // Authenticated user at / -> smoothly route to /home
      window.history.replaceState(null, '', '/home');
      setCurrentPath('/home');
    }
  }, [user, loading, currentPath]);

  // Loading Splash Screen while initializing Firebase auth state
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-stone-50 text-stone-800 p-6">
        <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-300">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            BR
          </div>
          <div className="text-center space-y-1">
            <h1 className="font-extrabold text-xl tracking-tight text-stone-900 uppercase font-display">
              BrazilBR
            </h1>
            <p className="text-xs text-stone-500 font-medium">
              Your Nomadic Friend in Brazil
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 pt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-start">
      <FirebaseSetupBanner />
      {user && currentPath === '/home' ? (
        <HomeScreen />
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
