import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Building,
  Users,
  ArrowRight,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge, Spinner } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { getProjects, toggleSaveProject, getSavedProjectIds } from '../../services/projectService';
import { getAvailableSkills } from '../../services/profileService';

const CATEGORIES = [
  'Web Development',
  'Software Engineering',
  'Creative & Design',
  'Media & Video',
  'Mobile Apps',
  'Machine Learning & AI',
  'Hardware & Robotics',
  'Event & Marketing',
  'Other',
];

const BUDGET_TYPES = [
  { value: 'fixed', label: 'Fixed Budget' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'unpaid', label: 'Unpaid Collaboration' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'other', label: 'Other Compensation' },
];

export default function ProjectDiscoveryPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);

  // Filters
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBudgetType, setSelectedBudgetType] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [sortBy, setSortBy] = useState('latest');

  // Mobile filters
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const skills = await getAvailableSkills();
        setAvailableSkills(skills || []);
        if (user?.id) {
          const sIds = await getSavedProjectIds(user.id);
          setSavedIds(sIds);
        }
      } catch (err) {
        console.error('Failed to init project discovery:', err);
      }
    }
    init();
  }, [user]);

  useEffect(() => {
    let active = true;
    async function fetchProjects() {
      setLoading(true);
      try {
        const res = await getProjects({
          query,
          category: selectedCategory,
          budgetType: selectedBudgetType,
          skillIds: selectedSkillIds,
          sortBy,
        });
        if (active) setProjects(res);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(fetchProjects, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, selectedCategory, selectedBudgetType, selectedSkillIds, sortBy]);

  const handleToggleSave = async (projectId) => {
    if (!user?.id) return;
    const isSaved = savedIds.includes(projectId);
    setSavedIds((prev) =>
      isSaved ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
    try {
      await toggleSaveProject(user.id, projectId);
    } catch (err) {
      console.error('Save project error:', err);
    }
  };

  const handleToggleSkill = (skillId) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const clearAllFilters = () => {
    setQuery('');
    setSelectedCategory('');
    setSelectedBudgetType('');
    setSelectedSkillIds([]);
    setSortBy('latest');
  };

  const hasActiveFilters =
    Boolean(query) ||
    Boolean(selectedCategory) ||
    Boolean(selectedBudgetType) ||
    selectedSkillIds.length > 0;

  return (
    <div className="min-h-screen bg-transparent py-5 sm:py-7">
      <PageContainer>
        {/* Header Banner */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-sm md:flex-row md:items-end sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-semibold text-brand-indigo mb-2">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Project marketplace</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Find projects
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Browse structured opportunities posted by student clubs, engineering teams, and campus creators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/projects/new">
              <Button size="sm" className="flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                <Plus className="h-4 w-4" />
                <span>Post a Project</span>
              </Button>
            </Link>

            <button
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-card-border bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* 2-Column Marketplace Layout */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* ───── LEFT FILTER PANEL (approx 30% = 3.5 cols) ───── */}
          <div
            className={`space-y-5 lg:col-span-3 ${
              mobileFilterOpen ? 'block' : 'hidden lg:block'
            } lg:sticky lg:top-20`}
          >
            <Card className="shadow-xs">
              <CardHeader className="pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-brand-indigo" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Filters
                  </h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-brand-cobalt hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </CardHeader>

              <CardBody className="p-4 space-y-5 text-xs">
                {/* Search */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Keyword Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Title, club, deliverable…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-lg border border-card-border bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Project Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compensation Type */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Compensation Type
                  </label>
                  <select
                    value={selectedBudgetType}
                    onChange={(e) => setSelectedBudgetType(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900"
                  >
                    <option value="">All Compensation Types</option>
                    {BUDGET_TYPES.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Required Skills Multi-Select */}
                <div>
                  <label className="block font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                    Required Skills ({selectedSkillIds.length})
                  </label>
                  <div className="max-h-44 overflow-y-auto space-y-1 p-2 rounded-lg border border-card-border bg-slate-50">
                    {availableSkills.map((s) => {
                      const checked = selectedSkillIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleSkill(s.id)}
                            className="rounded text-brand-indigo text-xs"
                          />
                          <span className="truncate text-slate-700">{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* ───── RIGHT PROJECT FEED (approx 70% = 8 cols) ───── */}
          <div className="space-y-4 lg:col-span-9">
            {/* Sort Toolbar */}
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-card-border text-xs">
              <span className="font-semibold text-slate-700">
                {projects.length} project{projects.length === 1 ? '' : 's'} open
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="latest">Latest Posted</option>
                  <option value="deadline">Upcoming Deadline</option>
                  <option value="budget_high">Highest Compensation</option>
                </select>
              </div>
            </div>

            {/* Results Feed */}
            {loading ? (
              <div className="py-20 text-center">
                <Spinner size="lg" />
                <p className="mt-3 text-xs text-slate-500">Searching campus opportunities…</p>
              </div>
            ) : projects.length === 0 ? (
              <Card className="text-center p-12">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No projects found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No open projects match your current filter combination. Try clearing filters or post the first opportunity!
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                    Reset All Filters
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => {
                  const isSaved = savedIds.includes(proj.id);
                  const isFull = proj.positions_filled >= proj.positions_total;

                  // Format budget string
                  let budgetDisplay = 'Compensation Disclosed';
                  if (proj.budget_type === 'fixed' && proj.budget_min) {
                    budgetDisplay = `₹${proj.budget_min.toLocaleString()} (Fixed)`;
                  } else if (proj.budget_type === 'negotiable') {
                    budgetDisplay = proj.budget_min
                      ? `₹${proj.budget_min.toLocaleString()} - ₹${(proj.budget_max || proj.budget_min).toLocaleString()} (Negotiable)`
                      : 'Negotiable Budget';
                  } else if (proj.budget_type === 'unpaid') {
                    budgetDisplay = 'Unpaid Collaboration';
                  } else if (proj.budget_type === 'volunteer') {
                    budgetDisplay = 'Volunteer Opportunity';
                  }

                  return (
                    <div
                      key={proj.id}
                      className="rounded-card border border-card-border bg-white shadow-card hover:shadow-card-hover transition-all p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta: Creator info + Bookmark */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={
                                proj.creator?.avatar_url ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  proj.creator?.full_name || 'Creator'
                                )}`
                              }
                              alt={proj.creator?.full_name}
                              className="h-8 w-8 rounded-full border border-card-border object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold text-slate-900 leading-tight">
                                {proj.creator?.full_name || 'Campus Member'}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {proj.creator?.headline || proj.creator?.departments?.name || 'Student Creator'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Badge variant={proj.status === 'open' ? 'teal' : 'amber'}>
                              {proj.status.toUpperCase()}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => handleToggleSave(proj.id)}
                              className="text-slate-400 hover:text-brand-indigo p-1"
                              title={isSaved ? 'Remove bookmark' : 'Bookmark project'}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="h-5 w-5 text-brand-indigo fill-indigo-50" />
                              ) : (
                                <Bookmark className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Title & Category */}
                        <div className="mb-2">
                          <Link to={`/projects/${proj.id}`} className="group">
                            <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-indigo transition-colors leading-snug">
                              {proj.title}
                            </h2>
                          </Link>
                          <span className="text-[11px] font-semibold text-brand-cobalt">
                            {proj.category}
                          </span>
                        </div>

                        {/* Summary */}
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                          {proj.what_needs_doing}
                        </p>

                        {/* Required Skill Pills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(proj.skills || []).map((s) => (
                            <Badge key={s.id} variant="neutral" className="text-[10px]">
                              {s.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Footer Row: Compensation, Deadline, Spots, CTA */}
                      <div className="pt-3 border-t border-card-border flex flex-wrap items-center justify-between gap-y-2 text-xs">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-brand-teal" />
                            {budgetDisplay}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Deadline: {proj.deadline}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {proj.positions_filled}/{proj.positions_total} filled
                          </span>
                        </div>

                        <Link to={`/projects/${proj.id}`}>
                          <Button size="sm" variant="outline" className="text-xs font-semibold py-1">
                            <span>View Project Details</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
