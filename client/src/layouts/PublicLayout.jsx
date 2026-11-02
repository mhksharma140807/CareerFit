import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Briefcase, HelpCircle, ArrowRight, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

export default function PublicLayout() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">CareerFit</span>
              <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-widest block leading-none">
                Placement Readiness
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition ${
                isActive('/') ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                isActive('/jobs') ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Job Directory</span>
            </Link>
            <Link
              to="/help"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                isActive('/help') ? 'text-emerald-700 bg-emerald-50' : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help & FAQ</span>
            </Link>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Go to {isAdmin ? 'Admin' : 'Dashboard'}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">CareerFit Platform</span>
            <span>&bull;</span>
            <span>Career Readiness and Job Matching Engine</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/jobs" className="hover:text-emerald-700">Job Directory</Link>
            <Link to="/help" className="hover:text-emerald-700">Methodology & FAQ</Link>
            <Link to="/login" className="hover:text-emerald-700">Sign In</Link>
            <Link to="/register" className="hover:text-emerald-700">Student Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

