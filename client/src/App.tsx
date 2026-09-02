import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { ForgotPasswordPage } from '@/components/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { HabitsPage } from '@/components/habits/HabitsPage';
import { CalendarPage } from '@/components/calendar/CalendarPage';
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage';
import { ProfilePage } from '@/components/profile/ProfilePage';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Root redirect based on authentication */}
      <Route
        path="/"
        element={
          loading ? (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0F19]">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        }
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Protected App Routes inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
