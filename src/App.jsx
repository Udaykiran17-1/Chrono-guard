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
