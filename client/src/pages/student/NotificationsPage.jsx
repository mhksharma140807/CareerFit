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
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'assessment_result':
      case 'assessment_evaluated':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'readiness_update':
      case 'report_ready':
        return <FileCheck className="w-4 h-4 text-teal-600" />;
      case 'profile_completion':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'assessment_result') return n.type === 'assessment_result' || n.type === 'assessment_evaluated';
    if (activeFilter === 'readiness_update') return n.type === 'readiness_update' || n.type === 'report_ready';
    return n.type === activeFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="h-24 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
            <Bell className="w-4 h-4" />
            <span>Activity & Placement Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Genuine alerts triggered by your assessment results, job match thresholds, and readiness reports.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 bg-white border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-xl transition shadow-xs"
              title="Clear all notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeFilter === 'unread'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveFilter('job_match')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeFilter === 'job_match'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Job Matches
        </button>
        <button
          onClick={() => setActiveFilter('assessment_result')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeFilter === 'assessment_result'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Assessments
        </button>
        <button
          onClick={() => setActiveFilter('readiness_update')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap ${
            activeFilter === 'readiness_update'
              ? 'bg-slate-900 text-white'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Reports
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You're all caught up! New alerts will appear here when events occur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleMarkAsRead(notif._id, notif.link)}
              className={`p-4 sm:p-5 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
                !notif.isRead
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                {getCategoryIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-sm ${
                        !notif.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>

                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                {notif.link && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 pt-1">
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

