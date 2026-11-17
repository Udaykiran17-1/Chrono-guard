import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card, CardBody, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isConfigured } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your registered university email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setIsEmailUnverified(false);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('unverified')) {
        setIsEmailUnverified(true);
      } else {
        setGeneralError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-8 sm:px-6 lg:flex lg:items-center lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(102,82,230,0.24),transparent_32rem),radial-gradient(circle_at_85%_80%,rgba(176,162,255,0.24),transparent_28rem)]" />
      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-[24px] border border-white/90 bg-white/70 shadow-[0_24px_70px_rgba(57,36,157,0.16)] backdrop-blur-xl lg:grid-cols-[1.05fr_.95fr]">
        <aside className="relative hidden min-h-[610px] overflow-hidden bg-gradient-to-br from-brand-indigo via-[#5A43D4] to-[#A799FF] p-10 text-white lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.24),transparent_16rem),radial-gradient(circle_at_15%_80%,rgba(22,12,101,0.35),transparent_20rem)]" />
          <div className="relative"><div className="inline-flex items-center gap-2 text-lg font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-sm">✦</span>SkillBridge</div></div>
          <div className="relative my-auto max-w-sm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Your campus network</p><h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-[-0.04em]">Connect skills. Build projects. Grow together.</h1><p className="mt-5 text-sm leading-6 text-white/85">Discover talented peers, find meaningful project opportunities, and keep every collaboration organized in one place.</p></div>
          <div className="relative grid gap-3 text-sm text-white/90"><p>✦ Showcase your skills and portfolio</p><p>✦ Find and join student projects</p><p>✦ Collaborate with clear agreements</p></div>
        </aside>
        <div className="w-full px-5 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-brand-indigo mb-2">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#3730A3" />
              <path d="M8 20V12L14 8L20 12V20L14 16L8 20Z" fill="white" fillOpacity="0.9" />
              <path d="M14 16L20 20V12L14 16Z" fill="white" fillOpacity="0.6" />
            </svg>
            <span>SkillBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to access student talent, project opportunities, and active collaborations.
          </p>

          {!isConfigured && (
            <div className="mt-3 inline-block">
              <Badge variant="amber" icon={AlertCircle}>
                Local Sandbox Mode (Pre-configured Supabase fallbacks active)
              </Badge>
            </div>
          )}
        </div>

        {/* Login Card */}
        <Card className="border-white/90 bg-white/85 shadow-none">
          <CardBody className="p-6 sm:p-8">
            {/* Unverified Email Warning */}
            {isEmailUnverified && (
              <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200 text-sm text-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold">Email Verification Required</p>
                    <p className="mt-1">
                      Your university email address has not been confirmed yet. Please check your inbox for the confirmation link sent during registration.
                    </p>
                    <Link
                      to="/verify-email"
                      state={{ email: formData.email }}
                      className="mt-2 inline-block font-semibold text-amber-900 underline"
                    >
                      View instructions or resend email
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* General Error Banner */}
            {generalError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold">Sign in failed</p>
                  <p>{generalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="University Email"
                name="email"
                type="email"
                placeholder="you@campus.edu"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-brand-cobalt hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                />
              </div>

              {/* Remember session */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
                  />
                  <span className="text-xs text-slate-600">Remember this device</span>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full flex items-center justify-center gap-2 mt-4"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 border-t border-card-border pt-4">
              Don't have a SkillBridge account?{' '}
              <Link to="/register" className="font-semibold text-brand-cobalt hover:underline">
                Join SkillBridge
              </Link>
            </div>
          </CardBody>
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
