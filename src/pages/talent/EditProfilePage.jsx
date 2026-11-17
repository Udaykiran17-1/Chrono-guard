import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  School,
  BookOpen,
  Calendar,
  Briefcase,
  Users,
  Save,
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Modal,
  Spinner,
  GithubIcon,
  LinkedinIcon,
} from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import {
  getProfileById,
  updateProfile,
  updateAvailability,
  getAvailableSkills,
  requestUnlistedSkill,
  addUserSkill,
  updateUserSkill,
  removeUserSkill,
  createPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem,
  uploadMediaFile,
} from '../../services/profileService';

const TABS = [
  { id: 'general', label: 'Basic Info & Bio', icon: User },
  { id: 'skills', label: 'Skills & Proficiency', icon: Sparkles },
  { id: 'portfolio', label: 'Portfolio Projects', icon: Layers },
  { id: 'availability', label: 'Availability & Roles', icon: Clock },
];

const ACADEMIC_YEARS = [
  { value: '1st Year', label: '1st Year (Freshman)' },
  { value: '2nd Year', label: '2nd Year (Sophomore)' },
  { value: '3rd Year', label: '3rd Year (Junior)' },
  { value: '4th Year', label: '4th Year (Senior)' },
  { value: '5th Year', label: '5th Year (Dual/Arch)' },
  { value: 'Postgraduate', label: 'Postgraduate (Masters/PhD)' },
];

const PORTFOLIO_CATEGORIES = [
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'Machine Learning & AI',
  'Robotics & Hardware',
  'Creative & Media',
  'Research & Analysis',
  'Other',
];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  // 1. General Profile State
  const [generalForm, setGeneralForm] = useState({
    full_name: '',
    headline: '',
    bio: '',
    course: '',
    academic_year: '1st Year',
    avatar_url: '',
    areas_of_interest: [],
    interestInput: '',
    contact_links: {
      linkedin: '',
      github: '',
      website: '',
    },
  });

  // 2. Skills State
  const [availableSkills, setAvailableSkills] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('intermediate');
  const [selectedIsPrimary, setSelectedIsPrimary] = useState(false);
  const [showUnlistedModal, setShowUnlistedModal] = useState(false);
  const [unlistedName, setUnlistedName] = useState('');
  const [unlistedCategory, setUnlistedCategory] = useState('Technical');

  // 3. Portfolio State
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    thumbnail_url: '',
    project_url: '',
    github_url: '',
    completed_date: '',
    skill_ids: [],
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // 4. Availability State
  const [availabilityForm, setAvailabilityForm] = useState({
    availability_status: 'available',
    availability_note: '',
    available_from: '',
    is_freelancer_enabled: true,
    is_seeker_enabled: true,
  });

  useEffect(() => {
    async function loadData() {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [fullProfile, allSkills] = await Promise.all([
          getProfileById(user.id),
          getAvailableSkills(),
        ]);

        const p = fullProfile.profile;
        if (p) {
          setGeneralForm({
            full_name: p.full_name || '',
            headline: p.headline || '',
            bio: p.bio || '',
            course: p.course || '',
            academic_year: p.academic_year || '1st Year',
            avatar_url: p.avatar_url || '',
            areas_of_interest: p.areas_of_interest || [],
            interestInput: '',
            contact_links: {
              linkedin: p.contact_links?.linkedin || '',
              github: p.contact_links?.github || '',
              website: p.contact_links?.website || '',
            },
          });

          setAvailabilityForm({
            availability_status: p.availability_status || 'available',
            availability_note: p.availability_note || '',
            available_from: p.available_from || '',
            is_freelancer_enabled: p.is_freelancer_enabled ?? true,
            is_seeker_enabled: p.is_seeker_enabled ?? true,
          });
        }

        setUserSkills(fullProfile.user_skills || []);
        setPortfolioItems(fullProfile.portfolio_items || []);
        setAvailableSkills(allSkills || []);
        if (allSkills?.length > 0) setSelectedSkillId(allSkills[0].id);
      } catch (err) {
        setError(err.message || 'Failed to load profile for editing');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Flash success message helper
  const triggerSuccess = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(''), 4000);
  };

  // Avatar file upload handler
  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setError('');
    setUploadingMedia(true);
    try {
      const publicUrl = await uploadMediaFile('avatars', user.id, file);
      setGeneralForm((prev) => ({ ...prev, avatar_url: publicUrl }));
      triggerSuccess('Avatar image uploaded successfully!');
    } catch (err) {
      setError(err.message || 'Avatar upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  // Save General Profile Info
  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile(user.id, {
        full_name: generalForm.full_name.trim(),
        headline: generalForm.headline.trim(),
        bio: generalForm.bio.trim(),
        course: generalForm.course.trim(),
        academic_year: generalForm.academic_year,
        avatar_url: generalForm.avatar_url.trim(),
        areas_of_interest: generalForm.areas_of_interest,
        contact_links: generalForm.contact_links,
      });
      await refreshProfile(user.id);
      triggerSuccess('Profile information updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Areas of Interest Add / Remove
  const handleAddInterest = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = generalForm.interestInput.trim();
      if (!val) return;
      if (!generalForm.areas_of_interest.includes(val)) {
        setGeneralForm((prev) => ({
          ...prev,
          areas_of_interest: [...prev.areas_of_interest, val],
          interestInput: '',
        }));
      }
    }
  };

  const handleRemoveInterest = (interest) => {
    setGeneralForm((prev) => ({
      ...prev,
      areas_of_interest: prev.areas_of_interest.filter((i) => i !== interest),
    }));
  };

  // ───── Skills Actions ─────
  const handleAddSkill = async () => {
    if (!user?.id || !selectedSkillId) return;
    setError('');
    if (userSkills.some((s) => s.skill_id === selectedSkillId)) {
      setError('Skill is already added to your profile.');
      return;
    }

    try {
      const newEntry = await addUserSkill(user.id, {
        skill_id: selectedSkillId,
        proficiency: selectedProficiency,
        is_primary: selectedIsPrimary,
      });
      setUserSkills((prev) => [...prev, newEntry]);
      triggerSuccess('Skill added!');
    } catch (err) {
      setError(err.message || 'Could not add skill');
    }
  };

  const handleTogglePrimarySkill = async (userSkill) => {
    try {
      const updated = await updateUserSkill(userSkill.id, {
        is_primary: !userSkill.is_primary,
      });
      setUserSkills((prev) =>
        prev.map((s) => (s.id === userSkill.id ? { ...s, is_primary: !s.is_primary } : s))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangeSkillProficiency = async (userSkill, newProf) => {
    try {
      await updateUserSkill(userSkill.id, { proficiency: newProf });
      setUserSkills((prev) =>
        prev.map((s) => (s.id === userSkill.id ? { ...s, proficiency: newProf } : s))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveSkill = async (userSkillId) => {
    try {
      await removeUserSkill(userSkillId);
      setUserSkills((prev) => prev.filter((s) => s.id !== userSkillId));
      triggerSuccess('Skill removed.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRequestUnlistedSkill = async (e) => {
    e.preventDefault();
    if (!unlistedName.trim() || !user?.id) return;
    try {
      const newSkill = await requestUnlistedSkill(unlistedName, unlistedCategory);
      setAvailableSkills((prev) => [...prev, newSkill]);
      setSelectedSkillId(newSkill.id);
      setShowUnlistedModal(false);
      setUnlistedName('');

      // Auto-add to user skills
      const entry = await addUserSkill(user.id, {
        skill_id: newSkill.id,
        proficiency: 'intermediate',
        is_primary: false,
      });
      setUserSkills((prev) => [...prev, entry]);
      triggerSuccess('Unlisted skill requested and added to your profile!');
    } catch (err) {
      setError(err.message);
    }
  };

  // ───── Portfolio Actions ─────
  const openNewPortfolioModal = () => {
    setEditingItem(null);
    setPortfolioForm({
      title: '',
      category: 'Web Development',
      description: '',
      thumbnail_url: '',
      project_url: '',
      github_url: '',
      completed_date: new Date().toISOString().split('T')[0],
      skill_ids: [],
    });
    setShowPortfolioModal(true);
  };

  const openEditPortfolioModal = (item) => {
    setEditingItem(item);
    setPortfolioForm({
      title: item.title || '',
      category: item.category || 'Web Development',
      description: item.description || '',
      thumbnail_url: item.thumbnail_url || '',
      project_url: item.project_url || '',
      github_url: item.github_url || '',
      completed_date: item.completed_date || '',
      skill_ids: (item.skills || []).map((s) => s.id),
    });
    setShowPortfolioModal(true);
  };

  const handlePortfolioThumbFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingMedia(true);
    try {
      const url = await uploadMediaFile('portfolio-media', user.id, file);
      setPortfolioForm((prev) => ({ ...prev, thumbnail_url: url }));
      triggerSuccess('Thumbnail uploaded!');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !user?.id) {
      setError('Project title is required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (editingItem) {
        const updated = await updatePortfolioItem(editingItem.id, portfolioForm);
        setPortfolioItems((prev) =>
          prev.map((p) => (p.id === editingItem.id ? updated : p))
        );
        triggerSuccess('Portfolio project updated!');
      } else {
        const created = await createPortfolioItem(user.id, portfolioForm);
        setPortfolioItems((prev) => [created, ...prev]);
        triggerSuccess('Portfolio project created!');
      }
      setShowPortfolioModal(false);
    } catch (err) {
      setError(err.message || 'Failed to save portfolio project');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePortfolio = async (itemId) => {
    if (!confirm('Are you sure you want to remove this project from your portfolio?')) return;
    try {
      await deletePortfolioItem(itemId);
      setPortfolioItems((prev) => prev.filter((p) => p.id !== itemId));
      triggerSuccess('Portfolio item deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  // ───── Availability & Roles Save ─────
  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError('');
    try {
      await updateProfile(user.id, {
        availability_status: availabilityForm.availability_status,
        availability_note: availabilityForm.availability_note.trim(),
        available_from: availabilityForm.available_from || null,
        is_freelancer_enabled: availabilityForm.is_freelancer_enabled,
        is_seeker_enabled: availabilityForm.is_seeker_enabled,
      });
      await refreshProfile(user.id);
      triggerSuccess('Availability and collaboration roles updated!');
    } catch (err) {
      setError(err.message || 'Failed to update availability');
    } finally {
      setSaving(false);
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
    <div className="min-h-[calc(100vh-56px)] bg-canvas py-8 px-4 sm:px-6 lg:px-8">
      <PageContainer className="max-w-5xl">
        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/profile/me"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cobalt hover:underline mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to My Profile
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Your Student Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your personal bio, competencies, portfolio projects, and campus availability.
            </p>
          </div>

          <Link to="/profile/me">
            <Button variant="outline" size="sm" className="flex items-center gap-1.5">
              <span>View Live Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Success / Error Alerts */}
        {saveSuccess && (
          <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex flex-wrap border-b border-card-border mb-6 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 ${
                  isActive
                    ? 'border-brand-indigo text-brand-indigo bg-white shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ───── TAB 1: BASIC INFO & BIO ───── */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral}>
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Basic Information & Campus Affiliation
                </h2>
              </CardHeader>

              <CardBody className="p-6 space-y-6">
                {/* Avatar Preview & Upload */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-slate-50 border border-card-border">
                  <img
                    src={
                      generalForm.avatar_url ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        generalForm.full_name || 'SB'
                      )}`
                    }
                    alt="Avatar preview"
                    className="h-20 w-20 rounded-full border-2 border-white shadow-md object-cover bg-white"
                  />
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <label className="block text-xs font-bold text-slate-800">
                      Profile Photograph
                    </label>
                    <p className="text-xs text-slate-500">
                      Upload a clean square image (JPG, PNG, WEBP, max 5MB) or enter an external image URL.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleAvatarFile}
                          disabled={uploadingMedia}
                          className="hidden"
                        />
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          <Upload className="h-3.5 w-3.5 text-slate-500" />
                          {uploadingMedia ? 'Uploading…' : 'Upload Image'}
                        </span>
                      </label>
                      <span className="text-xs text-slate-400">or</span>
                      <input
                        type="url"
                        placeholder="https://example.com/avatar.jpg"
                        value={generalForm.avatar_url}
                        onChange={(e) =>
                          setGeneralForm((prev) => ({ ...prev, avatar_url: e.target.value }))
                        }
                        className="rounded-lg border border-card-border bg-white px-3 py-1.5 text-xs text-slate-700 w-64 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={generalForm.full_name}
                    onChange={(e) =>
                      setGeneralForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    required
                  />

                  <Input
                    label="Professional Headline"
                    placeholder="e.g. Full-Stack Developer & Robotics Enthusiast"
                    value={generalForm.headline}
                    onChange={(e) =>
                      setGeneralForm((prev) => ({ ...prev, headline: e.target.value }))
                    }
                    helperText="Appears below your name across the platform."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Degree / Major"
                    placeholder="e.g. B.Tech Computer Science"
                    value={generalForm.course}
                    onChange={(e) =>
                      setGeneralForm((prev) => ({ ...prev, course: e.target.value }))
                    }
                  />

                  <Select
                    label="Academic Year"
                    options={ACADEMIC_YEARS}
                    value={generalForm.academic_year}
                    onChange={(e) =>
                      setGeneralForm((prev) => ({ ...prev, academic_year: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Biography / About You
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Introduce your background, technical passions, previous extracurricular projects, and what you enjoy building."
                    value={generalForm.bio}
                    onChange={(e) =>
                      setGeneralForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                {/* Areas of Interest */}
                <div className="pt-2 border-t border-card-border">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Areas of Interest (Press Enter to add tags)
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="e.g. Distributed Systems, Generative AI, Mobile Design"
                      value={generalForm.interestInput}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({ ...prev, interestInput: e.target.value }))
                      }
                      onKeyDown={handleAddInterest}
                      className="flex-1 rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddInterest}
                      className="text-xs"
                    >
                      Add Tag
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {generalForm.areas_of_interest.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Opt-in Contact Links */}
                <div className="pt-2 border-t border-card-border space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Opt-in Social & Portfolio Links
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label="LinkedIn URL"
                      placeholder="https://linkedin.com/in/..."
                      value={generalForm.contact_links.linkedin}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          contact_links: { ...prev.contact_links, linkedin: e.target.value },
                        }))
                      }
                    />
                    <Input
                      label="GitHub URL"
                      placeholder="https://github.com/..."
                      value={generalForm.contact_links.github}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          contact_links: { ...prev.contact_links, github: e.target.value },
                        }))
                      }
                    />
                    <Input
                      label="Personal Website"
                      placeholder="https://..."
                      value={generalForm.contact_links.website}
                      onChange={(e) =>
                        setGeneralForm((prev) => ({
                          ...prev,
                          contact_links: { ...prev.contact_links, website: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardBody>

              <CardFooter className="bg-slate-50/70 p-4 sm:p-6 flex justify-end">
                <Button type="submit" variant="primary" loading={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save General Info</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}

        {/* ───── TAB 2: SKILLS & PROFICIENCY ───── */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Add & Manage Your Skills
                    </h2>
                    <p className="text-xs text-slate-500">
                      All proficiency levels are displayed as self-reported to maintain transparent campus collaboration.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUnlistedModal(true)}
                    className="text-xs font-semibold text-brand-cobalt"
                  >
                    + Request Unlisted Skill
                  </Button>
                </div>
              </CardHeader>

              <CardBody className="p-6 space-y-6">
                {/* Add Skill Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-lg bg-slate-50 border border-card-border">
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Select Skill</label>
                    <select
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      {availableSkills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Self-Reported Level
                    </label>
                    <select
                      value={selectedProficiency}
                      onChange={(e) => setSelectedProficiency(e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={selectedIsPrimary}
                        onChange={(e) => setSelectedIsPrimary(e.target.checked)}
                        className="rounded text-brand-indigo"
                      />
                      <span>Top Skill</span>
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddSkill}
                      className="w-full text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* User Skills List Table */}
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                    Your Current Listed Skills ({userSkills.length})
                  </h3>

                  {userSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-6 text-center border border-dashed rounded-lg">
                      No skills added yet. Use the dropdown above to add your technical and creative competencies.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {userSkills.map((us) => (
                        <div
                          key={us.id}
                          className="flex flex-wrap items-center justify-between p-3 rounded-lg bg-white border border-card-border shadow-xs gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleTogglePrimarySkill(us)}
                              title={us.is_primary ? 'Primary skill (Click to toggle)' : 'Mark as primary skill'}
                              className="text-slate-300 hover:text-amber-500 transition-colors"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  us.is_primary ? 'text-amber-500 fill-amber-500' : ''
                                }`}
                              />
                            </button>
                            <span className="text-sm font-bold text-slate-900">
                              {us.skills?.name || 'Skill'}
                            </span>
                            <Badge variant="neutral" className="text-[10px]">
                              {us.skills?.category || 'General'}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <select
                              value={us.proficiency}
                              onChange={(e) =>
                                handleChangeSkillProficiency(us, e.target.value)
                              }
                              className="rounded border border-card-border bg-slate-50 px-2 py-1 text-xs text-slate-700 font-medium"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(us.id)}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Delete skill"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Unlisted Skill Modal */}
            <Modal
              isOpen={showUnlistedModal}
              onClose={() => setShowUnlistedModal(false)}
              title="Request an Unlisted Skill"
            >
              <form onSubmit={handleRequestUnlistedSkill} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Can't find a specialized tool or technology in the directory? Propose it here. It will be added to your profile immediately with an unapproved status pending campus admin review.
                </p>

                <Input
                  label="Skill Name"
                  placeholder="e.g. SvelteKit, Unreal Engine 5, Solidity"
                  value={unlistedName}
                  onChange={(e) => setUnlistedName(e.target.value)}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={unlistedCategory}
                    onChange={(e) => setUnlistedCategory(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white p-2.5 text-sm text-slate-900"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Creative">Creative</option>
                    <option value="Management & Other">Management & Other</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowUnlistedModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Submit & Add to Profile
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* ───── TAB 3: PORTFOLIO PROJECTS ───── */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Featured Portfolio Projects
                  </h2>
                  <p className="text-xs text-slate-500">
                    Add self-reported previous work, research, club event deliverables, and GitHub repos.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openNewPortfolioModal}
                  className="flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Project</span>
                </Button>
              </CardHeader>

              <CardBody className="p-6">
                {portfolioItems.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg bg-slate-50/50">
                    <Layers className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-800">No portfolio projects</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Add deliverables you've produced to demonstrate your capabilities to campus clubs and project creators.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openNewPortfolioModal}
                      className="mt-4"
                    >
                      + Create First Portfolio Item
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {portfolioItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-card border border-card-border bg-white overflow-hidden shadow-xs p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <Badge variant="indigo" className="text-[10px] mb-1">
                                {item.category || 'Project'}
                              </Badge>
                              <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                                {item.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditPortfolioModal(item)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title="Edit project"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePortfolio(item.id)}
                                className="text-slate-400 hover:text-red-600 p-1"
                                title="Delete project"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-card-border flex items-center justify-between text-xs text-slate-500">
                          <span className="text-[10px]">
                            {item.completed_date ? `Date: ${item.completed_date}` : 'No date'}
                          </span>
                          <div className="flex items-center gap-2">
                            {item.github_url && (
                              <a
                                href={item.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-slate-800"
                              >
                                <GithubIcon className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {item.project_url && (
                              <a
                                href={item.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-brand-cobalt hover:underline flex items-center gap-1 font-medium text-[11px]"
                              >
                                <span>Link</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Modal for Add / Edit Portfolio Item */}
            <Modal
              isOpen={showPortfolioModal}
              onClose={() => setShowPortfolioModal(false)}
              title={editingItem ? 'Edit Portfolio Project' : 'Add New Portfolio Project'}
              size="lg"
            >
              <form onSubmit={handleSavePortfolio} className="space-y-4">
                <Input
                  label="Project Title"
                  placeholder="e.g. Campus Event Ticketing App"
                  value={portfolioForm.title}
                  onChange={(e) =>
                    setPortfolioForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      value={portfolioForm.category}
                      onChange={(e) =>
                        setPortfolioForm((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900"
                    >
                      {PORTFOLIO_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Completion Date"
                    type="date"
                    value={portfolioForm.completed_date}
                    onChange={(e) =>
                      setPortfolioForm((prev) => ({ ...prev, completed_date: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description & Key Deliverables
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what you built, what tools you used, and what challenges you solved..."
                    value={portfolioForm.description}
                    onChange={(e) =>
                      setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Live Demo / Website URL"
                    placeholder="https://..."
                    value={portfolioForm.project_url}
                    onChange={(e) =>
                      setPortfolioForm((prev) => ({ ...prev, project_url: e.target.value }))
                    }
                  />
                  <Input
                    label="GitHub / Code Repository URL"
                    placeholder="https://github.com/..."
                    value={portfolioForm.github_url}
                    onChange={(e) =>
                      setPortfolioForm((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                  />
                </div>

                {/* Thumbnail upload or url */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Thumbnail Image (Optional)
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="https://... or upload a local file"
                      value={portfolioForm.thumbnail_url}
                      onChange={(e) =>
                        setPortfolioForm((prev) => ({ ...prev, thumbnail_url: e.target.value }))
                      }
                      className="flex-1 rounded-lg border border-card-border bg-white px-3 py-2 text-xs"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePortfolioThumbFile}
                        disabled={uploadingMedia}
                        className="hidden"
                      />
                      <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold hover:bg-slate-50">
                        <Upload className="h-3.5 w-3.5" />
                        {uploadingMedia ? '...' : 'Upload'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Skill Associations Checkbox */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Skills Used in This Project
                  </label>
                  <div className="max-h-36 overflow-y-auto border border-card-border rounded-lg p-2.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-50">
                    {availableSkills.map((s) => {
                      const checked = portfolioForm.skill_ids.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setPortfolioForm((prev) => ({
                                ...prev,
                                skill_ids: checked
                                  ? prev.skill_ids.filter((id) => id !== s.id)
                                  : [...prev.skill_ids, s.id],
                              }));
                            }}
                            className="rounded text-brand-indigo"
                          />
                          <span className="truncate">{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-card-border">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowPortfolioModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={saving}>
                    {editingItem ? 'Save Changes' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </Modal>
          </div>
        )}

        {/* ───── TAB 4: AVAILABILITY & ROLES ───── */}
        {activeTab === 'availability' && (
          <form onSubmit={handleSaveAvailability}>
            <Card className="shadow-sm">
              <CardHeader>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Live Availability & Collaboration Modes
                </h2>
                <p className="text-xs text-slate-500">
                  Control when peers can contact you for projects. You have total autonomy to pause work during exams.
                </p>
              </CardHeader>

              <CardBody className="p-6 space-y-6">
                {/* Dual Roles */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Campus Collaboration Roles
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 rounded-lg border border-card-border bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityForm.is_freelancer_enabled}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            is_freelancer_enabled: e.target.checked,
                          }))
                        }
                        className="mt-1 rounded text-brand-indigo"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          Freelancer Mode Enabled
                        </span>
                        <span className="text-xs text-slate-500">
                          Your profile is eligible to receive project invitations and submit project proposals.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 rounded-lg border border-card-border bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availabilityForm.is_seeker_enabled}
                        onChange={(e) =>
                          setAvailabilityForm((prev) => ({
                            ...prev,
                            is_seeker_enabled: e.target.checked,
                          }))
                        }
                        className="mt-1 rounded text-brand-indigo"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          Project Seeker Mode Enabled
                        </span>
                        <span className="text-xs text-slate-500">
                          You can post project requirements and hire peer talent across campus.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="pt-2 border-t border-card-border">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Availability Status
                  </label>
                  <select
                    value={availabilityForm.availability_status}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        availability_status: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                  >
                    <option value="available">Available (Open for new campus collaborations)</option>
                    <option value="limited">Limited Availability (Part-time or small scope only)</option>
                    <option value="busy">Busy (In Midterms / Exam Prep)</option>
                    <option value="unavailable">Unavailable (Not currently accepting work)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Availability Note (Optional Context)"
                    placeholder="e.g. Available on weekends / 10 hrs per week max"
                    value={availabilityForm.availability_note}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        availability_note: e.target.value,
                      }))
                    }
                  />

                  <Input
                    label="Available From Date"
                    type="date"
                    value={availabilityForm.available_from}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        available_from: e.target.value,
                      }))
                    }
                    helperText="When will you next be free for project commitments?"
                  />
                </div>
              </CardBody>

              <CardFooter className="bg-slate-50/70 p-4 sm:p-6 flex justify-end">
                <Button type="submit" variant="primary" loading={saving} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Availability & Roles</span>
                </Button>
              </CardFooter>
            </Card>
          </form>
        )}
      </PageContainer>
    </div>
  );
}
