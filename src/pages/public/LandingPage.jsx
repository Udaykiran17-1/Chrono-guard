import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  CheckCircle,
  Briefcase,
  Users,
  Shield,
  Star,
  Award,
  Clock,
  Sparkles,
  ChevronDown,
  Building,
  FileCheck,
  Zap,
  TrendingUp,
  HelpCircle,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Button, Card, CardHeader, CardBody, CardFooter, Badge } from '../../components/ui';
import PageContainer from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';

// Sample preview student talent (aligned with PRODUCT_SPEC Section 4 & 5)
const FEATURED_STUDENTS = [
  {
    name: 'Aarav Patel',
    department: 'Computer Science',
    year: '3rd Year',
    headline: 'Full-Stack Developer & React Specialist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Tailwind'],
    availability: 'Available',
    availabilityVariant: 'teal',
    rating: 'Top Contributor',
  },
  {
    name: 'Diya Sengupta',
    department: 'Design & Media Arts',
    year: '4th Year',
    headline: 'UI/UX Designer & Brand Strategist',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
    skills: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    availability: 'Limited Availability',
    availabilityVariant: 'amber',
    rating: 'Verified Portfolio',
  },
  {
    name: 'Rohan Verma',
    department: 'Media & Communications',
    year: '2nd Year',
    headline: 'Motion Graphics Artist & Video Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    skills: ['After Effects', 'Premiere Pro', 'Motion Design', 'Color Grading'],
    availability: 'Available',
    availabilityVariant: 'teal',
    rating: 'Campus Fest Lead',
  },
];

// Sample preview projects (aligned with PRODUCT_SPEC Section 6 & 7)
const FEATURED_PROJECTS = [
  {
    title: 'ACM Student Chapter Annual Website Revamp',
    org: 'ACM Student Chapter',
    category: 'Web Development',
    budget: '₹8,000 (Fixed Budget)',
    deadline: 'In 3 weeks',
    skills: ['React', 'Tailwind CSS', 'Vite'],
    type: 'Student Club Project',
  },
  {
    title: 'Brand Identity & Social Media Kit for TEDxYouth',
    org: 'TEDx Campus Committee',
    category: 'Design & Media',
    budget: '₹5,000 (Negotiable)',
    deadline: 'In 10 days',
    skills: ['Graphic Design', 'Figma', 'Brand Identity'],
    type: 'Campus Event',
  },
  {
    title: 'Robotics Team Telemetry Dashboard & Data Viz',
    org: 'Robotics Club',
    category: 'Software Engineering',
    budget: '₹12,000 (Milestone-based)',
    deadline: 'In 1 month',
    skills: ['Python', 'WebSockets', 'Chart.js'],
    type: 'Technical Competition',
  },
];

// How it works steps
const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'Create Your Verified Campus Profile',
    description:
      'Register with your university email. Highlight your verified technical, creative, or management skills, previous projects, and current availability status.',
    icon: GraduationCap,
  },
  {
    number: '02',
    title: 'Discover Talent or Post Opportunities',
    description:
      'Search student portfolios with granular filters, or post structured project requirements specifying deliverables, budget, and deadlines.',
    icon: Search,
  },
  {
    number: '03',
    title: 'Collaborate with Clear Agreements',
    description:
      'Establish clear deliverables, revision limits, and compensation terms upfront before starting. Track progress via milestones.',
    icon: FileCheck,
  },
  {
    number: '04',
    title: 'Build Verified Reputation',
    description:
      'Complete collaborations, receive structured feedback on communication and quality, and build a campus-verified track record that opens future career doors.',
    icon: Award,
  },
];

// Benefits for Freelancers
const FREELANCER_BENEFITS = [
  'Gain real-world experience on active campus projects',
  'Get paid fairly with clear milestone agreements',
  'Showcase a verified portfolio that employers trust',
  'Total control over your availability — pause during exams',
  'Retain your dual capability: hire someone when you need skills',
];

// Benefits for Clubs & Student Organisations
const CLUB_BENEFITS = [
  'Find dependable student talent without endless WhatsApp spam',
  'Preserve past freelancer contacts and costs across committee handovers',
  'Structured agreements eliminate scope creep and unmet deadlines',
  'Directly search by specific skills, tools, and portfolios',
  'Retain historical project knowledge when seniors graduate',
];

// FAQs
const FAQ_ITEMS = [
  {
    q: 'Who can join SkillBridge?',
    a: 'SkillBridge is currently open to active university students and officially recognized student organizations. Every user registers with their university email to maintain a trusted, safe campus environment.',
  },
  {
    q: 'Can I be both a freelancer and a project seeker on the same account?',
    a: 'Yes, absolutely! Unlike legacy freelancer platforms that force separate accounts, SkillBridge enables both seeker and freelancer capabilities on every student account. You can offer web development skills on one project, while hiring a video editor for your club’s documentary on another.',
  },
  {
    q: 'How does SkillBridge prevent misunderstandings during projects?',
    a: 'Before any work begins, both parties confirm a structured Project Agreement outlining explicit deliverables, milestones, deadlines, revision limits, and compensation. This versioned agreement ensures everyone is aligned.',
  },
  {
    q: 'Is it free to use for students and student clubs?',
    a: 'Yes. SkillBridge is free for students and campus student organizations. Payment arrangements between project creators and student freelancers are transparently agreed upon directly within the project milestones.',
  },
  {
    q: 'How does SkillBridge solve club handover issues across committee transitions?',
    a: 'Student organizations have a dedicated Organization profile that retains all past freelancer directories, collaboration notes, and project cost history. When committee members graduate, outgoing leads transfer administrative ownership to the incoming team without losing valuable contacts.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <div className="bg-canvas text-slate-800">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
          Exact heading: "Your Skills Deserve the Right Opportunity."
          Exact supporting text: "Discover talented students, showcase your capabilities and collaborate on meaningful projects within your campus community."
          Primary button: "Explore Talent"
          Secondary button: "Join SkillBridge"
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-card-border pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Subtle background ambient mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#3730a3_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Campus Tag Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3.5 py-1 text-xs font-semibold text-brand-indigo mb-6 animate-in fade-in">
            <Sparkles className="h-3.5 w-3.5 text-brand-indigo" />
            <span>Campus Student Talent & Collaboration Platform</span>
          </div>

          {/* Exact Required Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-[1.15]">
            Your Skills Deserve the Right Opportunity.
          </h1>

          {/* Exact Required Supporting Text */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover talented students, showcase your capabilities and collaborate on meaningful projects within your campus community.
          </p>

          {/* Hero Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/explore'} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <span>Explore Talent</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold border-slate-300 hover:border-slate-400"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Join SkillBridge'}
              </Button>
            </Link>
          </div>

          {/* Trust points */}
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-brand-teal" />
              <span>Verified University Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-brand-teal" />
              <span>Milestone-Based Project Agreements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-brand-teal" />
              <span>Zero WhatsApp Group Chaos</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HOW SKILLBRIDGE WORKS SECTION
         ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-canvas border-b border-card-border">
        <PageContainer>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="indigo" className="mb-3">
              Simple & Transparent
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              How SkillBridge Works
            </h2>
            <p className="mt-3 text-base text-slate-600">
              A structured workflow designed specifically for campus collaboration, safeguarding both student freelancers and project seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} hover className="relative h-full flex flex-col">
                  <CardBody className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-brand-indigo/25 tracking-tighter">
                        {step.number}
                      </span>
                      <div className="rounded-lg bg-indigo-50 p-2.5 text-brand-indigo">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed flex-1">
                      {step.description}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. DISCOVER STUDENT TALENT PREVIEW SECTION
         ───────────────────────────────────────────────────────────── */}
      <section id="talent" className="py-20 bg-white border-b border-card-border">
        <PageContainer>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="teal" icon={Users} className="mb-3">
                Campus Talent Directory
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Discover Talented Students
              </h2>
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Browse student profiles showcasing verified capabilities, experience levels, and live availability.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/register">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <span>View All Student Profiles</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_STUDENTS.map((student) => (
              <Card key={student.name} hover className="flex flex-col h-full">
                <CardBody className="p-6 flex-1 flex flex-col">
                  {/* Top info */}
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="h-14 w-14 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{student.name}</h3>
                      <p className="text-xs text-slate-500">
                        {student.department} • {student.year}
                      </p>
                      <Badge variant={student.availabilityVariant} className="mt-1.5">
                        {student.availability}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-slate-800 mb-4 line-clamp-2">
                    {student.headline}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-card-border">
                    {student.skills.map((skill) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
                <CardFooter className="bg-slate-50/70 py-3 px-6 flex items-center justify-between">
                  <span className="text-xs font-medium text-brand-indigo flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {student.rating}
                  </span>
                  <Link to="/register">
                    <Button variant="ghost" size="sm" className="text-xs font-semibold">
                      View Profile →
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FIND EXCITING PROJECTS PREVIEW SECTION
         ───────────────────────────────────────────────────────────── */}
      <section id="projects" className="py-20 bg-canvas border-b border-card-border">
        <PageContainer>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <Badge variant="indigo" icon={Briefcase} className="mb-3">
                Active Campus Opportunities
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Find Exciting Projects
              </h2>
              <p className="mt-2 text-base text-slate-600 max-w-2xl">
                Collaborate with student organizations, academic labs, and fellow creators on projects that match your skills.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/register">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <span>Browse All Opportunities</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_PROJECTS.map((proj) => (
              <Card key={proj.title} hover className="flex flex-col h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      {proj.org}
                    </span>
                    <Badge variant="indigo">{proj.type}</Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {proj.title}
                  </h3>
                </CardHeader>
                <CardBody className="py-2 flex-1">
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Compensation:</span>
                      <span className="font-semibold text-slate-900">{proj.budget}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="font-medium text-slate-700 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {proj.deadline}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.skills.map((skill) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardBody>
                <CardFooter className="py-3 px-6 bg-slate-50/70">
                  <Link to="/register" className="w-full">
                    <Button variant="outline" size="sm" className="w-full">
                      Apply for Project
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </PageContainer>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. BENEFITS FOR FREELANCERS & BENEFITS FOR CLUBS
         ───────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-card-border">
        <PageContainer>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Engineered for Both Sides of Campus Life
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Whether you are offering technical or creative skills, or running a student club that needs high-quality deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Benefits for Freelancers Card */}
            <Card className="border-t-4 border-t-brand-indigo h-full shadow-sm">
              <CardHeader className="bg-indigo-50/40">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-indigo p-2 text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Benefits for Student Freelancers
                    </h3>
                    <p className="text-xs text-slate-500">
                      Build your portfolio while earning on your own terms.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <ul className="space-y-3">
                  {FREELANCER_BENEFITS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-5 w-5 text-brand-teal flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="bg-slate-50/60 p-6">
                <Link to="/register" className="w-full">
                  <Button variant="primary" className="w-full">
                    Start Freelancing on Campus
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Benefits for Clubs Card */}
            <Card className="border-t-4 border-t-brand-cobalt h-full shadow-sm">
              <CardHeader className="bg-blue-50/40">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-brand-cobalt p-2 text-white">
                    <Building className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Benefits for Clubs & Student Orgs
                    </h3>
                    <p className="text-xs text-slate-500">
                      Eliminate committee friction and preserve freelancer directories.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-6 space-y-4">
                <ul className="space-y-3">
                  {CLUB_BENEFITS.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                      <CheckCircle className="h-5 w-5 text-brand-cobalt flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="bg-slate-50/60 p-6">
                <Link to="/register" className="w-full">
                  <Button variant="secondary" className="w-full">
                    Register Your Student Organisation
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </PageContainer>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FREQUENTLY ASKED QUESTIONS (INTERACTIVE ACCORDION)
         ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-canvas border-b border-card-border">
        <PageContainer>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="neutral" icon={HelpCircle} className="mb-3">
              Got Questions?
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Clear answers on how SkillBridge operates, our campus-verified policy, and collaboration guidelines.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-card border border-card-border bg-white transition-shadow duration-150 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 hover:text-brand-indigo focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base pr-4">{item.q}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-indigo' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-150">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PageContainer>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. BOTTOM CALL TO ACTION
         ───────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-brand-indigo to-brand-indigo-dark text-white text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to Connect with Your Campus Talent?
          </h2>
          <p className="mt-4 text-indigo-100 text-base sm:text-lg max-w-2xl mx-auto">
            Join students and campus organisations already building great projects together.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <Button
                size="lg"
                className="bg-white text-brand-indigo hover:bg-slate-100 font-semibold px-8"
              >
                {isAuthenticated ? 'Go to Your Dashboard' : 'Create Free Account'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
