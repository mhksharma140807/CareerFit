import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';
import BrandLogo from '../components/BrandLogo';
import {
  Compass,
  LayoutDashboard,
  User,
  FileText,
  Briefcase,
  Bookmark,
  Award,
  CheckSquare,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
} from 'lucide-react';

export default function StudentLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);

  // Fetch genuine notifications
  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setUnreadCount(res.unreadCount || 0);
        setRecentNotifs(res.data ? res.data.slice(0, 5) : []);
      }
    } catch {
      // Graceful offline fallback
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Resume Analyzer', path: '/resume', icon: FileText, highlight: true },
    { label: 'Job Directory', path: '/jobs', icon: Briefcase },
    { label: 'Saved Jobs', path: '/saved-jobs', icon: Bookmark },
    { label: 'Assessment Center', path: '/assessments', icon: Award },
    { label: 'Improvement Plan', path: '/improvement-plan', icon: CheckSquare },
    { label: 'Progress History', path: '/progress', icon: TrendingUp },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-[#FAF8FF] dark:bg-[#090711] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar (Inspired by Orbit and mockai) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/90 dark:bg-obsidian-900/90 backdrop-blur-xl border-r border-brand-100/70 dark:border-brand-900/30 sticky top-0 h-screen z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-brand-100/60 dark:border-brand-900/30 flex items-center justify-between">
          <BrandLogo size="md" subtitle="Student Portal" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold shadow-md shadow-brand-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-brand-700 dark:hover:text-white hover:bg-brand-50/70 dark:hover:bg-brand-950/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      active ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      active
                        ? 'bg-white text-brand-700'
                        : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.highlight && !active && (
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Sidebar Feature Card (mockai style) */}
        <div className="p-3 border-t border-brand-100/60 dark:border-brand-900/30">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white shadow-md relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-200" />
              <span className="text-[11px] font-bold tracking-wide text-brand-100">
                Placement Readiness
              </span>
            </div>
            <p className="text-[11px] text-brand-100/90 leading-tight mb-2.5">
              Evaluate your skills against campus recruitment criteria.
            </p>
            <Link
              to="/resume"
              className="inline-flex items-center justify-center w-full py-1.5 px-3 rounded-xl bg-white text-brand-800 hover:bg-brand-50 text-[11px] font-extrabold shadow-xs transition-transform hover:scale-[1.02]"
            >
              Analyze Resume
            </Link>
          </div>

          {/* User Profile Capsule */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                {user?.name ? user.name[0] : 'S'}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || 'Student'}
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {user?.email || 'student@college.edu'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 glass-panel sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between border-b border-brand-100/60 dark:border-brand-900/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <Link to="/dashboard" className="hover:text-brand-600 dark:hover:text-brand-400 font-medium">
                Student
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-600 hover:bg-brand-50/60 dark:hover:bg-white/5 transition"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-white/5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications</span>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  {recentNotifs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No new notifications</p>
                  ) : (
                    <div className="space-y-1.5 max-h-64 overflow-y-auto">
                      {recentNotifs.map((n) => (
                        <div
                          key={n._id}
                          className="p-2.5 rounded-xl hover:bg-brand-50/60 dark:hover:bg-white/5 transition text-xs"
                        >
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 hover:bg-amber-100"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </Link>
            )}

            {/* Quick Profile Pill */}
            <Link
              to="/profile"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-slate-200 dark:border-white/10 hover:border-brand-300 dark:hover:border-brand-500/40 transition bg-white/70 dark:bg-obsidian-800/80"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center text-[11px] font-bold uppercase">
                {user?.name ? user.name[0] : 'S'}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:inline max-w-[100px] truncate">
                {user?.name || 'Student'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-obsidian-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-obsidian-900 border-r border-brand-100 dark:border-brand-900/30 flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-3">
              <BrandLogo size="sm" subtitle="Student Portal" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      active
                        ? 'bg-brand-600 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold"
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
