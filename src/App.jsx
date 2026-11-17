import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer, ProtectedRoute } from './components/layout';
import { Spinner } from './components/ui';

const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const AdminReportsPage = lazy(() => import('./pages/dashboard/AdminReportsPage'));
const NotificationSettingsPage = lazy(() => import('./pages/dashboard/NotificationSettingsPage'));
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'));
const OnboardingPage = lazy(() => import('./pages/talent/OnboardingPage'));
const StudentProfilePage = lazy(() => import('./pages/talent/StudentProfilePage'));
const EditProfilePage = lazy(() => import('./pages/talent/EditProfilePage'));
const TalentDirectoryPage = lazy(() => import('./pages/talent/TalentDirectoryPage'));
const ProjectDiscoveryPage = lazy(() => import('./pages/projects/ProjectDiscoveryPage'));
const CreateProjectPage = lazy(() => import('./pages/projects/CreateProjectPage'));
const ProjectDetailPage = lazy(() => import('./pages/projects/ProjectDetailPage'));
const ProjectApplicantsPage = lazy(() => import('./pages/projects/ProjectApplicantsPage'));
const ProjectWorkspacePage = lazy(() => import('./pages/projects/ProjectWorkspacePage'));
const OrganizationsPage = lazy(() => import('./pages/organizations/OrganizationsPage'));

export default function App() {
  return (
    <AuthProvider>
      <div className="app-shell flex min-h-screen flex-col text-slate-800">
        <Navbar />
        <div className="flex-1">
          <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center" role="status"><Spinner size="lg" /></div>}>
          <Routes>
            {/* Landing Page on root as required */}
            <Route path="/" element={<LandingPage />} />

            {/* Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/get-started" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Milestone 2 Profile & Talent Routes */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/me"
              element={
                <ProtectedRoute>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/edit"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <StudentProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Milestone 3 Marketplace & Discovery Routes */}
            <Route path="/talent" element={<TalentDirectoryPage />} />
            <Route path="/projects" element={<ProjectDiscoveryPage />} />
            <Route
              path="/projects/new"
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route
              path="/projects/:id/applicants"
              element={
                <ProtectedRoute>
                  <ProjectApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/workspace"
              element={
                <ProtectedRoute>
                  <ProjectWorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects/:id/edit"
              element={
                <ProtectedRoute>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Temporary Dashboard Route */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardOverview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/notifications"
              element={
                <ProtectedRoute>
                  <NotificationSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute>
                  <OrganizationsPage />
                </ProtectedRoute>
              }
            />

            {/* Reusable UI Components Showcase (retained for inspection) */}
            <Route path="/showcase" element={<ComponentShowcase />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
