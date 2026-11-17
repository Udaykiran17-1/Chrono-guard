import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  School,
  BookOpen,
  Calendar,
  Clock,
  Sparkles,
  Users,
  ChevronDown,
  Layers,
  ArrowRight,
  Shield,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardBody, CardFooter, Badge, Spinner } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';
import { searchTalent, toggleSaveFreelancer, getSavedFreelancerIds } from '../../services/talentService';
import { getAvailableSkills } from '../../services/profileService';
import { getDepartments } from '../../services/authService';

const ACADEMIC_YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
  'Postgraduate',
];

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available Now' },
  { value: 'limited', label: 'Limited Availability' },
  { value: 'busy', label: 'Busy / Exam Prep' },
  { value: 'unavailable', label: 'Unavailable' },
];

export default function TalentDirectoryPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);

  // Filter States
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState('');
  const [sortBy, setSortBy] = useState('recently_active');

  // Mobile filter toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const [skills, depts] = await Promise.all([
          getAvailableSkills(),
          getDepartments('a0000000-0000-0000-0000-000000000001'),
        ]);
        setSkillsList(skills || []);
        setDepartmentsList(depts || []);

        if (user?.id) {
          const saved = await getSavedFreelancerIds(user.id);
          setSavedIds(saved);
        }
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    }
    init();
  }, [user]);

  // Query talent on filter changes
  useEffect(() => {
    let active = true;
    async function fetchTalent() {
      setLoading(true);
      try {
        const res = await searchTalent({
          query,
          skillCategory: selectedCategory,
          skillIds: selectedSkillIds,
          departmentId: selectedDepartment,
          academicYear: selectedYear,
          availability: selectedAvailability,
          proficiency: selectedProficiency,
          sortBy,
        });
        if (active) setStudents(res);
      } catch (err) {
        console.error('Talent search error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    const timer = setTimeout(fetchTalent, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    query,
    selectedCategory,
    selectedSkillIds,
    selectedDepartment,
    selectedYear,
    selectedAvailability,
    selectedProficiency,
    sortBy,
  ]);

  const handleToggleSave = async (freelancerId) => {
    if (!user?.id) return;
    const isSaved = savedIds.includes(freelancerId);
    setSavedIds((prev) =>
      isSaved ? prev.filter((id) => id !== freelancerId) : [...prev, freelancerId]
    );
    try {
      await toggleSaveFreelancer(user.id, freelancerId);
    } catch (err) {
      console.error('Failed to toggle save:', err);
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
    setSelectedSkillIds([]);
    setSelectedDepartment('');
    setSelectedYear('');
    setSelectedAvailability('');
    setSelectedProficiency('');
    setSortBy('recently_active');
  };

  const hasActiveFilters =
    Boolean(query) ||
    Boolean(selectedCategory) ||
    selectedSkillIds.length > 0 ||
    Boolean(selectedDepartment) ||
    Boolean(selectedYear) ||
    Boolean(selectedAvailability) ||
    Boolean(selectedProficiency);

  const filteredSkills = useMemo(() => {
    if (!selectedCategory) return skillsList;
    return skillsList.filter((s) => s.category === selectedCategory);
  }, [skillsList, selectedCategory]);

  return (
    <div className="bg-canvas min-h-screen py-8">
      <PageContainer>
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-card-border pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-0.5 text-xs font-semibold text-brand-indigo mb-2">
              <Users className="h-3.5 w-3.5" />
              <span>Campus Talent Directory</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Student Talent
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Discover verified student freelancers, portfolio creators, and collaborators across university departments.
            </p>
          </div>

          {/* Search Bar & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-card-border bg-white text-xs font-semibold text-slate-700 shadow-xs"
            >
              <Filter className="h-4 w-4" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, skills, major…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Asymmetric Layout: Left Sticky Filter, Right Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ───── LEFT FILTER PANEL (approx 30% = 3.5 cols) ───── */}
          <div
            className={`lg:col-span-4 space-y-6 ${
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
                {/* 1. Skill Category */}
                <div>
                  <label className="block font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                    Skill Category
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['', 'Technical', 'Creative', 'Management & Other'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1.5 rounded-md text-left text-xs font-medium border transition-colors ${
                          selectedCategory === cat
                            ? 'bg-brand-indigo text-white border-brand-indigo font-semibold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {cat || 'All Categories'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Specific Skills Multi-Select */}
                <div>
                  <label className="block font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                    Specific Skills ({selectedSkillIds.length} selected)
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1 p-2 rounded-lg border border-card-border bg-slate-50">
                    {filteredSkills.map((s) => {
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

                {/* 3. Department */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Department / School
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  >
                    <option value="">All Departments</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Academic Year */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Academic Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  >
                    <option value="">All Academic Years</option>
                    {ACADEMIC_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 5. Live Availability */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Availability Status
                  </label>
                  <select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  >
                    <option value="">Any Availability</option>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Self-Reported Experience Level */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5 uppercase tracking-wider text-[11px]">
                    Skill Proficiency Level
                  </label>
                  <select
                    value={selectedProficiency}
                    onChange={(e) => setSelectedProficiency(e.target.value)}
                    className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-indigo"
                  >
                    <option value="">Any Proficiency</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* ───── RIGHT RESULTS DIRECTORY (approx 70% = 8 cols) ───── */}
          <div className="lg:col-span-8 space-y-4">
            {/* Sort Toolbar */}
            <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-card-border text-xs">
              <span className="font-semibold text-slate-700">
                {students.length} student{students.length === 1 ? '' : 's'} available
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="recently_active">Recently Active</option>
                  <option value="recently_joined">Recently Joined</option>
                  <option value="relevant_skills">Relevant Skills</option>
                  <option value="availability">Availability</option>
                </select>
              </div>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="py-20 text-center">
                <Spinner size="lg" />
                <p className="mt-3 text-xs text-slate-500">Searching campus talent directory…</p>
              </div>
            ) : students.length === 0 ? (
              /* Empty state */
              <Card className="text-center p-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No students found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No registered campus profiles match your current combination of filters. Try broadening your criteria.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="mt-4">
                    Reset All Filters
                  </Button>
                )}
              </Card>
            ) : (
              /* Student Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {students.map((student) => {
                  const isSaved = savedIds.includes(student.id);
                  const isAvailable = student.availability_status === 'available';
                  const isLimited = student.availability_status === 'limited';

                  return (
                    <div
                      key={student.id}
                      className="rounded-card border border-card-border bg-white shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Bar with Avatar, Name, Bookmark */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <Link to={`/profile/${student.id}`} className="flex items-center gap-3 group">
                            <img
                              src={
                                student.avatar_url ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                  student.full_name
                                )}`
                              }
                              alt={student.full_name}
                              className="h-12 w-12 rounded-full border border-card-border object-cover bg-slate-50"
                            />
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-indigo transition-colors">
                                {student.full_name}
                              </h3>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {student.departments?.name || student.course || 'Student'} •{' '}
                                {student.academic_year || 'Undergraduate'}
                              </p>
                            </div>
                          </Link>

                          {/* Save Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleSave(student.id)}
                            className="text-slate-400 hover:text-brand-indigo p-1 transition-colors"
                            title={isSaved ? 'Remove from saved' : 'Save freelancer'}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-5 w-5 text-brand-indigo fill-indigo-50" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {/* Headline */}
                        <p className="text-xs font-medium text-slate-700 line-clamp-2 leading-relaxed mb-3">
                          {student.headline || 'SkillBridge Campus Collaborator'}
                        </p>

                        {/* Availability Pill */}
                        <div className="mb-3">
                          <Badge
                            variant={isAvailable ? 'teal' : isLimited ? 'amber' : 'neutral'}
                            className="text-[10px]"
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full mr-1 ${
                                isAvailable
                                  ? 'bg-teal-500'
                                  : isLimited
                                  ? 'bg-amber-500'
                                  : 'bg-slate-400'
                              }`}
                            />
                            {student.availability_status?.toUpperCase() || 'AVAILABLE'}
                          </Badge>
                        </div>

                        {/* Top Skill Pills */}
                        <div className="flex flex-wrap gap-1">
                          {(student.user_skills || []).slice(0, 4).map((us) => (
                            <span
                              key={us.id || us.skill_id}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
                            >
                              {us.skills?.name || 'Skill'}
                              {us.is_primary && ' ★'}
                            </span>
                          ))}
                          {(student.user_skills || []).length > 4 && (
                            <span className="text-[10px] text-slate-400 self-center">
                              +{(student.user_skills || []).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="bg-slate-50/70 py-3 px-5 border-t border-card-border flex items-center justify-between text-xs">
                        <span className="text-[10px] text-slate-400">
                          {student.universities?.short_name || 'Campus Peer'}
                        </span>

                        <Link to={`/profile/${student.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs font-semibold text-brand-indigo p-1">
                            <span>View Profile</span>
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
