import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl border border-slate-200/80 dark:border-obsidian-750/70 shadow-xl max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">403 — Administrative Access Restricted</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          You do not possess the required administrator privileges to access this area. If you are a placement coordinator or faculty evaluator, please sign in with an authorized account.
        </p>

        <div className="pt-4 flex flex-col gap-2.5">
          <Link
            to="/dashboard"
            className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-electric-600 hover:from-brand-500 hover:to-electric-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-glow-brand transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="w-full py-2.5 px-4 bg-slate-100 dark:bg-obsidian-900 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-obsidian-800 transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-obsidian-800"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Different Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
