import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardBody } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid university email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-canvas py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-brand-indigo mb-2">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#3730A3" />
              <path d="M8 20V12L14 8L20 12V20L14 16L8 20Z" fill="white" fillOpacity="0.9" />
              <path d="M14 16L20 20V12L14 16Z" fill="white" fillOpacity="0.6" />
            </svg>
            <span>SkillBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your university email and we will send you a link to reset your account password.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardBody className="p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-brand-teal">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">Check your inbox</h2>
                <p className="text-sm text-slate-600">
                  We've sent a secure password reset link to <strong className="text-slate-900">{email}</strong>.
                  Please click the link in that email to choose a new password.
                </p>
                <div className="pt-4">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-sm text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                    <p>{error}</p>
                  </div>
                )}

                <Input
                  label="Registered University Email"
                  name="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Send Reset Link
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
