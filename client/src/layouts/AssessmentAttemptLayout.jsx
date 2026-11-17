import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import { ShieldCheck, LogOut } from 'lucide-react';

export default function AssessmentAttemptLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#090711] flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Secure Test Proctor Header */}
      <header className="h-14 glass-panel border-b border-brand-100/60 dark:border-brand-900/30 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" clickable={false} />
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
            <ShieldCheck className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            Verified Assessment Environment
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to exit the assessment? Your unsaved progress may be lost.')) {
                navigate('/assessments');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Exam</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

