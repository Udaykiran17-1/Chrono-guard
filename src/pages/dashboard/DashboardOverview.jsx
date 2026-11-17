import { Link } from 'react-router-dom';
import {
  User,
  School,
  BookOpen,
  Calendar,
  CheckCircle,
  Briefcase,
  Users,
  Shield,
  LogOut,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';

export default function DashboardOverview() {
  const { user, profile, logout } = useAuth();

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'SkillBridge Member';
  const displayEmail = profile?.email || user?.email;
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const role = profile?.platform_role || 'user';
  const availability = profile?.availability_status || 'available';

  return (
    <PageContainer className="py-8">
      {/* Top Welcome Alert / Verification banner */}
      <div className="mb-8 rounded-card border border-teal-200 bg-teal-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-teal-100 p-2 text-brand-teal">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Authentication & Session Verified
            </h2>
            <p className="text-xs text-slate-600">
              End-to-end registration and session hydration are active. Welcome to your SkillBridge command center.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="teal" icon={CheckCircle}>
            {availability.toUpperCase()}
          </Badge>
          <Badge variant="indigo" icon={Shield}>
            ROLE: {role.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="h-20 bg-gradient-to-r from-brand-indigo to-brand-cobalt rounded-t-card" />
            <CardBody className="px-6 pb-6 pt-0 relative">
              <div className="-mt-10 mb-3 flex items-end justify-between">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full border-4 border-white bg-white shadow-md object-cover"
                />
                <Badge variant={role === 'admin' ? 'indigo' : 'neutral'}>
                  {role === 'admin' ? 'Admin' : 'Student Member'}
                </Badge>
              </div>

              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{displayEmail}</p>

              <div className="mt-4 space-y-2 border-t border-card-border pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-slate-400" />
                  <span>
                    {profile?.universities?.name || 'Apex Institute of Technology'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  <span>
                    {profile?.departments?.name || profile?.course || 'Computer Science & Engineering'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{profile?.academic_year || 'Academic Year 2026-27'}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-card-border flex items-center justify-between text-xs">
                <span className="text-slate-500">Account Status:</span>
                <span className="font-semibold text-emerald-600 capitalize">
                  {profile?.account_status || 'Active'}
                </span>
              </div>
            </CardBody>
            <CardFooter className="flex justify-between items-center bg-slate-50/50">
              <span className="text-xs text-slate-400">UUID: {user?.id?.substring(0, 8)}...</span>
              <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Stats / Dual Capabilities */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-slate-900">Dual Capability Status</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-card-border">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-brand-indigo" />
                  <span className="text-xs font-medium text-slate-800">Skill Seeker Mode</span>
                </div>
                <Badge variant="teal">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-card-border">
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-brand-teal" />
                  <span className="text-xs font-medium text-slate-800">Student Freelancer Mode</span>
                </div>
                <Badge variant="teal">Enabled</Badge>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Col: Temporary Milestone 1 Dashboard Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Milestone 1 Verification Console
                </h3>
                <p className="text-xs text-slate-500">
                  Core foundation, PostgreSQL schema, RLS policies, and Auth are operational.
                </p>
              </div>
              <Badge variant="indigo" icon={Sparkles}>
                Step 1C & 1D
              </Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                You have successfully authenticated into SkillBridge. As specified in the product roadmap, user profile management, talent discovery filters, and project marketplace interactions will be unlocked in upcoming milestones.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-card border border-card-border p-4 bg-white hover:border-brand-indigo transition-colors">
                  <div className="flex items-center gap-2 text-brand-indigo font-semibold text-sm mb-1">
                    <Users className="h-4 w-4" />
                    Explore Student Talent
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Preview verified student capabilities and portfolios across campus.
                  </p>
                  <Link to="/#talent">
                    <Button variant="outline" size="sm" className="w-full">
                      View Talent Preview
                    </Button>
                  </Link>
                </div>

                <div className="rounded-card border border-card-border p-4 bg-white hover:border-brand-cobalt transition-colors">
                  <div className="flex items-center gap-2 text-brand-cobalt font-semibold text-sm mb-1">
                    <Briefcase className="h-4 w-4" />
                    Find Campus Projects
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Discover projects and freelance opportunities posted by clubs & students.
                  </p>
                  <Link to="/#projects">
                    <Button variant="outline" size="sm" className="w-full">
                      View Projects Preview
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Verified Session Details */}
              <div className="mt-6 border-t border-card-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Session Diagnostic Payload
                </h4>
                <div className="rounded-lg bg-slate-900 p-3 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <pre>
{JSON.stringify(
  {
    userId: user?.id,
    email: user?.email,
    fullName: displayName,
    role: role,
    accountStatus: profile?.account_status || 'active',
    databaseTarget: 'public.profiles (RLS Enabled)',
  },
  null,
  2
)}
                  </pre>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick shortcuts */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <span>SkillBridge Campus Platform — Milestone 1</span>
            <Link to="/showcase" className="text-brand-cobalt hover:underline">
              Inspect UI Component Showcase →
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
