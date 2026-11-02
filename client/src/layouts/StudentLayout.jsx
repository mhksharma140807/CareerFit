import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
    const interval = setInterval(fetchNotifs, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Resume Analyzer', path: '/resume', icon: FileText },
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
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight">CareerFit</span>
              <span className="text-[10px] font-medium text-emerald-600 block leading-none">Student Portal</span>
            </div>
          </Link>
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
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition ${active
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-200">
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            </div>
          )}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Student'}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg border border-slate-200 transition flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm">CareerFit</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Notifications</span>
                    <Link
                      to="/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {recentNotifs.length > 0 ? (
                      recentNotifs.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => {
                            setNotifDropdownOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition ${!n.isRead ? 'bg-emerald-50/40' : ''
                            }`}
                        >
                          <p className="font-semibold text-slate-900">{n.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No recent notifications.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <span className="text-xs font-semibold text-slate-800 hidden sm:inline">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile Slideout Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-slate-900/40" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-slate-200 z-50">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">CareerFit Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-500" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px]">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Console</span>
                  </Link>
                )}
              </nav>
              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={logout}
                  className="w-full py-2 px-3 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Top 4 actions) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-2 shadow-lg">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 py-1 ${isActive('/dashboard') ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>
        <Link
          to="/jobs"
          className={`flex flex-col items-center justify-center flex-1 py-1 ${isActive('/jobs') ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
        >
          <Briefcase className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Jobs</span>
        </Link>
        <Link
          to="/assessments"
          className={`flex flex-col items-center justify-center flex-1 py-1 ${isActive('/assessments') ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
        >
          <Award className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Tests</span>
        </Link>
        <Link
          to="/profile"
          className={`flex flex-col items-center justify-center flex-1 py-1 ${isActive('/profile') ? 'text-emerald-600 font-bold' : 'text-slate-500'
            }`}
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

