import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home, Briefcase } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900">404 — Page Not Found</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested page URL does not exist or has been relocated within the CareerFit platform.
        </p>

        <div className="pt-4 flex flex-col gap-2">
          <Link
            to="/"
            className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home Page</span>
          </Link>
          <Link
            to="/jobs"
            className="w-full py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Browse Job Directory</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

