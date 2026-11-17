import { useState, useEffect } from 'react';
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
  Plus,
  DollarSign,
  Bookmark,
  ExternalLink,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge, Spinner } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import {
  getRecommendedProjects,
  getMyCreatedProjects,
  getSavedProjectIds,
} from '../../services/projectService';
import { getSavedFreelancerIds } from '../../services/talentService';

export default function DashboardOverview() {
  const { user, profile, logout } = useAuth();

  const [loadingMarketplace, setLoadingMarketplace] = useState(true);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [myCreatedProjects, setMyCreatedProjects] = useState([]);
  const [savedProjectCount, setSavedProjectCount] = useState(0);
  const [savedFreelancerCount, setSavedFreelancerCount] = useState(0);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'SkillBridge Member';
  const displayEmail = profile?.email || user?.email;
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const role = profile?.platform_role || 'user';
  const availability = profile?.availability_status || 'available';
  const onboardingCompleted = profile?.onboarding_completed ?? false;

  useEffect(() => {
    let isMounted = true;
    async function fetchDashboardData() {
      if (!user?.id) return;
      try {
        setLoadingMarketplace(true);
        const [recs, myProjs, savedProjIds, savedFreeIds] = await Promise.all([
          getRecommendedProjects(user.id),
          getMyCreatedProjects(user.id),
          getSavedProjectIds(user.id),
          getSavedFreelancerIds(user.id),
        ]);

        if (isMounted) {
          setRecommendedProjects(recs || []);
          setMyCreatedProjects(myProjs || []);
          setSavedProjectCount(savedProjIds?.length || 0);
          setSavedFreelancerCount(savedFreeIds?.length || 0);
        }
      } catch (err) {
        console.error('Error fetching dashboard marketplace data:', err);
      } finally {
        if (isMounted) setLoadingMarketplace(false);
      }
    }

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

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
              Milestone 3 Talent Directory, Project Marketplace, and Structured Briefs are operational.
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
        {/* Left Col: Profile & Bookmarks */}
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

          {/* Quick Stats & Bookmarks */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-slate-900">Marketplace Activity</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/projects"
                  className="p-3 rounded-lg border border-card-border bg-slate-50 hover:bg-slate-100 transition-colors block text-center"
                >
                  <p className="text-2xl font-bold text-brand-indigo">{savedProjectCount}</p>
                  <p className="text-xs text-slate-500 font-medium">Saved Projects</p>
                </Link>
                <Link
                  to="/talent"
                  className="p-3 rounded-lg border border-card-border bg-slate-50 hover:bg-slate-100 transition-colors block text-center"
                >
                  <p className="text-2xl font-bold text-brand-teal">{savedFreelancerCount}</p>
                  <p className="text-xs text-slate-500 font-medium">Saved Talent</p>
                </Link>
              </div>

              <div className="pt-2 space-y-2 border-t border-card-border">
                <Link
                  to="/projects/new"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 transition-colors text-xs font-semibold text-brand-indigo"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Post New Project Brief</span>
                  </div>
                  <span>→</span>
                </Link>

                <Link
                  to="/talent"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-card-border transition-colors text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-brand-teal" />
                    <span>Discover Student Talent</span>
                  </div>
                  <span>→</span>
                </Link>

                <Link
                  to="/projects"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-card-border transition-colors text-xs font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-brand-cobalt" />
                    <span>Browse Project Marketplace</span>
                  </div>
                  <span>→</span>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Col: Marketplace Feeds & Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Recommended Projects For You (Rule-Based Matching) */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand-indigo" />
                  Recommended Projects for You
                </h3>
                <p className="text-xs text-slate-500">
                  Rule-based skill matching based on your listed profile skills and proficiency
                </p>
              </div>
              <Link to="/projects">
                <Button variant="ghost" size="sm" className="text-xs text-brand-cobalt">
                  View All Projects →
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {loadingMarketplace ? (
                <div className="py-8 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : recommendedProjects.length === 0 ? (
                <div className="text-center py-8 rounded-card border border-dashed border-card-border p-6 bg-slate-50/50">
                  <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No tailored project matches yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                    Add more skills to your student profile or explore all open opportunities in the marketplace.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Link to="/profile/edit">
                      <Button variant="outline" size="sm">
                        Update Skills
                      </Button>
                    </Link>
                    <Link to="/projects">
                      <Button variant="primary" size="sm">
                        Explore All Projects
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-card border border-card-border bg-white hover:border-brand-indigo transition-all shadow-subtle group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {proj.category}
                            </span>
                            {proj.matchReason && (
                              <Badge variant="teal" icon={Sparkles} className="text-[11px]">
                                {proj.matchReason}
                              </Badge>
                            )}
                          </div>
                          <Link
                            to={`/projects/${proj.id}`}
                            className="text-sm font-bold text-slate-900 group-hover:text-brand-indigo transition-colors"
                          >
                            {proj.title}
                          </Link>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                            {proj.what_needs_doing}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-card-border/60 pt-3 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-semibold text-slate-800">
                            {proj.budget_type === 'fixed'
                              ? `₹${proj.budget_min?.toLocaleString()}`
                              : proj.budget_type === 'negotiable'
                              ? `₹${proj.budget_min?.toLocaleString()} - ₹${proj.budget_max?.toLocaleString()}`
                              : proj.budget_type === 'unpaid'
                              ? 'Unpaid Collaboration'
                              : 'Volunteer'}
                          </span>
                          <span>•</span>
                          <span>Duration: {proj.estimated_duration || 'Flexible'}</span>
                          <span>•</span>
                          <span>Deadline: {new Date(proj.deadline).toLocaleDateString()}</span>
                        </div>
                        <Link to={`/projects/${proj.id}`}>
                          <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                            View Brief →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Section 2: Projects I Created */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Projects I Posted
                </h3>
                <p className="text-xs text-slate-500">
                  Track requirements, position status, and project lifecycle transitions
                </p>
              </div>
              <Link to="/projects/new">
                <Button size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span>Post Brief</span>
                </Button>
              </Link>
            </CardHeader>
            <CardBody className="space-y-3">
              {loadingMarketplace ? (
                <div className="py-8 flex justify-center">
                  <Spinner size="md" />
                </div>
              ) : myCreatedProjects.length === 0 ? (
                <div className="text-center py-6 rounded-card border border-dashed border-card-border p-4 bg-slate-50/50">
                  <p className="text-xs text-slate-600 mb-2">You haven't posted any project briefs yet.</p>
                  <Link to="/projects/new">
                    <Button variant="outline" size="sm" className="text-xs">
                      Post Your First Project
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-card-border">
                  {myCreatedProjects.map((proj) => (
                    <div key={proj.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link to={`/projects/${proj.id}`} className="text-sm font-semibold text-slate-900 hover:text-brand-indigo">
                            {proj.title}
                          </Link>
                          <Badge
                            variant={
                              proj.status === 'open'
                                ? 'teal'
                                : proj.status === 'in_progress'
                                ? 'indigo'
                                : proj.status === 'completed'
                                ? 'neutral'
                                : 'red'
                            }
                          >
                            {proj.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Positions: {proj.positions_filled || 0} / {proj.positions_total} filled • Deadline: {proj.deadline}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/projects/${proj.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-xs text-slate-600">
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/projects/${proj.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Milestone Diagnostics */}
          <div className="border-t border-card-border pt-4 text-xs text-slate-500 flex items-center justify-between">
            <span>SkillBridge Campus Platform — Milestone 3</span>
            <Link to="/showcase" className="text-brand-cobalt hover:underline">
              Inspect UI Component Showcase →
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
