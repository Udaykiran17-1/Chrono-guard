import { useState, useEffect } from 'react';
import {
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Briefcase,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { Button, Input, Modal, Badge, Spinner } from '../ui';
import { submitApplication } from '../../services/applicationService';
import { getProfileById } from '../../services/profileService';

export default function ApplyProjectModal({
  isOpen,
  onClose,
  project,
  user,
  onSuccess,
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [introduction, setIntroduction] = useState('');
  const [relevantExperience, setRelevantExperience] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [comments, setComments] = useState('');

  // Portfolio items
  const [userPortfolio, setUserPortfolio] = useState([]);
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState([]);
  const [customLinks, setCustomLinks] = useState([]);
  const [newCustomTitle, setNewCustomTitle] = useState('');
  const [newCustomUrl, setNewCustomUrl] = useState('');
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  // Load user's saved portfolio items on mount / open
  useEffect(() => {
    let isMounted = true;
    async function loadPortfolio() {
      if (!user?.id || !isOpen) return;
      try {
        setLoadingPortfolio(true);
        const profile = await getProfileById(user.id);
        if (isMounted && profile?.portfolio_items) {
          setUserPortfolio(profile.portfolio_items);
          // By default, select all portfolio items if <= 2
          if (profile.portfolio_items.length > 0 && selectedPortfolioIds.length === 0) {
            setSelectedPortfolioIds(profile.portfolio_items.slice(0, 2).map((p) => p.id));
          }
        }
      } catch (err) {
        console.error('Error fetching user portfolio items:', err);
      } finally {
        if (isMounted) setLoadingPortfolio(false);
      }
    }

    if (isOpen) {
      loadPortfolio();
      // Set default proposed price from project budget if fixed
      if (project?.budget_type === 'fixed' && project?.budget_min) {
        setProposedPrice(project.budget_min.toString());
      }
    }
  }, [user?.id, isOpen, project]);

  // Reset state on close
  const handleClose = () => {
    setStep(1);
    setError(null);
    onClose();
  };

  const handleTogglePortfolio = (itemId) => {
    setSelectedPortfolioIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleAddCustomLink = () => {
    if (!newCustomUrl.trim()) return;
    const url = newCustomUrl.trim().startsWith('http')
      ? newCustomUrl.trim()
      : `https://${newCustomUrl.trim()}`;

    setCustomLinks((prev) => [
      ...prev,
      {
        title: newCustomTitle.trim() || 'Portfolio Link',
        url,
      },
    ]);
    setNewCustomTitle('');
    setNewCustomUrl('');
  };

  const handleRemoveCustomLink = (index) => {
    setCustomLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // Compile full list of portfolio links
  const compiledPortfolioLinks = [
    ...userPortfolio
      .filter((p) => selectedPortfolioIds.includes(p.id))
      .map((p) => ({
        title: p.title,
        url: p.project_url || p.github_url || '#',
      })),
    ...customLinks,
  ];

  // Validate step 1 before proceeding to review
  const handleProceedToReview = (e) => {
    e.preventDefault();
    setError(null);

    if (!introduction.trim()) {
      setError('Please provide a short introduction or proposal pitch.');
      return;
    }
    if (!relevantExperience.trim()) {
      setError('Please summarize your relevant experience or technical skills.');
      return;
    }
    if (!estimatedDays || Number(estimatedDays) <= 0) {
      setError('Please enter a valid estimated timeline in days.');
      return;
    }

    setStep(2);
  };

  // Final submission
  const handleSubmit = async () => {
    if (!project || !user) return;
    setSubmitting(true);
    setError(null);

    try {
      await submitApplication(project.id, user.id, {
        introduction: introduction.trim(),
        relevantExperience: relevantExperience.trim(),
        portfolioLinks: compiledPortfolioLinks,
        estimatedDays: Number(estimatedDays),
        proposedPrice: proposedPrice ? Number(proposedPrice) : null,
        comments: comments.trim() || null,
      });

      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Apply for Project' : 'Review & Confirm Proposal'}
      size="lg"
    >
      {/* Progress header */}
      <div className="mb-5 flex items-center justify-between border-b border-card-border pb-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 1 ? 'bg-brand-indigo text-white' : 'bg-teal-100 text-brand-teal'
            }`}
          >
            {step === 1 ? '1' : '✓'}
          </span>
          <span className={`text-xs font-semibold ${step === 1 ? 'text-slate-900' : 'text-slate-500'}`}>
            Proposal Details
          </span>
          <span className="text-slate-300">→</span>
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
              step === 2 ? 'bg-brand-indigo text-white' : 'bg-slate-100 text-slate-400'
            }`}
          >
            2
          </span>
          <span className={`text-xs font-semibold ${step === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
            Review & Submit
          </span>
        </div>
        <Badge variant="indigo" className="text-[11px]">
          {project?.category}
        </Badge>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: FORM FIELDS */}
      {step === 1 && (
        <form onSubmit={handleProceedToReview} className="space-y-4">
          <div className="rounded-lg bg-slate-50 border border-card-border p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
              Project Position
            </h4>
            <p className="text-sm font-bold text-slate-900">{project?.title}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>Budget: {project?.budget_type?.toUpperCase()}</span>
              <span>•</span>
              <span>Deadline: {project?.deadline}</span>
              <span>•</span>
              <span>Spots: {project?.positions_filled || 0}/{project?.positions_total} filled</span>
            </div>
          </div>

          {/* Introduction */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Introduction & Proposal Pitch <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Introduce yourself to the creator and explain why you're a strong fit for this project..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
            />
            <p className="mt-0.5 text-[11px] text-slate-500">
              Highlight your motivation, approach, or prior related work.
            </p>
          </div>

          {/* Relevant Experience */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Relevant Experience & Skills <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={relevantExperience}
              onChange={(e) => setRelevantExperience(e.target.value)}
              placeholder="Detail your experience with the required technologies or project scope..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
            />
          </div>

          {/* Portfolio Links (Existing + Custom) */}
          <div className="rounded-card border border-card-border p-3.5 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-indigo" />
                <span>Featured Portfolio Links</span>
              </label>
              <span className="text-[11px] text-slate-500">Select work samples</span>
            </div>

            {loadingPortfolio ? (
              <div className="py-2 text-center text-xs text-slate-400">Loading portfolio...</div>
            ) : userPortfolio.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {userPortfolio.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded border text-xs cursor-pointer transition-colors ${
                      selectedPortfolioIds.includes(item.id)
                        ? 'bg-indigo-50 border-indigo-200 text-slate-900'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedPortfolioIds.includes(item.id)}
                        onChange={() => handleTogglePortfolio(item.id)}
                        className="rounded text-brand-indigo focus:ring-brand-indigo"
                      />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No portfolio items saved in your profile yet. Add custom links below.
              </p>
            )}

            {/* Custom Link Input */}
            <div className="pt-2 border-t border-slate-200/80">
              <p className="text-[11px] font-medium text-slate-600 mb-1.5">
                Add External Link (GitHub repo, Behance, Live Demo):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Link Title (e.g. GitHub Repo)"
                  value={newCustomTitle}
                  onChange={(e) => setNewCustomTitle(e.target.value)}
                  className="rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-indigo focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newCustomUrl}
                    onChange={(e) => setNewCustomUrl(e.target.value)}
                    className="flex-1 rounded border border-slate-300 px-2.5 py-1.5 text-xs focus:border-brand-indigo focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCustomLink}
                    className="text-xs px-2.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Added Custom links pills */}
              {customLinks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {customLinks.map((link, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded bg-white border border-slate-300 px-2 py-0.5 text-xs text-slate-700"
                    >
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                      <span>{link.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomLink(idx)}
                        className="text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timeline & Proposed Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Timeline (Days) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="365"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-2 text-sm text-slate-900 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                />
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Proposed price if applicable */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Proposed Price (₹)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  placeholder={
                    project?.budget_type === 'fixed'
                      ? `Budget: ₹${project?.budget_min || 0}`
                      : project?.budget_type === 'negotiable'
                      ? `Range: ₹${project?.budget_min || 0} - ₹${project?.budget_max || 0}`
                      : 'Optional'
                  }
                  className="w-full rounded-md border border-slate-300 pl-8 pr-3 py-2 text-sm text-slate-900 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                />
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {project?.budget_type === 'unpaid'
                  ? 'Project is marked as Unpaid Collaboration'
                  : project?.budget_type === 'volunteer'
                  ? 'Volunteer position'
                  : 'Proposed quote or milestone sum'}
              </p>
            </div>
          </div>

          {/* Additional Comments */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Comments or Questions (Optional)
            </label>
            <textarea
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Any questions regarding requirements, preferred meeting times, etc."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-indigo focus:outline-none focus:ring-1 focus:ring-brand-indigo"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-card-border pt-4">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
              <span>Review Proposal</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: REVIEW & CONFIRM */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-900">
            <p className="font-semibold mb-0.5">Review your application before submission</p>
            <p className="text-slate-600">
              The project creator will review your pitch, timeline, and portfolio links. You will be notified when your proposal is evaluated.
            </p>
          </div>

          <div className="space-y-3 rounded-card border border-card-border p-4 bg-white text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Target Opportunity
              </span>
              <p className="text-sm font-bold text-slate-900">{project?.title}</p>
            </div>

            <div className="border-t border-card-border pt-2.5">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Introduction
              </span>
              <p className="text-slate-700 mt-1 whitespace-pre-line">{introduction}</p>
            </div>

            <div className="border-t border-card-border pt-2.5">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Relevant Experience
              </span>
              <p className="text-slate-700 mt-1 whitespace-pre-line">{relevantExperience}</p>
            </div>

            <div className="border-t border-card-border pt-2.5 grid grid-cols-2 gap-4">
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Estimated Timeline
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {estimatedDays} Days
                </p>
              </div>
              <div>
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Proposed Compensation
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {proposedPrice ? `₹${Number(proposedPrice).toLocaleString()}` : 'Per Project Scope'}
                </p>
              </div>
            </div>

            {compiledPortfolioLinks.length > 0 && (
              <div className="border-t border-card-border pt-2.5">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Included Portfolio Links ({compiledPortfolioLinks.length})
                </span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {compiledPortfolioLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-1 text-xs text-brand-cobalt hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {comments && (
              <div className="border-t border-card-border pt-2.5">
                <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                  Additional Notes
                </span>
                <p className="text-slate-600 mt-0.5">{comments}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-card-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep(1)}
              disabled={submitting}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" />
                  <span>Submitting Proposal...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Confirm & Submit Application</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
