import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  FolderGit2,
  HelpCircle,
  Star,
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardBody, CardFooter, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import {
  updateProfile,
  getAvailableSkills,
  requestUnlistedSkill,
  addUserSkill,
  createPortfolioItem,
} from '../../services/profileService';

const POPULAR_INTERESTS = [
  'Web Development',
  'UI/UX Design',
  'Machine Learning & AI',
  'Mobile Apps',
  'Graphic Design',
  'Video Editing',
  'Digital Marketing',
  'Robotics',
  'Content Writing',
  'Event Management',
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Preferences & Headline
  const [preferences, setPreferences] = useState({
    is_freelancer_enabled: true,
    is_seeker_enabled: true,
    headline: profile?.headline || '',
    areas_of_interest: profile?.areas_of_interest || [],
  });

  // Step 2: Skills
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [newSkillId, setNewSkillId] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [newSkillIsPrimary, setNewSkillIsPrimary] = useState(false);
  const [showUnlistedModal, setShowUnlistedModal] = useState(false);
  const [unlistedName, setUnlistedName] = useState('');
  const [unlistedCategory, setUnlistedCategory] = useState('Technical');

  // Step 3: First Portfolio Item (Optional)
  const [portfolioData, setPortfolioData] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    project_url: '',
    github_url: '',
  });

  useEffect(() => {
    async function loadSkills() {
      const skills = await getAvailableSkills();
      setAvailableSkills(skills);
      if (skills.length > 0) {
        setNewSkillId(skills[0].id);
      }
    }
    loadSkills();
  }, []);

  const toggleInterest = (interest) => {
    setPreferences((prev) => {
      const exists = prev.areas_of_interest.includes(interest);
      return {
        ...prev,
        areas_of_interest: exists
          ? prev.areas_of_interest.filter((i) => i !== interest)
          : [...prev.areas_of_interest, interest],
      };
    });
  };

  const handleAddSkill = () => {
    if (!newSkillId) return;
    if (selectedSkills.some((s) => s.skill_id === newSkillId)) {
      setError('Skill is already added to your list.');
      return;
    }
    const skillObj = availableSkills.find((s) => s.id === newSkillId);
    if (!skillObj) return;

    setSelectedSkills((prev) => [
      ...prev,
      {
        skill_id: newSkillId,
        skill: skillObj,
        proficiency: newSkillProficiency,
        is_primary: newSkillIsPrimary,
      },
    ]);
    setError('');
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
  };

  const handleRequestUnlisted = async (e) => {
    e.preventDefault();
    if (!unlistedName.trim()) return;
    try {
      const newSkill = await requestUnlistedSkill(unlistedName, unlistedCategory);
      setAvailableSkills((prev) => [...prev, newSkill]);
      setNewSkillId(newSkill.id);
      setShowUnlistedModal(false);
      setUnlistedName('');
      // Auto-add to selected
      setSelectedSkills((prev) => [
        ...prev,
        {
          skill_id: newSkill.id,
          skill: newSkill,
          proficiency: 'intermediate',
          is_primary: false,
        },
      ]);
    } catch (err) {
      setError(err.message || 'Could not request unlisted skill');
    }
  };

  const handleComplete = async (skipPortfolio = false) => {
    if (!user?.id) return;
    setSubmitting(true);
    setError('');

    try {
      // 1. Update basic profile preferences & headline
      await updateProfile(user.id, {
        is_freelancer_enabled: preferences.is_freelancer_enabled,
        is_seeker_enabled: preferences.is_seeker_enabled,
        headline: preferences.headline.trim() || 'SkillBridge Campus Collaborator',
        areas_of_interest: preferences.areas_of_interest,
        onboarding_completed: true,
      });

      // 2. Insert selected skills
      for (const s of selectedSkills) {
        await addUserSkill(user.id, {
          skill_id: s.skill_id,
          proficiency: s.proficiency,
          is_primary: s.is_primary,
        });
      }

      // 3. Insert portfolio project if provided
      if (!skipPortfolio && portfolioData.title.trim()) {
        await createPortfolioItem(user.id, {
          title: portfolioData.title.trim(),
          category: portfolioData.category,
          description: portfolioData.description.trim(),
          project_url: portfolioData.project_url.trim(),
          github_url: portfolioData.github_url.trim(),
          completed_date: new Date().toISOString().split('T')[0],
          skill_ids: selectedSkills.map((s) => s.skill_id),
        });
      }

      await refreshProfile(user.id);
      navigate('/profile/me');
    } catch (err) {
      setError(err.message || 'Failed to finalize profile setup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipAll = async () => {
    if (!user?.id) return;
    setSubmitting(true);
    try {
      await updateProfile(user.id, { onboarding_completed: true });
      await refreshProfile(user.id);
      navigate('/profile/me');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-canvas py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header & Steps tracker */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-xs font-semibold text-brand-indigo mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Profile Setup Wizard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome to SkillBridge, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Let's configure your profile so peers and campus clubs know what you can collaborate on.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-3 mt-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    currentStep === step
                      ? 'bg-brand-indigo text-white shadow-sm'
                      : currentStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                  {step === 1 ? 'Roles & Headline' : step === 2 ? 'Skills' : 'Portfolio'}
                </span>
                {step < 3 && <div className="h-0.5 w-6 sm:w-10 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-slate-50/60 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Step {currentStep} of 3:{' '}
              {currentStep === 1
                ? 'Preferences & Headline'
                : currentStep === 2
                ? 'Select Core Skills'
                : 'Featured Portfolio Work'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipAll}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Skip setup
            </Button>
          </CardHeader>

          <CardBody className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* ───── STEP 1: ROLES & HEADLINE ───── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">
                    What would you like to use SkillBridge for?
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Both capabilities are active by default. You can hire peers for a project while also offering your skills for others.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          is_freelancer_enabled: !prev.is_freelancer_enabled,
                        }))
                      }
                      className={`p-4 rounded-card border cursor-pointer transition-all ${
                        preferences.is_freelancer_enabled
                          ? 'border-brand-indigo bg-indigo-50/40 shadow-sm'
                          : 'border-card-border bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Users className="h-5 w-5 text-brand-indigo" />
                        <input
                          type="checkbox"
                          checked={preferences.is_freelancer_enabled}
                          onChange={() => {}}
                          className="h-4 w-4 rounded text-brand-indigo"
                        />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Offer My Skills</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Showcase my portfolio and receive campus freelance & project invitations.
                      </p>
                    </div>

                    <div
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          is_seeker_enabled: !prev.is_seeker_enabled,
                        }))
                      }
                      className={`p-4 rounded-card border cursor-pointer transition-all ${
                        preferences.is_seeker_enabled
                          ? 'border-brand-indigo bg-indigo-50/40 shadow-sm'
                          : 'border-card-border bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Briefcase className="h-5 w-5 text-brand-cobalt" />
                        <input
                          type="checkbox"
                          checked={preferences.is_seeker_enabled}
                          onChange={() => {}}
                          className="h-4 w-4 rounded text-brand-indigo"
                        />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Find & Hire Talent</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Post project requirements and discover skilled peers for club or personal projects.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-card-border">
                  <Input
                    label="Professional Headline"
                    placeholder="e.g. Full-Stack Developer & Robotics Enthusiast"
                    value={preferences.headline}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, headline: e.target.value }))
                    }
                    helperText="This 1-line summary appears prominently on your profile card and search results."
                  />
                </div>

                <div className="pt-2 border-t border-card-border">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Areas of Interest (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_INTERESTS.map((interest) => {
                      const selected = preferences.areas_of_interest.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                            selected
                              ? 'bg-brand-indigo text-white border-brand-indigo'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ───── STEP 2: SKILLS & PROFICIENCY ───── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">
                    Select Your Core Skills
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    List skills you're confident applying. SkillBridge clearly notes self-reported levels to maintain transparency.
                  </p>

                  {/* Add skill row */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-4 rounded-lg bg-slate-50 border border-card-border">
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Skill</label>
                      <select
                        value={newSkillId}
                        onChange={(e) => setNewSkillId(e.target.value)}
                        className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                      >
                        {availableSkills.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Proficiency
                      </label>
                      <select
                        value={newSkillProficiency}
                        onChange={(e) => setNewSkillProficiency(e.target.value)}
                        className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAddSkill}
                        className="w-full text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                  </div>

                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setShowUnlistedModal(true)}
                      className="text-xs text-brand-cobalt hover:underline font-medium"
                    >
                      + Can't find your skill? Request an unlisted skill
                    </button>
                  </div>
                </div>

                {/* Selected skills list */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Added Skills ({selectedSkills.length})
                  </h3>
                  {selectedSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-3 text-center border border-dashed rounded-lg">
                      No skills added yet. Add at least 1-2 skills so peers can find you.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedSkills.map((s) => (
                        <div
                          key={s.skill_id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-card-border"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {s.skill?.name}
                            </span>
                            <Badge variant="indigo" className="text-[10px]">
                              {s.proficiency}
                            </Badge>
                            {s.is_primary && (
                              <Badge variant="amber" icon={Star} className="text-[10px]">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(s.skill_id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Remove skill"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Request unlisted skill mini-modal */}
                {showUnlistedModal && (
                  <div className="rounded-lg bg-indigo-50/70 border border-indigo-200 p-4 animate-in fade-in">
                    <h4 className="text-xs font-bold text-slate-900 mb-2">
                      Propose an Unlisted Skill
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <Input
                        placeholder="e.g. Solidity, 3D Maya, Blender"
                        value={unlistedName}
                        onChange={(e) => setUnlistedName(e.target.value)}
                        className="text-xs py-1.5"
                      />
                      <select
                        value={unlistedCategory}
                        onChange={(e) => setUnlistedCategory(e.target.value)}
                        className="w-full rounded-lg border border-card-border bg-white px-3 py-1.5 text-xs text-slate-900"
                      >
                        <option value="Technical">Technical</option>
                        <option value="Creative">Creative</option>
                        <option value="Management & Other">Management & Other</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowUnlistedModal(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleRequestUnlisted} className="text-xs">
                        Add to My List
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ───── STEP 3: OPTIONAL FIRST PORTFOLIO WORK ───── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-1">
                    Showcase a Previous Project (Optional)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Students with at least one portfolio entry receive 4x more collaboration requests. You can skip this and add entries later.
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Project Title"
                    placeholder="e.g. Campus Event Landing Page, Rover Simulation"
                    value={portfolioData.title}
                    onChange={(e) =>
                      setPortfolioData((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={portfolioData.category}
                        onChange={(e) =>
                          setPortfolioData((prev) => ({ ...prev, category: e.target.value }))
                        }
                        className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900"
                      >
                        <option value="Web Development">Web Development</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Machine Learning">Machine Learning</option>
                        <option value="Hardware / Robotics">Hardware / Robotics</option>
                        <option value="Media & Video">Media & Video</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <Input
                      label="Live Project Link"
                      placeholder="https://..."
                      value={portfolioData.project_url}
                      onChange={(e) =>
                        setPortfolioData((prev) => ({ ...prev, project_url: e.target.value }))
                      }
                    />
                  </div>

                  <Input
                    label="GitHub / Code Repository URL"
                    placeholder="https://github.com/your-username/project"
                    value={portfolioData.github_url}
                    onChange={(e) =>
                      setPortfolioData((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Short Description of Your Role & Deliverables
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What was the project? What problems did you solve, and what technologies did you leverage?"
                      value={portfolioData.description}
                      onChange={(e) =>
                        setPortfolioData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full rounded-lg border border-card-border bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardBody>

          {/* Footer Controls */}
          <CardFooter className="bg-slate-50/70 flex items-center justify-between p-4 sm:p-6">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipAll}
                className="text-xs text-slate-500"
              >
                Skip Onboarding
              </Button>
            )}

            {currentStep < 3 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-1.5 ml-auto"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleComplete(true)}
                  disabled={submitting}
                >
                  Skip Project & Finish
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={submitting}
                  onClick={() => handleComplete(false)}
                >
                  Complete Setup
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
