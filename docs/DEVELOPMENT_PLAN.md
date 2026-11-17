# SkillBridge Development Plan

## Milestone 1: Foundation, Design System, Database & Auth

### Step 1A: Project Initialization ✅
- [x] React + Vite (JavaScript) project setup
- [x] Tailwind CSS v4 configuration
- [x] `react-router-dom`, `lucide-react`, `@supabase/supabase-js` installed
- [x] Inter font loaded
- [x] Design system tokens (colors, spacing, shadows)

### Step 1B: Reusable Components & Layout ✅
- [x] Button (primary, secondary, outline, ghost, danger + loading/disabled)
- [x] Input (label, helper text, validation error)
- [x] Select (label, helper text, validation error)
- [x] Card (Card, CardHeader, CardBody, CardFooter)
- [x] Badge (neutral, indigo, teal, amber, red + icon support)
- [x] Modal (Escape close, backdrop click, focus trap)
- [x] Spinner (sm/md/lg/xl)
- [x] EmptyState (icon, title, description, action)
- [x] Navbar (sticky 56px, logo, search, nav links, mobile drawer)
- [x] Footer (multi-column links)
- [x] PageContainer (max-width + padding)
- [x] Supabase client with safe env fallbacks
- [x] Documentation (README, DESIGN_SYSTEM, DEVELOPMENT_PLAN, CHANGELOG)

### Step 1C: PostgreSQL Foundation Schema & Security ✅
- [x] `supabase/migrations/001_foundation_schema.sql` with UUID PKs and strict RLS
- [x] Tables: `universities`, `departments`, `profiles`, `skills`, `user_skills`
- [x] PostgreSQL trigger `on_auth_user_created` for automated profile creation from user metadata
- [x] Self-escalation prevention trigger `trg_prevent_role_escalation` on `profiles.platform_role`
- [x] Strict Row Level Security policies for read/write isolation
- [x] `supabase/seed.sql` with default university, common departments, and categorized starter skills
- [x] Configurable campus email domain enforcement rules

### Step 1D: Landing Page & Authentication Flow ✅
- [x] Complete Landing Page (`src/pages/public/LandingPage.jsx`) on `/`:
  - [x] Hero with required copy: *"Your Skills Deserve the Right Opportunity."*
  - [x] 7 required sections: How It Works, Talent Preview, Project Preview, Freelancer Benefits, Club Benefits, FAQ Accordion, Footer
- [x] Authentication Service (`src/services/authService.js`) with live Supabase + resilient local sandbox fallback
- [x] Authentication Context (`src/context/AuthContext.jsx`) managing user, profile, loading, and session
- [x] Auth Pages:
  - [x] `/register`: Full name, university email, password, university selector, department selector, course, year, terms
  - [x] `/login`: University email, password, remember session, unverified email handling
  - [x] `/forgot-password`: Password reset request flow
  - [x] `/verify-email`: Campus verification instructions
- [x] Navbar updated with reactive auth state (user avatar, display name, role badge, Logout button)
- [x] Temporary `/dashboard` protected route displaying authenticated session & profile summary

---

## Milestone 2: Student Profiles & Talent Discovery (Upcoming)
- [ ] Profile viewing & editing flow
- [ ] Dual-capability toggles (Seeker vs Freelancer)
- [ ] Skills management with self-reported proficiency tags
- [ ] Portfolio upload & showcase
- [ ] Talent Discovery directory with multi-filter search (skills, department, year, availability)

---

## Milestone 3: Project Marketplace & Agreements (Upcoming)
- [ ] Project posting wizard (deliverables, deadline, compensation type)
- [ ] Project search & discovery page
- [ ] Application submission system
- [ ] Milestone-based Project Agreement system with mutual sign-off
- [ ] In-app status notifications

---

## Milestone 4: Club Management, Reviews & Handover (Upcoming)
- [ ] Organization profile & committee roles
- [ ] Historical freelancer contacts directory
- [ ] Committee handover workflow
- [ ] Post-collaboration review & reputation system
