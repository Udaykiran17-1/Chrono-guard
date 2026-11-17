import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Bookmark,
  BookmarkCheck,
  Edit3,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  ExternalLink,
  Shield,
  Send,
  Lock,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Modal,
  Spinner,
} from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import {
  getProjectById,
  changeProjectStatus,
  toggleSaveProject,
  getSavedProjectIds,
} from '../../services/projectService';
import { getRecommendedFreelancers } from '../../services/talentService';
import {
  getUserApplication,
  getApplicationsForProject,
} from '../../services/applicationService';
import ApplyProjectModal from '../../components/projects/ApplyProjectModal';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [recommendedTalent, setRecommendedTalent] = useState([]);
  const [userApplication, setUserApplication] = useState(null);
  const [applicantCount, setApplicantCount] = useState(0);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Cancel Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchProjectAndApplication = async () => {
    if (!id) return;
    try {
      const proj = await getProjectById(id);
      setProject(proj);

      // Fetch recommended talent for this project
      const skillIds = (proj.skills || []).map((s) => s.id);
      const rec = await getRecommendedFreelancers(skillIds);
      setRecommendedTalent(rec);

      if (user?.id) {
        const [savedIds, existingApp, projectApps] = await Promise.all([
          getSavedProjectIds(user.id),
          getUserApplication(proj.id, user.id),
          user.id === proj.creator_id ? getApplicationsForProject(proj.id) : Promise.resolve([]),
        ]);
        setIsSaved(savedIds.includes(proj.id));
        setUserApplication(existingApp);
        if (user.id === proj.creator_id) {
          setApplicantCount(projectApps.length);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProjectAndApplication().finally(() => setLoading(false));
  }, [id, user?.id]);

  const isCreator = user?.id && project?.creator_id === user.id;

  const handleToggleSave = async () => {
    if (!user?.id || !project) return;
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    try {
      await toggleSaveProject(user.id, project.id);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleCloseApplications = async () => {
    if (!confirm('Are you sure you want to close applications for this project?')) return;
    try {
      const updated = await changeProjectStatus(project.id, 'closed');
      setProject((prev) => ({ ...prev, status: 'closed' }));
      setActionSuccess('Project applications have been closed.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancelling this project.');
      return;
    }
    setCancelling(true);
    try {
      await changeProjectStatus(project.id, 'cancelled', cancelReason);
      setProject((prev) => ({
        ...prev,
        status: 'cancelled',
        cancellation_reason: cancelReason,
      }));
      setShowCancelModal(false);
      setActionSuccess('Project has been cancelled.');
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <PageContainer className="py-12">
        <Card className="text-center p-8 max-w-lg mx-auto">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Project Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {error || 'This project opportunity does not exist or has been removed.'}
          </p>
          <Link to="/projects">
            <Button variant="outline" size="sm">
              Return to Project Discovery
            </Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  // Budget Display Formatting
  let budgetDisplay = 'Transparent Terms';
  if (project.budget_type === 'fixed' && project.budget_min) {
    budgetDisplay = `₹${project.budget_min.toLocaleString()} Fixed`;
  } else if (project.budget_type === 'negotiable') {
    budgetDisplay = project.budget_min
      ? `₹${project.budget_min.toLocaleString()} - ₹${(project.budget_max || project.budget_min).toLocaleString()} (Negotiable)`
      : 'Negotiable Scope';
  } else if (project.budget_type === 'unpaid') {
    budgetDisplay = 'Unpaid Collaboration';
  } else if (project.budget_type === 'volunteer') {
    budgetDisplay = 'Volunteer Opportunity';
  }

  const isClosed = project.status === 'closed' || project.status === 'completed' || project.status === 'cancelled';

  return (
    <div className="bg-canvas min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <PageContainer className="max-w-5xl">
        {/* Navigation & Status alert */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cobalt hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Projects
          </Link>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                project.status === 'open'
                  ? 'teal'
                  : project.status === 'cancelled'
                  ? 'red'
                  : 'neutral'
              }
            >
              STATUS: {project.status.toUpperCase()}
            </Badge>

            {!isCreator && (
              <button
                type="button"
                onClick={handleToggleSave}
                className="text-slate-400 hover:text-brand-indigo p-1"
                title={isSaved ? 'Remove bookmark' : 'Bookmark project'}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-5 w-5 text-brand-indigo fill-indigo-50" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {project.status === 'cancelled' && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-800">
            <p className="font-bold mb-0.5">This project has been cancelled by the creator.</p>
            {project.cancellation_reason && (
              <p className="italic">Reason: "{project.cancellation_reason}"</p>
            )}
          </div>
        )}

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ───── LEFT: STRUCTURED PROJECT SPEC (8 cols) ───── */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card */}
            <Card className="shadow-xs">
              <CardBody className="p-6">
                <Badge variant="indigo" className="mb-2 text-[10px]">
                  {project.category}
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {project.title}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Posted on {new Date(project.created_at).toLocaleDateString()} • Campus Opportunity
                </p>

                {/* Creator Attribution */}
                <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between">
                  <Link to={`/profile/${project.creator_id}`} className="flex items-center gap-3 group">
                    <img
                      src={
                        project.creator?.avatar_url ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          project.creator?.full_name || 'Creator'
                        )}`
                      }
                      alt={project.creator?.full_name}
                      className="h-10 w-10 rounded-full border border-card-border object-cover bg-slate-50"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand-indigo transition-colors">
                        {project.creator?.full_name || 'Campus Creator'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {project.creator?.headline || project.creator?.departments?.name || 'Student Lead'}
                      </p>
                    </div>
                  </Link>

                  <Link to={`/profile/${project.creator_id}`}>
                    <Button variant="ghost" size="sm" className="text-xs font-semibold">
                      View Profile →
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Structured Scope Card (Spec Section 6.2) */}
            <Card className="shadow-xs space-y-6">
              <CardHeader className="bg-slate-50/70">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Structured Project Brief
                </h2>
              </CardHeader>

              <CardBody className="p-6 space-y-6 text-sm">
                {/* 1. What needs doing */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    1. What Needs To Be Done
                  </h3>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                    {project.what_needs_doing}
                  </p>
                </div>

                {/* 2. Why required */}
                <div className="pt-4 border-t border-card-border">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    2. Background & Objective
                  </h3>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                    {project.why_required}
                  </p>
                </div>

                {/* 3. Expected Deliverables */}
                <div className="pt-4 border-t border-card-border">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    3. Expected Tangible Deliverables
                  </h3>
                  <div className="p-3 rounded-lg bg-slate-50 font-mono text-xs text-slate-800 whitespace-pre-line border border-card-border">
                    {project.expected_deliverables}
                  </div>
                </div>

                {/* 4. Additional Requirements */}
                {project.additional_requirements && (
                  <div className="pt-4 border-t border-card-border">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      4. Specific Collaborator Requirements
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      {project.additional_requirements}
                    </p>
                  </div>
                )}

                {/* 5. Required Skills */}
                <div className="pt-4 border-t border-card-border">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    5. Required Skills & Tools
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(project.skills || []).map((s) => (
                      <span
                        key={s.id}
                        className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-brand-indigo"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Creator Rule-Based Recommendations Widget (Spec Section 16) */}
            {isCreator && recommendedTalent.length > 0 && (
              <Card className="shadow-xs border border-teal-200 bg-teal-50/20">
                <CardHeader className="bg-teal-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand-teal" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Recommended Student Talent for This Project
                    </h3>
                  </div>
                  <Badge variant="teal">Skill Match Engine</Badge>
                </CardHeader>
                <CardBody className="p-4 space-y-3">
                  <p className="text-xs text-slate-600 mb-2">
                    Based on your required skills and collaborator availability, here are recommended peers:
                  </p>
                  <div className="space-y-2">
                    {recommendedTalent.slice(0, 3).map((talent) => (
                      <div
                        key={talent.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-card-border shadow-xs text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              talent.avatar_url ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                talent.full_name
                              )}`
                            }
                            alt={talent.full_name}
                            className="h-8 w-8 rounded-full border border-card-border object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{talent.full_name}</p>
                            <span className="text-[10px] text-brand-teal font-semibold">
                              {talent.matchReason}
                            </span>
                          </div>
                        </div>

                        <Link to={`/profile/${talent.id}`}>
                          <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* ───── RIGHT SIDEBAR: KEY METRICS & ACTION BUTTONS (4 cols) ───── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Compensation & Timeline Summary Card */}
            <Card className="shadow-xs">
              <CardHeader className="bg-slate-50/70 pb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Project Highlights
                </h3>
              </CardHeader>
              <CardBody className="p-5 space-y-4 text-xs">
                {/* Compensation */}
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5 uppercase tracking-wider font-semibold">
                    Compensation
                  </span>
                  <div className="flex items-center gap-1.5 text-base font-extrabold text-slate-900">
                    <DollarSign className="h-4 w-4 text-brand-teal" />
                    <span>{budgetDisplay}</span>
                  </div>
                  {project.budget_note && (
                    <p className="text-slate-500 mt-1 italic leading-relaxed text-[11px]">
                      "{project.budget_note}"
                    </p>
                  )}
                </div>

                {/* Deadline */}
                <div className="pt-3 border-t border-card-border">
                  <span className="text-slate-400 block text-[11px] mb-0.5 uppercase tracking-wider font-semibold">
                    Deadline
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                    <Calendar className="h-4 w-4 text-brand-indigo" />
                    <span>{project.deadline}</span>
                  </div>
                  {project.estimated_duration && (
                    <p className="text-slate-500 mt-0.5 text-[11px]">
                      Duration: {project.estimated_duration}
                    </p>
                  )}
                </div>

                {/* Collaborators capacity */}
                <div className="pt-3 border-t border-card-border">
                  <span className="text-slate-400 block text-[11px] mb-0.5 uppercase tracking-wider font-semibold">
                    Capacity & Openings
                  </span>
                  <div className="flex items-center justify-between font-bold text-slate-800 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-brand-cobalt" />
                      <span>
                        {project.positions_filled} / {project.positions_total} Filled
                      </span>
                    </span>
                    <Badge variant={project.positions_filled >= project.positions_total ? 'red' : 'teal'}>
                      {project.positions_filled >= project.positions_total ? 'Full' : 'Positions Open'}
                    </Badge>
                  </div>
                </div>
              </CardBody>

              {/* Contextual Action Bar */}
              <CardFooter className="bg-slate-50/70 p-4 space-y-2">
                {isCreator ? (
                  /* Creator Actions */
                  <div className="space-y-2 w-full">
                    <Link to={`/projects/${project.id}/applicants`} className="block w-full">
                      <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-1.5 shadow-sm font-semibold">
                        <Users className="h-4 w-4" />
                        <span>Review Applicants ({applicantCount})</span>
                      </Button>
                    </Link>

                    <Link to={`/projects/${project.id}/edit`} className="block w-full">
                      <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-1.5">
                        <Edit3 className="h-4 w-4" />
                        <span>Edit Project Brief</span>
                      </Button>
                    </Link>

                    {project.status === 'open' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCloseApplications}
                        className="w-full"
                      >
                        Close Applications
                      </Button>
                    )}

                    {project.status !== 'cancelled' && project.status !== 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCancelModal(true)}
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 text-xs"
                      >
                        Cancel Project Opportunity…
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Peer Collaborator Actions */
                  <div className="space-y-2 w-full">
                    {user?.id ? (
                      userApplication ? (
                        <div className="space-y-2">
                          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-brand-teal" />
                                <span>Proposal Submitted</span>
                              </span>
                              <Badge
                                variant={
                                  userApplication.status === 'accepted'
                                    ? 'teal'
                                    : userApplication.status === 'rejected'
                                    ? 'red'
                                    : userApplication.status === 'shortlisted'
                                    ? 'indigo'
                                    : 'neutral'
                                }
                                className="text-[10px] uppercase font-bold"
                              >
                                {userApplication.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-slate-600 text-[11px]">
                              Applied on {new Date(userApplication.created_at).toLocaleDateString()} • {userApplication.estimated_days} days proposed
                            </p>
                          </div>
                          <Link to="/dashboard" className="block w-full">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                              Track in My Applications →
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="md"
                          disabled={isClosed}
                          onClick={() => setShowApplyModal(true)}
                          className="w-full flex items-center justify-center gap-2 shadow-sm font-semibold"
                        >
                          <Send className="h-4 w-4" />
                          <span>{isClosed ? 'Applications Closed' : 'Apply for Project'}</span>
                        </Button>
                      )
                    ) : (
                      <Link to="/login" className="block w-full">
                        <Button variant="primary" size="md" className="w-full font-semibold">
                          Sign In to Apply
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleSave}
                      className="w-full flex items-center justify-center gap-1.5 text-xs"
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 text-brand-indigo" />
                          <span>Saved to Bookmarks</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          <span>Save for Later</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>

            {/* Campus Quality Notice */}
            <div className="rounded-card border border-card-border bg-white p-4 text-xs text-slate-500 leading-relaxed shadow-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Shield className="h-4 w-4 text-brand-indigo" />
                <span>Fair Campus Collaboration</span>
              </div>
              <p>
                Selected applicants confirm milestone deliverables and revision limits prior to starting work. All project commitments are recorded in tamper-evident agreement records.
              </p>
            </div>
          </div>
        </div>

        {/* ───── CANCEL PROJECT REASON MODAL ───── */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel Project Opportunity"
        >
          <form onSubmit={handleConfirmCancel} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with campus collaboration transparency, cancelling a project requires a brief explanation for students who may have saved or prepared proposals.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cancellation Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Scope revised by club committee; funding deferred to next semester."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-lg border border-card-border p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowCancelModal(false)}
              >
                Go Back
              </Button>
              <Button type="submit" variant="danger" loading={cancelling}>
                Confirm Cancellation
              </Button>
            </div>
          </form>
        </Modal>

        {/* ───── APPLY FOR PROJECT 2-STEP MODAL ───── */}
        {showApplyModal && (
          <ApplyProjectModal
            isOpen={showApplyModal}
            onClose={() => setShowApplyModal(false)}
            project={project}
            user={user}
            onSuccess={() => {
              setActionSuccess('Your proposal has been successfully submitted to the project creator!');
              fetchProjectAndApplication();
              setTimeout(() => setActionSuccess(''), 6000);
            }}
          />
        )}
      </PageContainer>
    </div>
  );
}
