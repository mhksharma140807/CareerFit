import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
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
      <div className="space-y-6">
        <div className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Operations & Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Admin Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Monitor registered student cohorts, manage campus job requirements, update placement MCQ banks, and audit readiness evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/jobs"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </Link>
          <Link
            to="/admin/assessments"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition"
          >
            Manage Tests
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{userCount}</div>
            <div className="text-xs font-semibold text-slate-500">Registered Students</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{jobCount}</div>
            <div className="text-xs font-semibold text-slate-500">Active Job Postings</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{assessmentCount}</div>
            <div className="text-xs font-semibold text-slate-500">MCQ Assessments</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{avgReadiness}%</div>
            <div className="text-xs font-semibold text-slate-500">Average Readiness Index</div>
          </div>
        </div>
      </div>

      {/* Grid: Quick Links & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation Tiles (1 col) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Administrative Modules</h2>

          <Link
            to="/admin/jobs"
            className="p-4 bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl shadow-xs transition flex items-center justify-between group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Job Catalog Manager</h3>
                <p className="text-[11px] text-slate-500">Post, modify, and manage requirements</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/assessments"
            className="p-4 bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl shadow-xs transition flex items-center justify-between group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Assessment Questions</h3>
                <p className="text-[11px] text-slate-500">Manage placement question bank</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            to="/admin/users"
            className="p-4 bg-white border border-slate-200/80 hover:border-indigo-400 rounded-2xl shadow-xs transition flex items-center justify-between group block"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">User Management</h3>
                <p className="text-[11px] text-slate-500">Inspect student accounts and permissions</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
          </Link>

          {/* System Health Status Tile */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Backend Status
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  health?.status === 'ok'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {health?.status === 'ok' ? 'Online' : 'Degraded'}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Express REST API running on Node.js with MongoDB Mongoose persistence.
            </p>
          </div>
        </div>

        {/* Top Demanded Job Skills (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Most In-Demand Skills in Job Directory</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">Aggregated across all listings</span>
          </div>

          <div className="space-y-3 pt-2">
            {topSkills.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No skills aggregated yet.</p>
            ) : (
              topSkills.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.skill}</span>
                    <span className="text-slate-500 font-medium">
                      {item.count} job{item.count === 1 ? '' : 's'} ({item.frequency || 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
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

