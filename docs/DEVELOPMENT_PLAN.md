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

## Milestone 3: Talent Discovery, Project Marketplace & Structured Creation ✅

### Step 3A: Database Migration & Integrity Triggers ✅
- [x] `supabase/migrations/003_marketplace_and_projects.sql` with UUID PKs and strict RLS
- [x] Tables: `projects`, `project_skills`, `saved_projects`, `saved_freelancers`
- [x] PostgreSQL status transition trigger `trg_enforce_project_status_transition` enforcing valid workflow transitions
- [x] Strict Row Level Security policies for project visibility, owner-scoped CRUD, and private bookmarks

### Step 3B: Service Layer & Recommendation Logic ✅
- [x] `src/services/talentService.js` with zero-query UI layer and granular filtering
- [x] `src/services/projectService.js` with structured CRUD, state transitions, and save toggles
- [x] Rule-based candidate matching engine (`getRecommendedFreelancers` per Section 16)
- [x] Rule-based project recommendation engine (`getRecommendedProjects` per Section 16)
- [x] Rich mock seed datasets for offline local sandbox testing

### Step 3C: Talent Discovery Directory ✅
- [x] Searchable student directory (`src/pages/talent/TalentDirectoryPage.jsx` at `/talent`)
- [x] Sticky filter sidebar: Skill category, multi-skill selection, department, academic year, availability, proficiency level
- [x] Sort selector: Recently Active, Recently Joined, Relevant Skills, Availability
- [x] Responsive student cards with headline, primary skills pills, availability badges, and 1-click bookmarking

### Step 3D: Structured Project Creation & Editing ✅
- [x] Structured form (`src/pages/projects/CreateProjectPage.jsx` at `/projects/new` and `/projects/:id/edit`)
- [x] Section 6.2 field decomposition: What needs doing, Why it's needed, Expected deliverables, Additional requirements
- [x] Skill tagging with primary/secondary attributes
- [x] Transparent compensation disclosure: Fixed, Negotiable, Unpaid, Volunteer, Other with explanatory notes
- [x] Draft mode vs. Publish immediately support

### Step 3E: Project Discovery Marketplace ✅
- [x] Filterable marketplace (`src/pages/projects/ProjectDiscoveryPage.jsx` at `/projects`)
- [x] Search keywords, category filter, budget type filter, required skills filter, and sorting
- [x] Project cards displaying spots remaining (`filled / total`), compensation badge, deadline, and bookmark toggle

### Step 3F: Detailed Project Brief & Contextual Actions ✅
- [x] Project detail view (`src/pages/projects/ProjectDetailPage.jsx` at `/projects/:id`)
- [x] Structured breakdown display (Scope, Purpose, Concrete Deliverables, Requirements)
- [x] Creator management controls: Edit Project, Close Applications, Cancel with mandatory cancellation reason modal
- [x] Recommended Freelancers matching widget for creators
- [x] Peer actions: Bookmark project, placeholder "Apply for Project" action

### Step 3G: Dashboard & Global Navigation Integration ✅
- [x] Registered `/talent`, `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit` in `App.jsx`
- [x] Updated Navbar with "Explore Talent", "Find Projects", and "+ Post Project" action button
- [x] Dashboard updated with "Recommended Projects for You" (explainable match badges), "Projects I Posted", and bookmark counts

---

## Milestone 4: Applications, Project Agreements & Workspaces (Upcoming)
- [ ] Application submission modal & screening questions
- [ ] Creator applicant review dashboard (accept, decline, shortlist)
- [ ] Versioned Project Agreements with mutual confirmation (Section 9)
- [ ] Project workspaces & milestone deliverable tracking (Section 10)
- [ ] Mid-project dispute resolution & scope adjustment workflows

---

## Milestone 5: Campus Organizations, Committee Roles & Handover (Upcoming)
- [ ] Organization profile & committee roles (Section 13)
- [ ] Permanent organization freelancer directory & project budget history
- [ ] Committee handover preparation & transfer workflow
- [ ] Outgoing/incoming committee lead transition checklists

---

## Milestone 6: Reviews, Reputation & Administrative Moderation (Upcoming)
- [ ] Post-collaboration review & reputation scoring (Section 12)
- [ ] Verified skill endorsements originating from completed projects
- [ ] Admin moderation console for reporting and dispute intervention

## Current implementation status (2026-11-17)

The milestone list above is the original baseline. Since it was written, application review, agreement versions, member-only workspaces, organization records, handovers, participant reviews, review reports, and a basic administrator report queue have been implemented in the repository. The app build succeeds, but these milestones are not complete under the product definition of done until the new Supabase migrations are applied and permission behavior is validated with real accounts.

Remaining work is final responsive/accessibility review, applying migrations `004`–`006` to a configured Supabase development project, validating permissions and workflows with separate accounts, and deployment. Applications, agreements, workspaces, scope-change/dispute requests, organizations, reviews, endorsements, in-app notification preferences, administrator metrics, and account status moderation now have code paths in the repository. See `product_spec.md` and keep this status current as validation proceeds.
