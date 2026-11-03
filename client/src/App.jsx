import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, PublicOnlyRoute } from './components/RouteGuards';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';
import AssessmentAttemptLayout from './layouts/AssessmentAttemptLayout';

// Public & Auth Pages
import HomePage from './pages/public/HomePage';
import JobDirectoryPage from './pages/public/JobDirectoryPage';
import JobDetailsPage from './pages/public/JobDetailsPage';
import HelpPage from './pages/public/HelpPage';
import UnauthorizedPage from './pages/public/UnauthorizedPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Student Pages
import DashboardPage from './pages/student/DashboardPage';
import ProfilePage from './pages/student/ProfilePage';
import ResumeAnalyzerPage from './pages/student/ResumeAnalyzerPage';
import JobMatchPage from './pages/student/JobMatchPage';
import AssessmentCenterPage from './pages/student/AssessmentCenterPage';
import TakeAssessmentPage from './pages/student/TakeAssessmentPage';
import AssessmentResultPage from './pages/student/AssessmentResultPage';
import ReadinessReportPage from './pages/student/ReadinessReportPage';
import ImprovementPlanPage from './pages/student/ImprovementPlanPage';
import ProgressPage from './pages/student/ProgressPage';
import SavedJobsPage from './pages/student/SavedJobsPage';
import NotificationsPage from './pages/student/NotificationsPage';
import SettingsPage from './pages/student/SettingsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminAssessmentsPage from './pages/admin/AdminAssessmentsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public & Informational Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobDirectoryPage />} />
            <Route path="/jobs/:id" element={<JobDetailsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Route>

          {/* Authentication Routes (Public Only) */}
          <Route element={<AuthLayout />}>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPasswordPage />
                </PublicOnlyRoute>
              }
            />
          </Route>

          {/* Student Protected Routes (Standard Shell with Sidebar & Genuine Notifications) */}
          <Route
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/resume" element={<ResumeAnalyzerPage />} />
            <Route path="/jobs/:id/match" element={<JobMatchPage />} />
            <Route path="/assessments" element={<AssessmentCenterPage />} />
            <Route path="/assessments/attempts/:attemptId" element={<AssessmentResultPage />} />
            <Route path="/reports/:reportId" element={<ReadinessReportPage />} />
            <Route path="/improvement-plan" element={<ImprovementPlanPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Distraction-Free Assessment Attempt Route */}
          <Route
            element={
              <ProtectedRoute>
                <AssessmentAttemptLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/assessments/:id/attempt" element={<TakeAssessmentPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="assessments" element={<AdminAssessmentsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* 404 Catch-All Fallback */}
          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
