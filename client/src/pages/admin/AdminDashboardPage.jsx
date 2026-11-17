import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';
import {
  Users,
  Briefcase,
  Award,
  FileCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck,
  Plus,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError('');
        const [metricRes, healthRes] = await Promise.all([
          api.getAdminMetrics(),
          api.getHealth(),
        ]);

        if (metricRes.success) {
          setMetrics(metricRes.data);
        } else {
          setError(metricRes.error || 'Failed to load administrator metrics');
        }

        setHealth(healthRes);
      } catch (err) {
        setError(err.message || 'Error connecting to admin service');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    userCount = 0,
    jobCount = 0,
    assessmentCount = 0,
    attemptCount = 0,
    reportCount = 0,
    avgReadiness = 0,
    topSkills = [],
  } = metrics || {};

  return (
    <div className="space-y-8">
      {/* Header Banner (Royal Violet & Obsidian Twilight) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-electric-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-brand-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-300" />
            <span>Platform Operations & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Admin Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-brand-100/90 max-w-xl leading-relaxed">
            Monitor registered student cohorts, manage campus job requirements, update placement MCQ banks, and audit readiness evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/jobs"
            className="px-5 py-2.5 bg-white text-brand-900 rounded-xl text-xs font-bold transition shadow-md hover:bg-brand-50 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-brand-600" />
            <span>Post New Job</span>
          </Link>
          <Link
            to="/admin/assessments"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl text-xs font-semibold transition"
          >
            Manage Tests
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Row using StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Registered Students"
          value={userCount}
          subtext="Total candidate profiles"
          icon={Users}
          color="brand"
        />

        <StatCard
          label="Active Job Postings"
          value={jobCount}
          subtext="Curated placement roles"
          icon={Briefcase}
          color="emerald"
        />

        <StatCard
          label="MCQ Assessments"
          value={assessmentCount}
          subtext="Active question banks"
          icon={Award}
          color="purple"
        />

        <StatCard
          label="Average Readiness"
          value={`${avgReadiness}%`}
          subtext="Cohort readiness index"
          icon={TrendingUp}
          color="amber"
          trend={`${reportCount} reports total`}
          trendPositive={avgReadiness >= 65}
        />
      </div>

      {/* Grid: Quick Links & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Tiles (1 col) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Administrative Modules</h2>

          <Link
            to="/admin/jobs"
            className="p-4 glass-card border border-slate-200/80 dark:border-obsidian-750/70 hover:border-brand-500/50 rounded-2xl shadow-xs transition-all duration-200 flex items-center justify-between group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-105 transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">Job Catalog Manager</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Post, modify, and manage requirements</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/assessments"
            className="p-4 glass-card border border-slate-200/80 dark:border-obsidian-750/70 hover:border-brand-500/50 rounded-2xl shadow-xs transition-all duration-200 flex items-center justify-between group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric-500/10 text-electric-600 dark:text-electric-400 flex items-center justify-center group-hover:scale-105 transition">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">Assessment Questions</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Manage placement question bank</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-electric-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/users"
            className="p-4 glass-card border border-slate-200/80 dark:border-obsidian-750/70 hover:border-brand-500/50 rounded-2xl shadow-xs transition-all duration-200 flex items-center justify-between group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">User Management</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Inspect student accounts and permissions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
          </Link>

          {/* System Health Status Tile */}
          <div className="p-4 glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" />
                Backend Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  health?.status === 'ok'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                }`}
              >
                {health?.status === 'ok' ? 'Online' : 'Degraded'}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              Express REST API running on Node.js with MongoDB Mongoose persistence.
            </p>
          </div>
        </div>

        {/* Top Demanded Job Skills (2 cols) */}
        <div className="lg:col-span-2 glass-card border border-slate-200/80 dark:border-obsidian-750/70 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-500" />
              <span>Most In-Demand Skills in Job Directory</span>
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Aggregated across all listings</span>
          </div>

          <div className="space-y-3 pt-2">
            {topSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No skills aggregated yet.</p>
            ) : (
              topSkills.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.skill}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {item.count} job{item.count === 1 ? '' : 's'} ({item.frequency || 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-obsidian-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-600 to-electric-600 rounded-full transition-all duration-300"
                      style={{ width: `${item.frequency || 40}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
