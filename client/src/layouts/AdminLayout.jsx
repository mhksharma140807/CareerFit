import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import {
  Shield,
  LayoutDashboard,
  Briefcase,
  HelpCircle,
  Users,
  Award,
  ArrowLeft,
  LogOut,
  Compass,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNav = [
    { label: 'Admin Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Job Management', path: '/admin/jobs', icon: Briefcase },
    { label: 'Assessments & MCQs', path: '/admin/assessments', icon: Award },
    { label: 'User Directory', path: '/admin/users', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Admin Sidebar (Inspired by Revenue Dark SaaS reference) */}
      <aside className="hidden lg:flex flex-col w-64 bg-obsidian-950/95 border-r border-white/10 sticky top-0 h-screen z-30">
        {/* Brand */}
        <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
          <BrandLogo size="md" subtitle="Admin Console" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    active ? 'text-white' : 'text-slate-500 group-hover:text-brand-400'
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Back to student portal + Admin profile footer */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition border border-white/5"
          >
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-brand-400" />
              <span>Student Portal</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <div className="w-7 h-7 rounded-full bg-brand-700 text-white flex items-center justify-center text-xs font-bold uppercase">
                A
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white truncate">Administrator</span>
                <span className="block text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-obsidian-950">
        <header className="h-16 bg-obsidian-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              Placement Administration
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link
              to="/dashboard"
              className="text-xs font-semibold text-brand-300 hover:text-white px-3 py-1.5 rounded-lg bg-brand-950/80 border border-brand-800/40 hover:bg-brand-900 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Exit to Student View</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-obsidian-950 border-r border-white/10 flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-3">
              <BrandLogo size="sm" subtitle="Admin Console" />
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1.5">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      active ? 'bg-brand-600 text-white font-bold' : 'text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/40 text-rose-400 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
