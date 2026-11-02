import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
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
      <div className="space-y-6">
        <div className="h-28 bg-slate-200/60 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200/60 rounded-2xl animate-pulse" />
          ))}
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold mb-2">
            <span>Student Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {latestReport
              ? `Your placement readiness for ${latestReport.jobTitle} is currently ${latestReport.readinessIndex}%. Review your improvement tasks below.`
              : 'Complete your student profile and compare your skills against curated jobs to start generating readiness reports.'}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          <Link
            to="/jobs"
            className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 transition shadow-xs"
          >
            Check Job Matches
          </Link>
          <Link
            to="/assessments"
            className="px-4 py-2 bg-emerald-500/40 hover:bg-emerald-500/60 text-white border border-emerald-400/40 rounded-xl text-xs font-semibold transition"
          >
            Take Placement Quiz
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Readiness Index */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Placement Readiness</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {latestReport ? `${latestReport.readinessIndex}%` : 'N/A'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {latestReport
                ? latestReport.readinessIndex >= 80
                  ? 'Placement Ready'
                  : 'Needs Skill Improvement'
                : 'No report generated yet'}
            </span>
          </div>
          <Link
            to={latestReport ? `/reports/${latestReport._id}` : '/jobs'}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>{latestReport ? 'View Full Report' : 'Match a Job First'}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 2: Profile Completion */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Profile Completion</span>
            <CheckSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">{profileScore}%</span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all"
                style={{ width: `${profileScore}%` }}
              />
            </div>
          </div>
          <Link to="/profile" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Manage Profile & Skills</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 3: Tests Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Assessments Passed</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">{passedTestsCount}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Across {recentAttempts.length} total attempts
            </span>
          </div>
          <Link to="/assessments" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Browse Question Bank</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Metric 4: Improvement Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Improvement Tasks</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="my-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {improvementData?.completedCount || 0} / {improvementData?.totalTasks || 0}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {improvementData?.progressPercentage || 0}% milestone progress
            </span>
          </div>
          <Link to="/improvement-plan" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>Open Study Plan</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Improvement Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Attempts (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Assessment Attempts</h2>
              <p className="text-xs text-slate-500">Objective test evaluations recorded on server</p>
            </div>
            <Link to="/assessments" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
              Take New Test
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <Award className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-600">No assessments attempted yet</p>
              <p className="text-[11px]">Validate your aptitude and technical skills to compute your readiness index.</p>
              <Link
                to="/assessments"
                className="inline-block mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
              >
                Start First Assessment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAttempts.slice(0, 4).map((att) => (
                <div key={att._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {att.assessmentId?.title || 'Placement Quiz'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Score: {att.score}/{att.totalQuestions} &bull;{' '}
                      <span className={att.percentage >= 70 ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                        {att.percentage}% ({att.percentage >= 70 ? 'Passed' : 'Needs Practice'})
                      </span>
                    </p>
                  </div>
                  <Link
                    to={`/assessments/attempts/${att._id}`}
                    className="text-xs font-semibold text-slate-600 hover:text-emerald-600 px-3 py-1 bg-slate-50 hover:bg-emerald-50 rounded-lg border border-slate-200 transition"
                  >
                    View Diagnostic
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Improvement Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/resume"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition border border-slate-100"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Analyze & Extract Resume</span>
              </Link>
              <Link
                to="/jobs"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition border border-slate-100"
              >
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Browse Job Directory</span>
              </Link>
              <Link
                to="/improvement-plan"
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition border border-slate-100"
              >
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold">Open Improvement Plan</span>
              </Link>
            </div>
          </div>

          {/* Top Recommendation Box */}
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Priority Recommendation</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {latestReport?.criticalGaps?.length > 0
                ? `You have ${latestReport.criticalGaps.length} critical gaps for ${latestReport.jobTitle}. Start with: ${latestReport.criticalGaps[0]}.`
                : 'Take an assessment in JavaScript or Quantitative Reasoning to boost your verified placement score.'}
            </p>
            <Link
              to="/assessments"
              className="inline-block mt-2 text-xs font-bold text-emerald-700 hover:underline"
            >
              Start Practice Session &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

