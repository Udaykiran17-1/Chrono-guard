import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Shield,
  Star,
  Check,
  X,
  Filter,
  UserCheck,
  Lock,
  Layers,
  ChevronDown,
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
  EmptyState,
} from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { getProjectById } from '../../services/projectService';
import {
  getApplicationsForProject,
  updateApplicationStatus,
  acceptApplication,
} from '../../services/applicationService';

const FILTER_TABS = [
  { id: 'all', label: 'All Proposals' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'shortlisted', label: 'Shortlisted ⭐' },
  { id: 'accepted', label: 'Accepted ✓' },
  { id: 'rejected', label: 'Rejected' },
];

export default function ProjectApplicantsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Accept Modal
  const [selectedAppForAccept, setSelectedAppForAccept] = useState(null);
  const [accepting, setAccepting] = useState(false);

  // Reject Modal
  const [selectedAppForReject, setSelectedAppForReject] = useState(null);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const proj = await getProjectById(id);
        if (!proj) {
          setError('Project not found');
          return;
        }
        setProject(proj);

        // Fetch applications
        const apps = await getApplicationsForProject(id);
        setApplications(apps);
      } catch (err) {
        console.error('Error loading applicants:', err);
        setError(err.message || 'Failed to load project applicants');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const isCreator = user?.id && project?.creator_id === user.id;

  // Filtered applications
  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') return applications;
    return applications.filter((app) => app.status === activeTab);
  }, [applications, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: applications.length };
    FILTER_TABS.forEach((t) => {
      if (t.id !== 'all') {
        counts[t.id] = applications.filter((a) => a.status === t.id).length;
      }
    });
    return counts;
  }, [applications]);

  // Slot calculations
  const spotsFilled = project?.positions_filled || 0;
  const spotsTotal = project?.positions_total || 1;
  const isCapacityFull = spotsFilled >= spotsTotal;

  // Status transitions
  const handleSetStatus = async (appId, newStatus) => {
    try {
      const updated = await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      setSuccessMsg(`Candidate proposal marked as ${newStatus.replace('_', ' ')}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err.message || 'Failed to update proposal status');
    }
  };

  // Confirm Accept Candidate
  const handleConfirmAccept = async () => {
    if (!selectedAppForAccept) return;
    setAccepting(true);
    setError(null);

    try {
      const res = await acceptApplication(selectedAppForAccept.id);

      // Refresh applications and project status
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedAppForAccept.id ? { ...a, status: 'accepted' } : a
        )
      );

      setProject((prev) => ({
        ...prev,
        positions_filled: res.positions_filled || (prev.positions_filled || 0) + 1,
        status: res.project_status || 'in_progress',
      }));

      setSuccessMsg(
        `Successfully accepted ${selectedAppForAccept.applicant?.full_name || 'candidate'}! 1 slot has been locked.`
      );
      setSelectedAppForAccept(null);
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error accepting application:', err);
      setError(err.message || 'Failed to accept candidate application.');
    } finally {
      setAccepting(false);
    }
  };

  // Confirm Reject Candidate
  const handleConfirmReject = async () => {
    if (!selectedAppForReject) return;
    setRejecting(true);
    try {
      await updateApplicationStatus(selectedAppForReject.id, 'rejected');
      setApplications((prev) =>
        prev.map((a) =>
          a.id === selectedAppForReject.id ? { ...a, status: 'rejected' } : a
        )
      );
      setSelectedAppForReject(null);
      setSuccessMsg('Candidate application has been rejected.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError(err.message || 'Failed to reject application');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="py-12 flex justify-center items-center">
        <Spinner size="lg" />
      </PageContainer>
    );
  }

  // Unauthorized guard
  if (!isCreator && !loading) {
    return (
      <PageContainer className="py-12">
        <Card className="max-w-lg mx-auto text-center p-8">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-sm text-slate-600 mt-2 mb-6">
            Only the creator of this project can view and evaluate received proposals.
          </p>
          <div className="flex justify-center gap-3">
            <Link to={`/projects/${id}`}>
              <Button variant="outline">View Project Brief</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="primary">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8">
      {/* Back button & Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cobalt hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Project Brief</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge
            variant={
              project.status === 'open'
                ? 'teal'
                : project.status === 'in_progress'
                ? 'indigo'
                : project.status === 'completed'
                ? 'neutral'
                : 'red'
            }
          >
            {project.status.toUpperCase()}
          </Badge>
          <span className="text-xs text-slate-400">Project ID: {project.id?.substring(0, 8)}</span>
        </div>
      </div>

      {/* Top Banner: Project Capacity & Slot Tracker */}
      <div className="mb-8 rounded-card border border-card-border bg-white p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="indigo" className="text-[10px]">
                {project.category}
              </Badge>
              <span className="text-xs text-slate-400">
                Deadline: {new Date(project.deadline).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Applicant Comparison: {project.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review received proposals, compare skill alignments, and securely lock collaborative positions.
            </p>
          </div>

          {/* Atomic Slot Locking Counter */}
          <div className="rounded-xl border border-card-border bg-slate-50 p-4 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-indigo" />
                <span>Positions Filled</span>
              </span>
              <span className="font-bold text-slate-900">
                {spotsFilled} / {spotsTotal}
              </span>
            </div>

            {/* Visual progress bar */}
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isCapacityFull ? 'bg-amber-500' : 'bg-brand-teal'
                }`}
                style={{ width: `${Math.min(100, (spotsFilled / spotsTotal) * 100)}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {isCapacityFull
                  ? 'All positions allocated'
                  : `${spotsTotal - spotsFilled} spot(s) remaining`}
              </span>
              {isCapacityFull ? (
                <span className="font-semibold text-amber-700 flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Locked
                </span>
              ) : (
                <span className="font-semibold text-brand-teal">Open</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 p-4 text-xs text-teal-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-teal" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5 border-b border-card-border pb-3">
        {FILTER_TABS.map((tab) => {
          const count = tabCounts[tab.id] || 0;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-indigo text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-card-border hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  isActive ? 'bg-indigo-900/40 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Proposals List */}
      {filteredApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <EmptyState
            icon={Users}
            title={
              activeTab === 'all'
                ? 'No Proposals Received Yet'
                : `No proposals with status "${activeTab.replace('_', ' ')}"`
            }
            description={
              activeTab === 'all'
                ? 'Your project is open in the marketplace. Check back soon as students discover and apply for your requirements.'
                : 'Select another filter tab above to view other proposals.'
            }
            action={
              <Link to={`/projects/${project.id}`}>
                <Button variant="outline" size="sm">
                  View Public Project Listing
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((app) => {
            const applicant = app.applicant || {};
            const applicantSkills = (applicant.user_skills || []).map((us) => us.skills?.name).filter(Boolean);
            const requiredSkills = (project.skills || []).map((s) => s.name);
            const matchedSkills = applicantSkills.filter((s) => requiredSkills.includes(s));

            const isAccepted = app.status === 'accepted';
            const isRejected = app.status === 'rejected';
            const isShortlisted = app.status === 'shortlisted';
            const isUnderReview = app.status === 'under_review';
            const isWithdrawn = app.status === 'withdrawn';

            return (
              <Card
                key={app.id}
                className={`overflow-hidden transition-all shadow-subtle ${
                  isAccepted
                    ? 'border-teal-400 bg-teal-50/10'
                    : isShortlisted
                    ? 'border-indigo-300 bg-indigo-50/10'
                    : 'border-card-border bg-white'
                }`}
              >
                <CardBody className="p-6">
                  {/* Top Header: Candidate identity & Status Badge */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-card-border">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          applicant.avatar_url ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                            applicant.full_name || 'Candidate'
                          )}`
                        }
                        alt={applicant.full_name}
                        className="h-12 w-12 rounded-full border border-card-border object-cover bg-slate-50"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/profile/${app.applicant_id}`}
                            className="text-base font-bold text-slate-900 hover:text-brand-indigo transition-colors"
                          >
                            {applicant.full_name || 'Anonymous Student'}
                          </Link>
                          {applicant.academic_year && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {applicant.academic_year}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{applicant.headline || 'Student Freelancer'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {applicant.universities?.short_name || 'Campus Student'} • {applicant.departments?.name || applicant.course}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isAccepted
                            ? 'teal'
                            : isShortlisted
                            ? 'indigo'
                            : isRejected
                            ? 'red'
                            : isUnderReview
                            ? 'amber'
                            : 'neutral'
                        }
                        className="text-xs uppercase font-bold"
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <Link to={`/profile/${app.applicant_id}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-brand-cobalt">
                          Profile →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Middle Content: Proposal Pitch & Experience */}
                  <div className="py-4 space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1">
                        Introduction & Approach
                      </h4>
                      <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line bg-slate-50/70 p-3 rounded-lg border border-slate-200/60">
                        {app.introduction}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1">
                        Relevant Experience & Prior Work
                      </h4>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {app.relevant_experience}
                      </p>
                    </div>

                    {/* Skill Overlap Matrix */}
                    <div>
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5 flex items-center justify-between">
                        <span>Skills Alignment</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {matchedSkills.length} of {requiredSkills.length} required skills matched
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {requiredSkills.map((reqSkill) => {
                          const hasSkill = matchedSkills.includes(reqSkill);
                          return (
                            <span
                              key={reqSkill}
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold border ${
                                hasSkill
                                  ? 'bg-teal-50 border-teal-200 text-brand-teal'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              {hasSkill ? <Check className="h-3 w-3" /> : null}
                              <span>{reqSkill}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Portfolio Links */}
                    {app.portfolio_links && app.portfolio_links.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5">
                          Submitted Portfolio Links
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {app.portfolio_links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs text-brand-cobalt font-medium transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              <span>{link.title || link.url}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {app.comments && (
                      <div className="pt-2 border-t border-card-border text-slate-600">
                        <span className="font-semibold text-slate-700">Applicant Note: </span>
                        <span>{app.comments}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Bar: Timeline, Proposed Price & Action Controls */}
                  <div className="mt-2 pt-4 border-t border-card-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-brand-indigo" />
                        <span>
                          Estimated: <strong className="text-slate-900">{app.estimated_days} Days</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4 text-brand-teal" />
                        <span>
                          Proposed:{' '}
                          <strong className="text-slate-900">
                            {app.proposed_price ? `₹${Number(app.proposed_price).toLocaleString()}` : 'Standard Budget'}
                          </strong>
                        </span>
                      </div>
                      <span className="text-slate-400 hidden md:inline">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Creator Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {/* Under review toggle */}
                      {app.status === 'submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetStatus(app.id, 'under_review')}
                          className="text-xs"
                        >
                          Mark Under Review
                        </Button>
                      )}

                      {/* Shortlist toggle */}
                      {app.status !== 'accepted' && app.status !== 'rejected' && app.status !== 'withdrawn' && (
                        <Button
                          variant={isShortlisted ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() =>
                            handleSetStatus(app.id, isShortlisted ? 'under_review' : 'shortlisted')
                          }
                          className="text-xs flex items-center gap-1"
                        >
                          <Star className={`h-3.5 w-3.5 ${isShortlisted ? 'fill-amber-400 text-amber-500' : ''}`} />
                          <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                        </Button>
                      )}

                      {/* Reject button */}
                      {app.status !== 'rejected' && app.status !== 'accepted' && app.status !== 'withdrawn' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAppForReject(app)}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      )}

                      {/* Atomic Accept Candidate Button */}
                      {app.status !== 'accepted' && app.status !== 'withdrawn' && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isCapacityFull || isRejected}
                          onClick={() => setSelectedAppForAccept(app)}
                          className={`text-xs flex items-center gap-1.5 shadow-sm font-semibold ${
                            isCapacityFull ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isCapacityFull ? (
                            <>
                              <Lock className="h-3.5 w-3.5" />
                              <span>Positions Full</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Accept Candidate</span>
                            </>
                          )}
                        </Button>
                      )}

                      {isAccepted && (
                        <Badge variant="teal" icon={CheckCircle2} className="text-xs py-1 px-3">
                          Position Confirmed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CONFIRM ACCEPT CANDIDATE (ATOMIC SLOT LOCKING) */}
      {selectedAppForAccept && (
        <Modal
          isOpen={Boolean(selectedAppForAccept)}
          onClose={() => setSelectedAppForAccept(null)}
          title="Confirm Candidate Acceptance"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3.5 text-xs text-teal-900">
              <p className="font-bold flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-4 w-4 text-brand-teal" />
                <span>Atomic Capacity Locking Notice</span>
              </p>
              <p className="text-slate-700 leading-relaxed">
                Accepting <strong>{selectedAppForAccept.applicant?.full_name}</strong> will formally allocate 1 of{' '}
                <strong>{spotsTotal}</strong> available positions for "{project.title}".
              </p>
            </div>

            <div className="rounded-card border border-card-border p-4 bg-slate-50 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-bold text-slate-900">{selectedAppForAccept.applicant?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proposed Timeline:</span>
                <span className="font-semibold text-slate-800">{selectedAppForAccept.estimated_days} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proposed Compensation:</span>
                <span className="font-semibold text-slate-800">
                  {selectedAppForAccept.proposed_price
                    ? `₹${Number(selectedAppForAccept.proposed_price).toLocaleString()}`
                    : 'Standard Scope'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Remaining Spots After:</span>
                <span className="font-bold text-brand-indigo">
                  {Math.max(0, spotsTotal - (spotsFilled + 1))} spot(s)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Upon confirmation, the candidate will be added to the project members register and receive an immediate in-app acceptance notification.
            </p>

            <div className="flex items-center justify-end gap-2 border-t border-card-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppForAccept(null)}
                disabled={accepting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmAccept}
                disabled={accepting}
                className="flex items-center gap-1.5"
              >
                {accepting ? (
                  <>
                    <Spinner size="sm" />
                    <span>Allocating Position...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Confirm & Accept Candidate</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: CONFIRM REJECT CANDIDATE */}
      {selectedAppForReject && (
        <Modal
          isOpen={Boolean(selectedAppForReject)}
          onClose={() => setSelectedAppForReject(null)}
          title="Reject Candidate Proposal"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to reject the proposal submitted by{' '}
              <strong>{selectedAppForReject.applicant?.full_name}</strong>?
            </p>
            <p className="text-[11px] text-slate-400">
              The candidate will receive an in-app status update notifying them that the creator has selected other applicants.
            </p>

            <div className="flex items-center justify-end gap-2 border-t border-card-border pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppForReject(null)}
                disabled={rejecting}
              >
                Keep Candidate
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmReject}
                disabled={rejecting}
              >
                {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
