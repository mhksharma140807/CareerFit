import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import PasswordStrengthIndicator from '../../components/PasswordStrengthIndicator';
import { evaluatePasswordStrength } from '../../utils/validators';
import {
  Settings,
  Lock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Bell,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Local preferences toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [assessmentReminders, setAssessmentReminders] = useState(true);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const passwordEval = evaluatePasswordStrength(newPassword);
    if (!passwordEval.allMet) {
      setError('New password must fulfill all 5 strong password criteria.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(res.message || res.error || 'Failed to update password');
      }
    } catch (err) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Account Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
          Manage your account credentials, security preferences, and active authentication session.
        </p>
      </div>

      {/* Account Profile Summary Card */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-electric-500 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-md">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Role: {user?.role || 'student'}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Change Password Form */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-obsidian-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-brand-500" />
            <span>Change Password</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Update your account password to maintain security.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New Password (Strong 8+ characters) *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters with upper, lower, number, symbol"
              className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs p-3 border border-slate-200 dark:border-obsidian-800 rounded-xl bg-slate-50/60 dark:bg-obsidian-900/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 via-electric-600 to-brand-500 hover:from-brand-500 hover:to-electric-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-glow-brand flex items-center gap-2"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="border-b border-slate-100 dark:border-obsidian-800 pb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-brand-500" />
            <span>Notification Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure how and when CareerFit alerts you of job matches and test scores.
          </p>
        </div>

        <div className="space-y-4 max-w-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Job Match Alerts</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notify when a posted campus job matches your profile at 75%+
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-obsidian-750 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-obsidian-800">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Assessment Evaluations</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send alert as soon as your placement test attempt is graded
              </p>
            </div>
            <input
              type="checkbox"
              checked={assessmentReminders}
              onChange={(e) => setAssessmentReminders(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded border-slate-300 dark:border-obsidian-750 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
