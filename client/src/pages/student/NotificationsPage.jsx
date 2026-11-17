import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Bell,
  CheckCircle2,
  Briefcase,
  Award,
  FileCheck,
  UserCheck,
  Trash2,
  CheckCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'job_match' | 'assessment_evaluated' | 'report_ready'

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getNotifications();

      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } else {
        setError(res.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to notifications service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAsRead = async (id, link) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      if (link) {
        navigate(link);
      }
    } catch (err) {
      console.error('Error marking read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await api.markAllNotificationsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      const res = await api.clearNotifications();
      if (res.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const getCategoryIcon = (type) => {
    switch (type) {
      case 'job_match':
        return <Briefcase className="w-4 h-4 text-brand-500" />;
      case 'assessment_result':
      case 'assessment_evaluated':
        return <Award className="w-4 h-4 text-electric-500" />;
      case 'readiness_update':
      case 'report_ready':
        return <FileCheck className="w-4 h-4 text-emerald-500" />;
      case 'profile_completion':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-brand-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-28 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'job_match') return n.type === 'job_match';
    if (activeFilter === 'assessment_evaluated') return n.type === 'assessment_evaluated' || n.type === 'assessment_result';
    if (activeFilter === 'report_ready') return n.type === 'report_ready' || n.type === 'readiness_update';
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Platform Activity Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2.5 text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-600 text-white">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Real-time activity regarding newly matched jobs, graded assessments, and computed readiness indices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 glass-card hover:bg-slate-50 dark:hover:bg-obsidian-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-obsidian-750 transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-brand-500" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-obsidian-800">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'unread', label: 'Unread' },
          { id: 'job_match', label: 'Job Matches' },
          { id: 'assessment_evaluated', label: 'Assessments' },
          { id: 'report_ready', label: 'Readiness Reports' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-slate-900 dark:bg-obsidian-800 text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="text-center py-16 glass-card border border-slate-200 dark:border-obsidian-800 rounded-3xl p-8 space-y-3">
          <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">No notifications</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
            You are completely caught up with your placement alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const isUnread = !n.isRead;

            return (
              <div
                key={n._id}
                onClick={() => handleMarkAsRead(n._id, n.link)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                  isUnread
                    ? 'glass-card border-brand-500/40 bg-brand-500/5 dark:bg-brand-950/20'
                    : 'glass-card border-slate-200/80 dark:border-obsidian-750/70 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(n.type)}
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.message}
                  </p>
                </div>

                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
