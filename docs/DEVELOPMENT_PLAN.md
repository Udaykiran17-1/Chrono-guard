# SkillBridge Development Plan

## Milestone 1: Foundation, Design System, Database & Auth ✅

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
- [x] Complete Landing Page (`src/pages/public/LandingPage.jsx`) on `/`
- [x] Authentication Service (`src/services/authService.js`) with live Supabase + resilient local sandbox fallback
- [x] Authentication Context (`src/context/AuthContext.jsx`) managing user, profile, loading, and session
- [x] Auth Pages: `/register`, `/login`, `/forgot-password`, `/verify-email`
- [x] Navbar updated with reactive auth state
- [x] Temporary `/dashboard` protected route displaying authenticated session & profile summary

---

## Milestone 2: Student Profiles, Skills, Portfolios & Availability ✅

### Step 2A: Database Schema & Storage Configuration ✅
- [x] Migration `supabase/migrations/002_profiles_and_portfolios.sql`
- [x] Extended `profiles` with `areas_of_interest`, `available_from`, `contact_links`, `onboarding_completed`
- [x] Created `portfolio_items` and `portfolio_item_skills` junction with UUID PKs and cascade deletes
- [x] Strict RLS policies on portfolio items and junction records
- [x] Controlled unlisted skill request RLS policy on `skills` (`is_approved = false`)
- [x] Storage buckets `avatars` and `portfolio-media` with owner-scoped writes and public reads

### Step 2B: Service Layer & Business Logic ✅
- [x] `src/services/profileService.js` with zero queries in UI components
- [x] `getProfileById(userId)` (joined profile, user skills, and portfolio items)
- [x] `updateProfile(userId, updates)` and `updateAvailability(...)`
- [x] `getAvailableSkills()` and `requestUnlistedSkill(name, category)`
- [x] `addUserSkill()`, `updateUserSkill()`, and `removeUserSkill()`
- [x] `createPortfolioItem()`, `updatePortfolioItem()`, and `deletePortfolioItem()`
- [x] `uploadMediaFile(bucket, userId, file)` with 5MB limit and strict MIME validation

### Step 2C: Post-Registration Onboarding Wizard ✅
- [x] Multi-step guided setup (`src/pages/talent/OnboardingPage.jsx` at `/onboarding`)
- [x] Step 1: Dual-role preferences (`is_freelancer_enabled`, `is_seeker_enabled`), headline, and interest tags
- [x] Step 2: Core skills selection, proficiency ratings, and unlisted skill request
- [x] Step 3: First portfolio project showcase (optional, with skip option)
- [x] Onboarding completion tracking and automatic redirect to `/profile/me`

### Step 2D: LinkedIn-Inspired Student Profile View ✅
- [x] Asymmetric 2-column layout (`src/pages/talent/StudentProfilePage.jsx` at `/profile/:id` and `/profile/me`)
- [x] Header card: Banner accent, avatar, full name, headline, academic affiliation, role badges, and edit profile action
- [x] Main column: About/Bio, areas of interest, featured portfolio grid (with external & GitHub links, labeled self-reported)
- [x] Separate empty state for "Verified SkillBridge Collaborations" per Section 12.2
- [x] Sticky sidebar: Live Availability card with 1-click status switcher for owner, and Skills card with self-reported proficiency

### Step 2E: Comprehensive Profile & Portfolio Editor ✅
- [x] Tabbed editor (`src/pages/talent/EditProfilePage.jsx` at `/profile/edit`)
- [x] Tab 1: Basic info, bio, academic details, avatar upload, and opt-in social links (LinkedIn, GitHub, Website)
- [x] Tab 2: Skills management (add, delete, proficiency select, primary skill toggle, unlisted requests)
- [x] Tab 3: Portfolio projects CRUD (add/edit modals, image uploads, skill tagging, link validation)
- [x] Tab 4: Availability status, context notes, available-from date, and seeker/freelancer capability toggles
- [x] Navbar and Dashboard navigation updated with direct profile shortcuts

---

## Milestone 3: Talent Discovery & Search (Upcoming)
- [ ] Searchable directory of student talent (`/explore`)
- [ ] Granular multi-attribute filters (skills, department, year, availability, role)
- [ ] Student profile preview cards with skill match indicators
- [ ] Rule-based recommendation ranking (Section 16)
- [ ] Direct contact and project invitation modals

---

## Milestone 4: Project Marketplace & Agreements (Upcoming)
- [ ] Structured project posting wizard (`/projects/new`)
- [ ] Project marketplace discovery & filtering (`/projects`)
- [ ] Application submission & applicant management
- [ ] Versioned Project Agreements with mutual confirmation (Section 9)
- [ ] Project workspaces & milestones tracking (Section 10)

---

## Milestone 5: Club Management, Reviews & Handover (Upcoming)
- [ ] Organization profile & committee roles (Section 13)
- [ ] Permanent organization freelancer directory & project costs
- [ ] Committee handover preparation & transfer workflow
- [ ] Post-collaboration review & reputation scoring (Section 12)
