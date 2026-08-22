import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { StudioLayout } from './components/studio/StudioLayout';
import { MultiChannelTabs } from './components/channels/MultiChannelTabs';
import { SettingsModal } from './components/settings/SettingsModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { LandingPage } from './components/landing/LandingPage';
import { UpdateBanner } from './components/updater/UpdateBanner';
import { useSession } from './lib/auth-client';
import { useMarlexStore } from './lib/store/useMarlexStore';
import { isElectron } from './lib/runtime';
import { RefreshCw } from 'lucide-react';

export function App() {
  const inElectron = isElectron();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const forceAppMode = searchParams?.get('app') === 'true';

  // If in standard web browser and not forced to studio, show high-converting Marketing Landing Page
  if (!inElectron && !forceAppMode) {
    return <LandingPage />;
  }

  const { data: session, isPending, error, refetch } = useSession();
  const [activeTab, setActiveTab] = useState<'studio' | 'channels' | 'history'>('studio');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const { syncUserWithProjects } = useMarlexStore();

  // Sync active project and team owner with authenticated user credentials
  useEffect(() => {
    if (session?.user) {
      syncUserWithProjects(session.user);
    }
  }, [session?.user, syncUserWithProjects]);

  // Safety timeout to prevent hanging on initial load if server is warming up
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthTimedOut(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // 1. Loading splash screen while verifying session with Better Auth / Supabase
  if (isPending && !authTimedOut && !isOfflineMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-zinc-950 text-zinc-100 select-none font-sans">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-2xl shadow-amber-500/20 font-black text-zinc-950 text-3xl mb-6 animate-pulse">
          M
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          <span>Синхронизация сессии Marlex...</span>
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: If NOT logged in, show AuthScreen
  if (!session?.user && !isOfflineMode) {
    return (
      <AuthScreen
        onSuccess={() => {
          refetch();
        }}
        onOfflineContinue={() => {
          setIsOfflineMode(true);
          syncUserWithProjects({
            id: 'usr_local',
            name: 'Локальный пользователь',
            email: 'local@marlex.studio',
          });
        }}
      />
    );
  }

  // 3. Fully Authenticated Workspace
  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* In-App Auto-Updater Notification Banner */}
      <UpdateBanner />

      {/* Top Application Bar with User Profile */}
      <Header
        user={session?.user || { id: 'usr_local', name: 'Локальный пользователь', email: 'local@marlex.studio' }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Studio Views */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'studio' && <StudioLayout />}
        {activeTab === 'channels' && <MultiChannelTabs />}
      </main>

      {/* LLM & Global App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;

