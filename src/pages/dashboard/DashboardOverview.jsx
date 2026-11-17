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
  Edit3,
  Layers,
  Clock,
  ArrowRight,
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
  const onboardingCompleted = profile?.onboarding_completed ?? false;

  return (
    <PageContainer className="py-8">
      {/* Onboarding Incomplete Banner */}
      {!onboardingCompleted && (
        <div className="mb-6 rounded-card border border-indigo-200 bg-indigo-50/80 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-brand-indigo p-2.5 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Complete Your Profile Setup
              </h3>
              <p className="text-xs text-slate-600">
                Configure your dual-role preferences, listed skills, and portfolio work so campus clubs can discover you.
              </p>
            </div>
          </div>
          <Link to="/onboarding">
            <Button size="sm" className="whitespace-nowrap flex items-center gap-1.5 shadow-sm">
              <span>Start Onboarding Wizard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

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
              Milestone 2 Student Profiles, Skills Taxonomy, and Portfolios are operational.
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
                <Link to="/profile/edit">
                  <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                </Link>
              </div>

              <h1 className="text-xl font-bold text-slate-900">{displayName}</h1>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{profile?.headline || displayEmail}</p>

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

              {/* View Profile Action */}
              <div className="mt-5 pt-3 border-t border-card-border">
                <Link to="/profile/me" className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    View My Public Profile
                  </Button>
                </Link>
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

          {/* Quick Shortcuts */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-slate-900">Profile & Skills Management</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              <Link
                to="/profile/me"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-card-border transition-colors text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-brand-indigo" />
                  <span>View Student Profile View</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                to="/profile/edit"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-card-border transition-colors text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-brand-cobalt" />
                  <span>Edit Bio, Skills & Portfolio</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                to="/onboarding"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-card-border transition-colors text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-teal" />
                  <span>Rerun Onboarding Wizard</span>
                </div>
                <span>→</span>
              </Link>
            </CardBody>
          </Card>
        </div>

        {/* Right Col: Milestone 2 Dashboard Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Milestone 2: Profile & Portfolio System
                </h3>
                <p className="text-xs text-slate-500">
                  Student Profiles, Skills Taxonomy, and Portfolios are operational.
                </p>
              </div>
              <Badge variant="indigo" icon={Sparkles}>
                Milestone 2
              </Badge>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                SkillBridge profiles now support asymmetric LinkedIn-style presentations, self-reported skill proficiency ratings, and portfolio project showcases.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-card border border-card-border p-4 bg-white hover:border-brand-indigo transition-colors">
                  <div className="flex items-center gap-2 text-brand-indigo font-semibold text-sm mb-1">
                    <User className="h-4 w-4" />
                    Student Profile
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    View your profile as campus organizations and student collaborators see it.
                  </p>
                  <Link to="/profile/me">
                    <Button variant="outline" size="sm" className="w-full">
                      Open Profile View
                    </Button>
                  </Link>
                </div>

                <div className="rounded-card border border-card-border p-4 bg-white hover:border-brand-cobalt transition-colors">
                  <div className="flex items-center gap-2 text-brand-cobalt font-semibold text-sm mb-1">
                    <Layers className="h-4 w-4" />
                    Portfolio & Skills
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Add new projects, associate technology pills, or propose unlisted skills.
                  </p>
                  <Link to="/profile/edit">
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Portfolio
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Verified Session Details */}
              <div className="mt-6 border-t border-card-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Session & Entity Diagnostics
                </h4>
                <div className="rounded-lg bg-slate-900 p-3 text-emerald-400 font-mono text-xs overflow-x-auto">
                  <pre>
{JSON.stringify(
  {
    userId: user?.id,
    fullName: displayName,
    role: role,
    availability: availability,
    onboardingCompleted: onboardingCompleted,
    databaseTarget: 'public.profiles, public.portfolio_items, public.user_skills',
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
            <span>SkillBridge Campus Platform — Milestone 2</span>
            <Link to="/showcase" className="text-brand-cobalt hover:underline">
              Inspect UI Component Showcase →
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
