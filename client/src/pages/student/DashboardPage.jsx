import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import RadialGauge from '../../components/RadialGauge';
import StatCard from '../../components/StatCard';
import {
  Compass,
  FileText,
  Award,
  Briefcase,
  CheckSquare,
  Sparkles,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Target,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [improvementData, setImprovementData] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [profileRes, attemptsRes, reportRes, planRes] = await Promise.all([
          api.getProfile(),
          api.getMyAttempts(),
          api.getLatestReport(),
          api.getImprovementPlan(),
        ]);

        if (profileRes.success) setProfile(profileRes.profile);
        if (attemptsRes.success) setRecentAttempts(attemptsRes.data || []);
        if (reportRes.success) setLatestReport(reportRes.data);
        if (planRes.success) setImprovementData(planRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-44 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
          <div className="lg:col-span-4 h-80 bg-slate-200/70 dark:bg-obsidian-800/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate profile completeness
  let profileScore = 20; // base signup
  if (profile?.college) profileScore += 20;
  if (profile?.graduationYear) profileScore += 20;
  if ((profile?.skills || []).length >= 3) profileScore += 20;
  if ((profile?.projects || []).length >= 1) profileScore += 20;

  const passedTestsCount = recentAttempts.filter((a) => a.percentage >= 70).length;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner (Orbit + Trovix Twilight Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-electric-900 dark:from-obsidian-900 dark:via-brand-950 dark:to-obsidian-900 p-6 sm:p-8 text-white shadow-xl border border-brand-500/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-electric-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-brand-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Student Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Candidate'}! 👋
            </h1>
            <p className="text-brand-100/90 text-xs sm:text-sm leading-relaxed">
              {latestReport
                ? `Your placement readiness for "${latestReport.jobTitle}" is evaluated at ${latestReport.readinessIndex}%. Review your weak topics and improvement checklist below.`
                : 'Complete your candidate profile, parse your resume, and compare skills against curated placement roles to compute your readiness index.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/jobs"
              className="px-5 py-2.5 rounded-xl bg-white text-brand-900 text-xs font-bold shadow-md hover:bg-brand-50 transition-all duration-200 flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-brand-600" />
              <span>Check Job Matches</span>
            </Link>
            <Link
              to="/assessments"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-brand-300" />
              <span>Take Assessment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Card KPI Metric Grid (Inspired by Orbit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Index */}
        <StatCard
          label="Placement Readiness"
          value={latestReport ? `${latestReport.readinessIndex}%` : 'N/A'}
          subtext={
            latestReport
              ? latestReport.readinessIndex >= 80
                ? 'Placement Ready (Top Tier)'
                : 'Needs Skill Improvement'
              : 'No report generated yet'
          }
          icon={Target}
          color="brand"
          trend={latestReport ? `${latestReport.readinessIndex}% composite` : null}
          trendPositive={latestReport?.readinessIndex >= 70}
        />

        {/* Metric 2: Profile Completion */}
        <StatCard
          label="Profile Completion"
          value={`${profileScore}%`}
          subtext={`${profile?.skills?.length || 0} verified skills listed`}
          icon={CheckSquare}
          color="purple"
          trend={profileScore === 100 ? 'Complete' : 'Needs details'}
          trendPositive={profileScore >= 80}
        />

        {/* Metric 3: Tests Completed */}
        <StatCard
          label="Assessments Passed"
          value={passedTestsCount}
          subtext={`Across ${recentAttempts.length} total attempts`}
          icon={Award}
          color="emerald"
          trend={`${recentAttempts.length > 0 ? Math.round((passedTestsCount / recentAttempts.length) * 100) : 0}% pass rate`}
          trendPositive={passedTestsCount > 0}
        />

        {/* Metric 4: Improvement Progress */}
        <StatCard
          label="Improvement Tasks"
          value={`${improvementData?.completedCount || 0}/${improvementData?.totalTasks || 0}`}
          subtext={`${improvementData?.progressPercentage || 0}% checklist completed`}
          icon={TrendingUp}
          color="amber"
          trend={`${improvementData?.progressPercentage || 0}% done`}
          trendPositive={(improvementData?.progressPercentage || 0) >= 50}
        />
      </div>

      {/* Main Grid: Assessment Attempts + Right Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Attempts (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-2xl border border-slate-200/80 dark:border-obsidian-750/70 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-obsidian-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-500" />
                <span>Recent Assessment Attempts</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Server-side evaluated MCQ diagnostic quizzes
              </p>
            </div>
            <Link
              to="/assessments"
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 transition"
            >
              <span>Take New Quiz</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto border border-brand-500/20">
                <Award className="w-6 h-6" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">No assessments attempted yet</p>
              <p className="text-[11px] max-w-sm mx-auto">
                Validate your aptitude and technical skills to compute the objective test component of your readiness index.
              </p>
              <Link
                to="/assessments"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-electric-600 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-glow-brand transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Start Practice Quiz</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-obsidian-800">
              {recentAttempts.slice(0, 5).map((att) => (
                <div key={att._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {att.assessmentId?.title || 'Placement Evaluation Quiz'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>Score: {att.score}/{att.totalQuestions}</span>
                      <span>&bull;</span>
                      <span className={att.percentage >= 70 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-600 dark:text-amber-400 font-bold'}>
                        {att.percentage}% ({att.percentage >= 70 ? 'Passed' : 'Needs Practice'})
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/assessments/attempts/${att._id}`}
                    className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 px-3 py-1.5 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/50 rounded-xl border border-brand-200/60 dark:border-brand-800/60 transition flex items-center gap-1"
                  >
                    <span>View Diagnostic</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Improvement Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <div className="glass-card rounded-2xl border border-slate-200/80 dark:border-obsidian-750/70 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>Quick Actions</span>
            </h3>
            <div className="space-y-2">
              <Link
                to="/resume"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-obsidian-900/70 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 transition border border-slate-200/60 dark:border-obsidian-800 group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">Resume Analyzer</p>
                  <p className="text-[10px] text-slate-400">Extract skills & ATS score</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition" />
              </Link>

              <Link
                to="/jobs"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-obsidian-900/70 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 transition border border-slate-200/60 dark:border-obsidian-800 group"
              >
                <div className="w-8 h-8 rounded-lg bg-electric-100 dark:bg-electric-950/60 text-electric-600 dark:text-electric-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">Job Directory</p>
                  <p className="text-[10px] text-slate-400">Venn match 85/15 ratio</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition" />
              </Link>

              <Link
                to="/improvement-plan"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 dark:bg-obsidian-900/70 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-300 transition border border-slate-200/60 dark:border-obsidian-800 group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">Improvement Plan</p>
                  <p className="text-[10px] text-slate-400">Actionable prep tasks</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition" />
              </Link>
            </div>
          </div>

          {/* Top Recommendation Box */}
          <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-electric-500/5 to-transparent dark:from-brand-950/40 dark:via-obsidian-900/40 dark:to-transparent p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Priority Recommendation</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {latestReport?.criticalGaps?.length > 0
                ? `You have ${latestReport.criticalGaps.length} critical gap(s) for "${latestReport.jobTitle}". Focus on mastering: ${latestReport.criticalGaps.slice(0, 2).join(', ')}.`
                : 'Take an assessment in Core CS, Aptitude, or Web Engineering to boost your composite readiness index.'}
            </p>
            <Link
              to="/assessments"
              className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>Start Practice Session</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
