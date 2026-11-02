import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900">403 — Administrative Access Restricted</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You do not possess the required administrator privileges to access this area. If you are a placement coordinator or faculty evaluator, please sign in with an authorized account.
        </p>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            to="/dashboard"
            className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Student Dashboard</span>
          </Link>
          <Link
            to="/login"
            className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In with Different Account</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

