import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home, Briefcase } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-obsidian-750/70 shadow-xl max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
          <AlertCircle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">404 — Page Not Found</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The requested page URL does not exist or has been relocated within the CareerFit platform.
        </p>

        <div className="pt-4 flex flex-col gap-2.5">
          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-electric-600 hover:from-brand-500 hover:to-electric-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Page</span>
          </Link>
          <Link
            to="/jobs"
            className="w-full py-2.5 px-4 bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-obsidian-800 transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-obsidian-800"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse Job Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
