import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Save,
  Send,
  Plus,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardBody, CardFooter, Badge, Spinner } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { createProject, updateProject, getProjectById } from '../../services/projectService';
import { getAvailableSkills } from '../../services/profileService';
import { getMyOrganizations } from '../../services/organizationService';

const PROJECT_CATEGORIES = [
  'Web Development',
  'Software Engineering',
  'Creative & Design',
  'Media & Video',
  'Mobile Apps',
  'Machine Learning & AI',
  'Hardware & Robotics',
  'Event & Marketing',
  'Technical Writing',
  'Other',
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Budget (Specific amount)' },
  { value: 'negotiable', label: 'Negotiable (Discuss based on scope)' },
  { value: 'unpaid', label: 'Unpaid Collaboration (Portfolio & mutual learning)' },
  { value: 'volunteer', label: 'Volunteer Opportunity (Campus community & NGO)' },
  { value: 'other', label: 'Other (Certificates, festival passes, stipends)' },
];

export default function CreateProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  // Form State matching Product Spec Section 6.2
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    what_needs_doing: '',
    why_required: '',
    expected_deliverables: '',
    additional_requirements: '',
    budget_type: 'fixed',
    budget_min: '',
    budget_max: '',
    budget_note: '',
    deadline: '',
    estimated_duration: '',
    positions_total: 1,
    skill_ids: [],
    organization_id: '',
  });

  const [selectedSkillId, setSelectedSkillId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [skills, orgs] = await Promise.all([getAvailableSkills(), getMyOrganizations(user?.id)]);
        setAvailableSkills(skills || []);
        setOrganizations(orgs || []);
        if (skills?.length > 0) setSelectedSkillId(skills[0].id);

        if (isEditing) {
          const existing = await getProjectById(id);
          if (existing.creator_id !== user?.id) {
            setError('You are not authorized to edit this project.');
            return;
          }
          setFormData({
            title: existing.title || '',
            category: existing.category || 'Web Development',
            what_needs_doing: existing.what_needs_doing || '',
            why_required: existing.why_required || '',
            expected_deliverables: existing.expected_deliverables || '',
            additional_requirements: existing.additional_requirements || '',
            budget_type: existing.budget_type || 'fixed',
            budget_min: existing.budget_min || '',
            budget_max: existing.budget_max || '',
            budget_note: existing.budget_note || '',
            deadline: existing.deadline || '',
            estimated_duration: existing.estimated_duration || '',
            positions_total: existing.positions_total || 1,
            skill_ids: (existing.skills || []).map((s) => s.id),
            organization_id: existing.organization_id || '',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize project form');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, isEditing, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (!selectedSkillId) return;
    if (formData.skill_ids.includes(selectedSkillId)) return;
    setFormData((prev) => ({
      ...prev,
      skill_ids: [...prev.skill_ids, selectedSkillId],
    }));
  };

  const handleRemoveSkill = (skillId) => {
    setFormData((prev) => ({
      ...prev,
      skill_ids: prev.skill_ids.filter((sid) => sid !== skillId),
    }));
  };

  const validate = () => {
    if (!formData.title.trim()) return 'Project title is required.';
    if (!formData.what_needs_doing.trim()) return 'Please explain what needs to be done.';
    if (!formData.why_required.trim()) return 'Please explain why the work is required.';
    if (!formData.expected_deliverables.trim()) return 'Please list expected deliverables.';
    if (!formData.deadline) return 'Please set a project deadline.';
    if (new Date(formData.deadline) < new Date(new Date().setHours(0, 0, 0, 0))) {
      return 'Project deadline must be today or in the future.';
    }
    if (formData.skill_ids.length === 0) return 'Please associate at least one required skill.';
    return null;
  };

  const handleSubmit = async (publishImmediately = true) => {
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!user?.id) {
      setError('You must be signed in to post a project.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        organization_id: formData.organization_id || null,
        status: publishImmediately ? 'open' : 'draft',
      };

      let result;
      if (isEditing) {
        result = await updateProject(id, payload);
      } else {
        result = await createProject(user.id, payload);
      }

      navigate(`/projects/${result.id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit project opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-canvas min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <PageContainer className="max-w-4xl">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cobalt hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Project Marketplace
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Project Requirement' : 'Publish a Campus Project'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured requirements prevent misunderstandings and help skilled students assess project scope accurately.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* ───── SECTION 1: OVERVIEW ───── */}
          <Card className="shadow-xs">
            <CardHeader className="bg-slate-50/70">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                1. Project Title & Categorization
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <Input
                label="Project Title"
                name="title"
                placeholder="e.g. ACM Student Chapter Annual Website Revamp"
                value={formData.title}
                onChange={handleChange}
                helperText="Be specific. Mention the club, initiative, or application name."
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                >
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </CardBody>
          </Card>

          {/* ───── SECTION 2: STRUCTURED BREAKDOWN (SPEC SECTION 6.2) ───── */}
          <Card className="shadow-xs">
            <CardHeader className="bg-slate-50/70">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                2. Structured Scope Breakdown
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  What needs to be done? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="what_needs_doing"
                  rows={3}
                  placeholder="Outline the core objective and specific tasks (e.g. Design 10 festival posters, Develop responsive ground station dashboard)..."
                  value={formData.what_needs_doing}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Why is the work required? <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="why_required"
                  rows={2}
                  placeholder="Explain the background context (e.g. Current club portal is outdated; Competing in national robotics challenge next month)..."
                  value={formData.why_required}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Expected Deliverables <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="expected_deliverables"
                  rows={3}
                  placeholder="Numbered list of final tangible deliverables:&#10;1. Production React frontend code&#10;2. High-res vector logo assets&#10;3. Setup documentation"
                  value={formData.expected_deliverables}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Additional Requirements (Optional)
                </label>
                <textarea
                  name="additional_requirements"
                  rows={2}
                  placeholder="e.g. Must have access to personal GPU for model training; Weekly Saturday sync meeting required."
                  value={formData.additional_requirements}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                />
              </div>
            </CardBody>
          </Card>

          {/* ───── SECTION 3: REQUIRED SKILLS ───── */}
          <Card className="shadow-xs">
            <CardHeader className="bg-slate-50/70">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                3. Required Skills & Competencies
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="flex-1 rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900"
                >
                  {availableSkills.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
                <Button variant="secondary" size="sm" onClick={handleAddSkill} className="text-xs">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </div>

              {/* Tagged Skills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.skill_ids.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills selected yet. Add at least 1 skill.</p>
                ) : (
                  formData.skill_ids.map((sid) => {
                    const skillObj = availableSkills.find((s) => s.id === sid);
                    return (
                      <span
                        key={sid}
                        className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-brand-indigo"
                      >
                        <span>{skillObj?.name || 'Skill'}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sid)}
                          className="hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })
                )}
              </div>
            </CardBody>
          </Card>

          {/* ───── SECTION 4: TIMELINE & CAPACITY ───── */}
          <Card className="shadow-xs">
            <CardHeader className="bg-slate-50/70">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                4. Timeline & Capacity
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Deadline"
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Estimated Duration"
                  name="estimated_duration"
                  placeholder="e.g. 2 weeks / 1 month"
                  value={formData.estimated_duration}
                  onChange={handleChange}
                />

                <Input
                  label="Collaborators Needed"
                  type="number"
                  min="1"
                  max="10"
                  name="positions_total"
                  value={formData.positions_total}
                  onChange={handleChange}
                  helperText="Positions available"
                  required
                />
              </div>
            </CardBody>
          </Card>

          {/* ───── SECTION 5: HONEST COMPENSATION DISCLOSURE ───── */}
          <Card className="shadow-xs">
            <CardHeader className="bg-slate-50/70">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                5. Compensation & Budget Disclosure
              </h2>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Compensation Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="budget_type"
                  value={formData.budget_type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {BUDGET_TYPES.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {bt.label}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.budget_type === 'fixed' || formData.budget_type === 'negotiable') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Amount (₹)"
                    type="number"
                    name="budget_min"
                    placeholder="e.g. 5000"
                    value={formData.budget_min}
                    onChange={handleChange}
                  />
                  <Input
                    label="Maximum Amount (₹)"
                    type="number"
                    name="budget_max"
                    placeholder="e.g. 8000"
                    value={formData.budget_max}
                    onChange={handleChange}
                  />
                </div>
              )}

              <Input
                label="Compensation Notes / Non-monetary Perks"
                name="budget_note"
                placeholder="e.g. Milestone-based: 50% upon wireframes, 50% on launch. Campus certificate included."
                value={formData.budget_note}
                onChange={handleChange}
              />
            </CardBody>
          </Card>

          {organizations.length > 0 && <Card className="shadow-xs"><CardHeader className="bg-slate-50/70"><h2 className="text-xs font-bold uppercase tracking-wider">Organization project history</h2></CardHeader><CardBody><label className="block text-sm font-medium text-slate-700">Associate with an organization (optional)<select name="organization_id" value={formData.organization_id} onChange={handleChange} className="mt-1 w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm"><option value="">Personal project</option>{organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}</select><span className="mt-1 block text-xs text-slate-500">Only organizations where you have management permission can be selected.</span></label></CardBody></Card>}

          {/* Form Action Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => handleSubmit(false)}
              className="flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Save as Draft</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              loading={submitting}
              onClick={() => handleSubmit(true)}
              className="flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>{isEditing ? 'Update & Publish' : 'Publish Project'}</span>
            </Button>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
