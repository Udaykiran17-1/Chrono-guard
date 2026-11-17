import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  School,
  BookOpen,
  Calendar,
  CheckCircle,
  ExternalLink,
  Globe,
  Clock,
  Sparkles,
  Shield,
  Briefcase,
  Users,
  Edit3,
  Award,
  Layers,
  Info,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Star,
} from 'lucide-react';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge, Spinner, GithubIcon, LinkedinIcon } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { getProfileById, updateAvailability } from '../../services/profileService';
import { getReviewsForProfile, submitContentReport, getSkillEndorsementsForProfile } from '../../services/workspaceService';

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', variant: 'teal' },
  { value: 'limited', label: 'Limited Availability', variant: 'amber' },
  { value: 'busy', label: 'Busy / In Exam Prep', variant: 'amber' },
  { value: 'unavailable', label: 'Unavailable', variant: 'neutral' },
];

export default function StudentProfilePage() {
  const { id } = useParams();
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const isOwnProfile = !id || id === 'me' || id === user?.id;
  const targetUserId = isOwnProfile ? user?.id : id;

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [userSkills, setUserSkills] = useState([]);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [collaborationReviews, setCollaborationReviews] = useState([]);
  const [skillEndorsements, setSkillEndorsements] = useState([]);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [reportedReviews, setReportedReviews] = useState(() => new Set());
  const [reportError, setReportError] = useState('');

  const handleReportReview = async (reviewId, reason) => {
    try {
      await submitContentReport(user.id, 'review', reviewId, reason);
      setReportedReviews((current) => new Set([...current, reviewId]));
      setReportError('');
      return true;
    } catch (err) {
      setReportError(err.message || 'Could not submit this report.');
      return false;
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!targetUserId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [res, reviews, endorsements] = await Promise.all([getProfileById(targetUserId), getReviewsForProfile(targetUserId), getSkillEndorsementsForProfile(targetUserId)]);
        setProfileData(res.profile);
        setUserSkills(res.user_skills || []);
        setPortfolioItems(res.portfolio_items || []);
        setCollaborationReviews(reviews || []);
        setSkillEndorsements(endorsements || []);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetUserId]);

  const handleStatusChange = async (newStatus) => {
    if (!isOwnProfile || !user?.id) return;
    setUpdatingStatus(true);
    try {
      await updateAvailability(user.id, {
        availability_status: newStatus,
        availability_note: profileData?.availability_note,
        available_from: profileData?.available_from,
      });
      setProfileData((prev) => ({ ...prev, availability_status: newStatus }));
      await refreshProfile(user.id);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <PageContainer className="py-12">
        <Card className="text-center p-8 max-w-lg mx-auto">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Profile Not Found</h2>
          <p className="text-sm text-slate-500 mt-1 mb-4">
            {error || "The requested student profile could not be loaded or doesn't exist."}
          </p>
          <Link to="/">
            <Button variant="outline" size="sm">
              Return to Home
            </Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  const displayName = profileData.full_name || 'Student';
  const avatarUrl =
    profileData.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  const currentStatusObj =
    AVAILABILITY_OPTIONS.find((o) => o.value === profileData.availability_status) ||
    AVAILABILITY_OPTIONS[0];

  const contactLinks = profileData.contact_links || {};

  return (
    <div className="bg-canvas min-h-screen py-6 sm:py-8">
      <PageContainer>
        {/* ───── 1. TOP PROFILE HEADER CARD ───── */}
        <Card className="mb-6 overflow-hidden shadow-sm">
          {/* Cover Banner */}
          <div className="h-32 sm:h-44 bg-gradient-to-r from-brand-indigo via-indigo-700 to-brand-cobalt relative">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
          </div>

          <CardBody className="px-6 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-28 w-28 sm:h-36 sm:sm:w-36 rounded-full border-4 border-white bg-white shadow-md object-cover"
                />
                <span
                  className={`absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-white ${
                    profileData.availability_status === 'available'
                      ? 'bg-teal-500'
                      : profileData.availability_status === 'limited'
                      ? 'bg-amber-500'
                      : 'bg-slate-400'
                  }`}
                  title={`Availability: ${currentStatusObj.label}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {isOwnProfile ? (
                  <Link to="/profile/edit">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-slate-300 font-semibold"
                    >
                      <Edit3 className="h-4 w-4 text-slate-600" />
                      <span>Edit Profile</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled
                      title="Direct messaging will unlock in Milestone 3"
                      className="opacity-60 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Contact</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title="Project Invitations will unlock in Milestone 3"
                      className="opacity-60 cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Send className="h-4 w-4" />
                      <span>Invite to Project</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {displayName}
                </h1>
                {profileData.platform_role === 'admin' && (
                  <Badge variant="indigo" icon={Shield}>
                    ADMIN
                  </Badge>
                )}
              </div>

              {/* Headline */}
              <p className="mt-1 text-base text-slate-700 font-medium leading-relaxed">
                {profileData.headline || 'SkillBridge Campus Collaborator'}
              </p>

              {/* Academic affiliation line */}
              <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <School className="h-3.5 w-3.5 text-slate-400" />
                  {profileData.universities?.name || 'Apex Institute of Technology & Sciences'}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                  {profileData.departments?.name || profileData.course || 'Engineering'}
                </span>
                {profileData.academic_year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {profileData.academic_year}
                  </span>
                )}
              </div>

              {/* Dual Role Badges & Contact Icons */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-card-border">
                <div className="flex flex-wrap items-center gap-2">
                  {profileData.is_freelancer_enabled && (
                    <Badge variant="teal" icon={Users}>
                      Student Freelancer
                    </Badge>
                  )}
                  {profileData.is_seeker_enabled && (
                    <Badge variant="indigo" icon={Briefcase}>
                      Project Seeker
                    </Badge>
                  )}
                </div>

                {/* External Social / Portfolio Links */}
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                  {contactLinks.linkedin && (
                    <a
                      href={contactLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-cobalt transition-colors p-1"
                      title="LinkedIn Profile"
                    >
                      <LinkedinIcon className="h-4 w-4" />
                    </a>
                  )}
                  {contactLinks.github && (
                    <a
                      href={contactLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 transition-colors p-1"
                      title="GitHub Profile"
                    >
                      <GithubIcon className="h-4 w-4" />
                    </a>
                  )}
                  {contactLinks.website && (
                    <a
                      href={contactLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-indigo transition-colors p-1"
                      title="Personal Website"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ───── 2-COLUMN ASYMMETRIC LAYOUT (~68% Main / ~32% Sidebar) ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ───── LEFT / MAIN COLUMN (approx 68% = 8 cols) ───── */}
          <div className="lg:col-span-8 space-y-6">
            {/* About / Bio Section */}
            <Card>
              <CardHeader>
                <h2 className="text-base font-bold text-slate-900">About</h2>
              </CardHeader>
              <CardBody>
                {profileData.bio ? (
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {profileData.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    {isOwnProfile
                      ? 'Add a bio to introduce your strengths, collaboration interests, and past campus projects.'
                      : 'No biographical summary provided yet.'}
                  </p>
                )}

                {/* Areas of Interest */}
                {profileData.areas_of_interest?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-card-border">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Areas of Interest
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.areas_of_interest.map((area) => (
                        <span
                          key={area}
                          className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Featured Portfolio Section */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Featured Portfolio
                  </h2>
                  <p className="text-xs text-slate-500">
                    Previous projects, code repositories, and creative work (Self-Reported).
                  </p>
                </div>
                {isOwnProfile && (
                  <Link to="/profile/edit">
                    <Button variant="ghost" size="sm" className="text-xs font-semibold text-brand-cobalt">
                      + Add Work
                    </Button>
                  </Link>
                )}
              </CardHeader>

              <CardBody className="p-6">
                {portfolioItems.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg bg-slate-50/50">
                    <Layers className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No portfolio projects yet</p>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                      {isOwnProfile
                        ? 'Showcase previous club fests, GitHub apps, research, or design works.'
                        : 'This student has not uploaded previous portfolio entries yet.'}
                    </p>
                    {isOwnProfile && (
                      <div className="mt-4">
                        <Link to="/profile/edit">
                          <Button size="sm">Add First Project</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-card border border-card-border bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col"
                      >
                        {item.thumbnail_url && (
                          <div className="h-36 w-full bg-slate-100 overflow-hidden relative">
                            <img
                              src={item.thumbnail_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                            {item.category && (
                              <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                                {item.category}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                            {item.title}
                          </h3>

                          {item.completed_date && (
                            <span className="text-[11px] text-slate-400 mt-0.5 block">
                              Completed: {item.completed_date}
                            </span>
                          )}

                          <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed flex-1">
                            {item.description}
                          </p>

                          {/* Skill Pills */}
                          {item.skills?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1 pt-2 border-t border-card-border">
                              {item.skills.map((s) => (
                                <Badge key={s.id || s.name} variant="neutral" className="text-[10px]">
                                  {s.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Links footer */}
                          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 italic">
                              Self-Reported
                            </span>
                            <div className="flex items-center gap-2">
                              {item.github_url && (
                                <a
                                  href={item.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-slate-900 text-xs p-1"
                                  title="View Repository"
                                >
                                  <GithubIcon className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {item.project_url && (
                                <a
                                  href={item.project_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-brand-cobalt hover:underline text-xs flex items-center gap-1 font-medium"
                                >
                                  <span>View Project</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {skillEndorsements.length > 0 && <Card><CardHeader><h2 className="text-base font-bold text-slate-900">Project-based skill endorsements</h2><p className="text-xs text-slate-500">Participant feedback from completed SkillBridge projects.</p></CardHeader><CardBody className="space-y-2">{skillEndorsements.map((endorsement) => <div key={endorsement.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-card-border p-3"><div><p className="text-sm font-semibold">{endorsement.skill?.name || 'Project skill'}</p><p className="text-xs text-slate-500">Endorsed by {endorsement.endorser?.full_name || 'a collaborator'} · {endorsement.project?.title || 'Completed project'}</p></div><Badge variant="indigo">Project-based</Badge></div>)}<p className="text-[11px] text-slate-500">Endorsements are participant-submitted and do not independently certify expertise.</p></CardBody></Card>}

            {/* Distinct Verified SkillBridge Collaborations Section (Section 12.2) */}
            <Card className="border border-card-border bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-brand-indigo" />
                    <h2 className="text-base font-bold text-slate-900">
                      Completed SkillBridge Collaborations
                    </h2>
                  </div>
                  <Badge variant="indigo" icon={Shield}>
                    Participant feedback
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                {collaborationReviews.length > 0 ? <div className="space-y-3">
                  <p className="text-xs text-slate-500">Reviews come from project participants. SkillBridge does not independently verify the work described.</p>
                  {collaborationReviews.map((review) => <article key={review.id} className="rounded-lg border border-card-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-900">{review.project?.title || 'Completed project'}</h3><span className="text-sm font-bold text-amber-700">{review.overall}/5</span></div>
                    <p className="mt-1 text-xs text-slate-500">From {review.reviewer?.full_name || 'a project participant'} · {new Date(review.created_at).toLocaleDateString()}</p>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{review.feedback}</p>
                    <p className="mt-2 text-xs text-slate-500">Communication {review.communication}/5 · Reliability {review.reliability}/5 · Quality {review.quality}/5 · Deadlines {review.deadlines}/5</p>
                    {user?.id && <details className="mt-3"><summary className="cursor-pointer text-xs font-medium text-slate-500">Report this review</summary>{reportedReviews.has(review.id) ? <p className="mt-2 text-xs text-teal-700">Report submitted for moderator review.</p> : <ReviewReportForm onSubmit={(reason) => handleReportReview(review.id, reason)} />}</details>}
                  </article>)}
                  {reportError && <p role="alert" className="text-xs text-red-700">{reportError}</p>}
                </div> : <div className="rounded-lg bg-slate-50 p-4 border border-card-border text-center">
                  <div className="mx-auto w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-brand-indigo mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    No completed collaborations with reviews yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                    Reviews appear here after project participants submit feedback on a completed collaboration. These records are separate from self-reported portfolio work.
                  </p>
                </div>}
              </CardBody>
            </Card>
          </div>

          {/* ───── RIGHT / SIDEBAR COLUMN (approx 32% = 4 cols) ───── */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* Live Availability Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-teal" />
                    Live Availability
                  </h3>
                  <Badge variant={currentStatusObj.variant}>
                    {currentStatusObj.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardBody className="pt-1 space-y-3">
                {profileData.availability_note ? (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-card-border">
                    "{profileData.availability_note}"
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No availability note set.</p>
                )}

                {profileData.available_from && (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Available From:</span>
                    <span className="font-semibold text-slate-700">
                      {profileData.available_from}
                    </span>
                  </div>
                )}

                {/* 1-Click Status Switcher for Profile Owner */}
                {isOwnProfile && (
                  <div className="pt-3 border-t border-card-border">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      Quick Status Switcher
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          disabled={updatingStatus}
                          onClick={() => handleStatusChange(opt.value)}
                          className={`text-left px-2 py-1.5 rounded-md text-xs font-medium border transition-all ${
                            profileData.availability_status === opt.value
                              ? 'bg-brand-indigo text-white border-brand-indigo font-semibold shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Skills & Self-Reported Proficiency Card */}
            <Card>
              <CardHeader className="pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Skills & Competencies
                  </h3>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Self-Reported Proficiency
                  </span>
                </div>
                {isOwnProfile && (
                  <Link to="/profile/edit">
                    <Edit3 className="h-3.5 w-3.5 text-slate-400 hover:text-slate-700" />
                  </Link>
                )}
              </CardHeader>
              <CardBody className="pt-1">
                {userSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No skills listed yet. Add skills in the profile editor.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {userSkills.map((us) => (
                      <div
                        key={us.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-card-border text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          {us.is_primary && (
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          )}
                          <span className="font-semibold text-slate-800">
                            {us.skills?.name || 'Skill'}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            us.proficiency === 'advanced'
                              ? 'bg-indigo-100 text-brand-indigo'
                              : us.proficiency === 'intermediate'
                              ? 'bg-blue-100 text-brand-cobalt'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {us.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Platform Trust & Safety Notice */}
            <div className="rounded-card border border-slate-200 bg-white p-4 text-xs text-slate-500 leading-relaxed space-y-1.5 shadow-card">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Info className="h-4 w-4 text-brand-cobalt" />
                <span>Campus community</span>
              </div>
              <p>
                Availability and portfolio skills are self-reported. Collaboration agreements and participant feedback are kept separate from profile claims.
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

function ReviewReportForm({ onSubmit }) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return submitted ? <p className="mt-2 text-xs text-teal-700">Report submitted for moderator review.</p> : (
    <form className="mt-2 space-y-2" onSubmit={async (event) => { event.preventDefault(); if (await onSubmit(reason)) setSubmitted(true); }}>
      <textarea required minLength="5" maxLength="1000" rows="2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tell us why this review should be checked." className="w-full rounded border border-card-border px-2 py-1.5 text-xs" />
      <button type="submit" className="rounded bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">Send report</button>
    </form>
  );
}
