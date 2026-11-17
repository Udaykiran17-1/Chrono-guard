import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, School, BookOpen, Calendar, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button, Input, Select, Card, CardBody, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getUniversities, getDepartments } from '../../services/authService';

const ACADEMIC_YEARS = [
  { value: '1st Year', label: '1st Year (Freshman)' },
  { value: '2nd Year', label: '2nd Year (Sophomore)' },
  { value: '3rd Year', label: '3rd Year (Junior)' },
  { value: '4th Year', label: '4th Year (Senior)' },
  { value: '5th Year', label: '5th Year (Dual/Arch)' },
  { value: 'Postgraduate', label: 'Postgraduate (Masters/PhD)' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isConfigured } = useAuth();

  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUniv, setSelectedUniv] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityId: '',
    departmentId: '',
    course: '',
    academicYear: '1st Year',
    avatarUrl: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Fetch universities on load
  useEffect(() => {
    async function loadData() {
      const univs = await getUniversities();
      setUniversities(univs);
      if (univs.length > 0) {
        setFormData((prev) => ({ ...prev, universityId: univs[0].id }));
        setSelectedUniv(univs[0]);
        const depts = await getDepartments(univs[0].id);
        setDepartments(depts);
        if (depts.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: depts[0].id }));
        }
      }
    }
    loadData();
  }, []);

  // When university changes, load its departments
  const handleUniversityChange = async (e) => {
    const univId = e.target.value;
    const univ = universities.find((u) => u.id === univId);
    setSelectedUniv(univ || null);
    setFormData((prev) => ({ ...prev, universityId: univId, departmentId: '' }));

    const depts = await getDepartments(univId);
    setDepartments(depts);
    if (depts.length > 0) {
      setFormData((prev) => ({ ...prev, departmentId: depts[0].id }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name (at least 2 characters).';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'University email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (selectedUniv?.email_domain) {
      const domain = selectedUniv.email_domain.toLowerCase();
      if (!formData.email.toLowerCase().endsWith(`@${domain}`)) {
        newErrors.email = `Registration at ${selectedUniv.short_name || selectedUniv.name} requires an official @${domain} email.`;
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.universityId) {
      newErrors.universityId = 'Please select your university.';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select your department.';
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Please enter your degree / program (e.g. B.Tech CS, B.Des).';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const avatar =
        formData.avatarUrl.trim() ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName)}`;

      const res = await register({
        ...formData,
        avatarUrl: avatar,
      });

      if (res.requiresEmailVerification) {
        navigate('/verify-email', { state: { email: formData.email } });
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-canvas py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-brand-indigo mb-2">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect width="28" height="28" rx="6" fill="#3730A3" />
              <path d="M8 20V12L14 8L20 12V20L14 16L8 20Z" fill="white" fillOpacity="0.9" />
              <path d="M14 16L20 20V12L14 16Z" fill="white" fillOpacity="0.6" />
            </svg>
            <span>SkillBridge</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your campus account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Join the student talent network to showcase your skills or discover talented peers.
          </p>

          {!isConfigured && (
            <div className="mt-3 inline-block">
              <Badge variant="amber" icon={AlertCircle}>
                Local Sandbox Mode (Pre-configured Supabase fallbacks active)
              </Badge>
            </div>
          )}
        </div>

        {/* Card */}
        <Card className="shadow-lg">
          <CardBody className="p-6 sm:p-8">
            {generalError && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold">Unable to register</p>
                  <p>{generalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Information */}
              <div className="border-b border-card-border pb-4">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  1. Personal & Contact Information
                </h2>
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    name="fullName"
                    placeholder="e.g. Priya Sharma or Alex Chen"
                    value={formData.fullName}
                    onChange={handleChange}
                    error={errors.fullName}
                    required
                  />

                  <div>
                    <Input
                      label="University Email"
                      name="email"
                      type="email"
                      placeholder="you@campus.edu or yourname@gmail.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      helperText={
                        selectedUniv?.email_domain
                          ? `Restricted to official @${selectedUniv.email_domain} addresses.`
                          : 'Any valid email accepted during testing.'
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      name="password"
                      type="password"
                      placeholder="At least 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      required
                    />
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Academic Affiliation */}
              <div className="border-b border-card-border pb-4">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  2. Academic Affiliation
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      University / Institution <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="universityId"
                      value={formData.universityId}
                      onChange={handleUniversityChange}
                      className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                    >
                      {universities.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.short_name ? `(${u.short_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Department / School <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-card-border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-indigo"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Degree / Course"
                      name="course"
                      placeholder="e.g. B.Tech CSE, B.Des, MBA"
                      value={formData.course}
                      onChange={handleChange}
                      error={errors.course}
                      required
                    />
                    <Select
                      label="Current Academic Year"
                      name="academicYear"
                      options={ACADEMIC_YEARS}
                      value={formData.academicYear}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Optional Profile Photo */}
              <div className="border-b border-card-border pb-4">
                <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3">
                  3. Profile Photo (Optional)
                </h2>
                <Input
                  label="Avatar Image URL (or leave blank for auto-generated avatar)"
                  name="avatarUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatarUrl}
                  onChange={handleChange}
                  helperText="Leave empty to automatically use your initials."
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-indigo focus:ring-brand-indigo"
                  />
                  <span className="text-xs text-slate-600 leading-normal">
                    I agree to SkillBridge's{' '}
                    <Link to="/terms" className="text-brand-cobalt hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-brand-cobalt hover:underline">
                      Privacy Policy
                    </Link>
                    , and I confirm that I am a current student or representative of an approved campus organisation.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.agreeTerms}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full flex items-center justify-center gap-2"
              >
                <span>Create SkillBridge Account</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 border-t border-card-border pt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-cobalt hover:underline">
                Sign in here
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
