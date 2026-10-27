import React from 'react';
import Navbar from './components/Navbar';
import HealthStatus from './components/HealthStatus';
import PhaseTracker from './components/PhaseTracker';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Platform Foundation</h2>
          <p className="text-sm text-slate-600 mt-1">
            CareerFit architecture verification, database models, and server-client communication link.
          </p>
        </div>

        {/* Real-time System Health */}
        <HealthStatus />

        {/* Phase Roadmap & Milestones */}
        <PhaseTracker />
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        CareerFit &bull; College Major Project &bull; Architecture Verified
      </footer>
    </div>
  );
}
