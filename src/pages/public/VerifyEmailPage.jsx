import { Link, useLocation } from 'react-router-dom';
import { MailCheck, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Button, Card, CardBody } from '../../components/ui';

export default function VerifyEmailPage() {
  const location = useLocation();
  const email = location.state?.email || 'your registered university email';

  return (
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4 py-10 sm:px-6 lg:flex lg:items-center lg:px-8">
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
        </div>

        <Card className="border-white/90 bg-white/85 text-center shadow-[0_24px_70px_rgba(57,36,157,0.14)] backdrop-blur-xl">
          <CardBody className="p-8 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-brand-indigo">
              <MailCheck className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Check your university email</h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                We've sent a verification link to:
              </p>
              <p className="mt-1 font-semibold text-slate-900 break-all bg-slate-100 py-1 px-3 rounded-md text-sm inline-block">
                {email}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 border border-card-border p-4 text-left text-xs text-slate-600 space-y-2">
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-teal" />
                Why campus verification is required:
              </p>
              <p>
                SkillBridge restricts access to current university members and registered student organizations to protect collaborative integrity and ensure verified peers.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link to="/login" className="block">
                <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                  <span>Proceed to Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link to="/" className="block">
                <Button variant="ghost" className="w-full text-slate-600">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
