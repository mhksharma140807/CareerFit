import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import {
  Compass,
  Briefcase,
  HelpCircle,
  ArrowRight,
  LayoutDashboard,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function PublicLayout() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] dark:bg-[#090711] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Floating Glass Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-brand-100/60 dark:border-brand-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Unified Brand Logo with Role-Aware Navigation */}
          <BrandLogo size="md" />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                isActive('/')
                  ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 font-bold border border-brand-200/60 dark:border-brand-800/40'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                isActive('/jobs')
                  ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 font-bold border border-brand-200/60 dark:border-brand-800/40'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-brand-500" />
              <span>Job Directory</span>
            </Link>
            <Link
              to="/help"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all ${
                isActive('/help')
                  ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 font-bold border border-brand-200/60 dark:border-brand-800/40'
                  : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
              <span>Placement FAQ & Guide</span>
            </Link>
          </nav>

          {/* Right Controls: Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 shadow-md shadow-brand-500/25 transition-all duration-200 hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Admin Console' : 'Student Dashboard'}</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/20 transition-all duration-200 hover:scale-[1.02]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-brand-100 dark:border-brand-900/40 px-4 pt-2 pb-5 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/jobs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Job Directory
            </Link>
            <Link
              to="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Placement FAQ & Guide
            </Link>

            {!isAuthenticated && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-white bg-brand-600 rounded-xl"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Page Slot */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Unified Footer */}
      <footer className="border-t border-slate-200/80 dark:border-obsidian-800 bg-white/70 dark:bg-obsidian-950/70 backdrop-blur-md text-xs text-slate-500 dark:text-slate-400 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Autonomous career readiness evaluation platform for engineering students. Deterministic Venn matching, AI resume insights, and verified placement assessments.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Core Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Campus Job Directory
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Readiness Index Guide
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  Candidate Sign In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Transparency
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  85/15 Venn Match Formula
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-brand-600 dark:hover:text-brand-400 transition">
                  60/40 Readiness Metric
                </Link>
              </li>
              <li>
                <span className="text-brand-600 dark:text-brand-400 font-semibold">
                  Zero Budget Policy (₹0 Free Tier)
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Operational Standard
            </h4>
            <p className="text-xs leading-relaxed">
              Designed as an academic major project with zero fabricated data, local deterministic fallbacks, and server-side evaluation integrity.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Deployment Ready</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-obsidian-800/80 py-6 text-center text-[11px] text-slate-400">
          CareerFit &bull; College Major Project &bull; Fully Explainable Architecture
        </div>
      </footer>
    </div>
  );
}
