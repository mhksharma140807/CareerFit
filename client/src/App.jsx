import React, { useState, useEffect } from 'react';
import { api, tokenStorage } from './services/api';
import Navbar from './components/Navbar';
import ProfileView from './components/ProfileView';
import JobDirectory from './components/JobDirectory';
import HealthStatus from './components/HealthStatus';
import PhaseTracker from './components/PhaseTracker';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [initialChecking, setInitialChecking] = useState(true);

  // Check persisted auth session on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenStorage.get();
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            tokenStorage.clear();
            setUser(null);
          }
        } catch {
          tokenStorage.clear();
          setUser(null);
        }
      }
      setInitialChecking(false);
    };

    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {initialChecking ? (
          <div className="text-center py-16 text-xs text-slate-500">
            Checking session...
          </div>
        ) : (
          <>
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onRequireAuth={() => setIsAuthOpen(true)}
              />
            )}

            {activeTab === 'jobs' && <JobDirectory />}

            {activeTab === 'health' && (
              <div className="space-y-6">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">Platform Foundation & Health</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    System health verification, database connectivity, and milestone roadmap.
                  </p>
                </div>
                <HealthStatus />
                <PhaseTracker />
              </div>
            )}
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        CareerFit &bull; Career Readiness and Job Matching Platform &bull; Phase 2 Active
      </footer>
    </div>
  );
}
