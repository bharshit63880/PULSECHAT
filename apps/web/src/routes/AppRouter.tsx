import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { Skeleton } from '@/components/common/Skeleton';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute';

const ChatPage = lazy(() =>
  import('@/pages/ChatPage').then((module) => ({ default: module.ChatPage })),
);
const DevicesPage = lazy(() =>
  import('@/pages/DevicesPage').then((module) => ({ default: module.DevicesPage })),
);
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((module) => ({ default: module.ResetPasswordPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
);
const PeoplePage = lazy(() =>
  import('@/pages/PeoplePage').then((module) => ({ default: module.PeoplePage })),
);
const CallsPage = lazy(() =>
  import('@/pages/CallsPage').then((module) => ({ default: module.CallsPage })),
);
const VerifyEmailPage = lazy(() =>
  import('@/pages/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })),
);
const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const DownloadPage = lazy(() =>
  import('@/pages/DownloadPage').then((module) => ({ default: module.DownloadPage })),
);
const AboutPage = lazy(() =>
  import('@/pages/ProductInfoPage').then((module) => ({ default: module.AboutPage })),
);
const PrivacyPage = lazy(() =>
  import('@/pages/ProductInfoPage').then((module) => ({ default: module.PrivacyPage })),
);
const SecurityPage = lazy(() =>
  import('@/pages/ProductInfoPage').then((module) => ({ default: module.SecurityPage })),
);

const RouteLoader = () => (
  <div className="grid min-h-screen grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_1fr]">
    <Skeleton className="h-[calc(100vh-2rem)] rounded-[32px]" />
    <Skeleton className="h-[calc(100vh-2rem)] rounded-[32px]" />
  </div>
);

export const AppRouter = () => (
  <Suspense fallback={<RouteLoader />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/download" element={<DownloadPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/security" element={<SecurityPage />} />
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
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/people"
        element={
          <ProtectedRoute>
            <PeoplePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <CallsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/devices"
        element={
          <ProtectedRoute>
            <DevicesPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);
