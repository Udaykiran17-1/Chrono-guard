import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer, ProtectedRoute } from './components/layout';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ComponentShowcase from './pages/ComponentShowcase';

// Milestone 2 Pages
import OnboardingPage from './pages/talent/OnboardingPage';
import StudentProfilePage from './pages/talent/StudentProfilePage';
import EditProfilePage from './pages/talent/EditProfilePage';

// Milestone 3 Pages
import TalentDirectoryPage from './pages/talent/TalentDirectoryPage';
import ProjectDiscoveryPage from './pages/projects/ProjectDiscoveryPage';
import CreateProjectPage from './pages/projects/CreateProjectPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col bg-canvas text-slate-800">
        <Navbar />
        <div className="flex-1">
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

            {/* Reusable UI Components Showcase (retained for inspection) */}
            <Route path="/showcase" element={<ComponentShowcase />} />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
