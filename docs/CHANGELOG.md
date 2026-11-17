# Changelog

All notable changes to SkillBridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.3.0] — 2026-11-17

### Added - Milestone 2 (Student Profiles, Skills, Portfolios & Availability)
- **Database Migration & Storage:**
  - `supabase/migrations/002_profiles_and_portfolios.sql` adding `areas_of_interest`, `available_from`, `contact_links`, and `onboarding_completed` to `public.profiles`.
  - Created `public.portfolio_items` and `public.portfolio_item_skills` junction tables with UUID keys and cascade foreign keys.
  - Added strict Row Level Security (RLS) policies for portfolio reading (active profiles) and owner-scoped mutations.
  - Added controlled unlisted skill insertion policy (`is_approved = false`) on `public.skills`.
  - Storage bucket configurations for `avatars` and `portfolio-media` with 5MB limits and owner-scoped object permissions.
- **Service Layer (`src/services/profileService.js`):**
  - Modular profile service supporting live Supabase and offline local storage fallback.
  - Methods: `getProfileById()`, `updateProfile()`, `updateAvailability()`, `getAvailableSkills()`, `requestUnlistedSkill()`, `addUserSkill()`, `updateUserSkill()`, `removeUserSkill()`, `createPortfolioItem()`, `updatePortfolioItem()`, `deletePortfolioItem()`, and `uploadMediaFile()`.
  - Media upload validation enforcing max 5MB and allowed MIME types (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
- **Post-Registration Onboarding Wizard (`src/pages/talent/OnboardingPage.jsx` at `/onboarding`):**
  - 3-step setup: Dual-role selection & headline, skills selection & proficiency ratings with unlisted request modal, and optional first portfolio project.
  - "Skip for now" support that marks `onboarding_completed = true` and navigates to profile view.
- **LinkedIn-Inspired Student Profile View (`src/pages/talent/StudentProfilePage.jsx` at `/profile/:id` and `/profile/me`):**
  - Asymmetric 2-column layout (~68% main column, ~32% sticky right sidebar) on `#F3F2EF` canvas.
  - Header card with cover banner, avatar, headline, academic affiliation, dual-role badges, and owner edit action.
  - About/Bio section, areas of interest pills, and featured portfolio grid with skill pills and external links.
  - Separate placeholder section for "Verified SkillBridge Collaborations" distinct from self-reported portfolio work (Section 12.2).
  - Sticky sidebar with Live Availability card (including 1-click status switcher for owner) and Skills & Self-Reported Proficiency list.
- **Profile, Skills & Portfolio Editor (`src/pages/talent/EditProfilePage.jsx` at `/profile/edit`):**
  - Tabbed editing interface: Basic Info & Bio (avatar upload, headline, bio, course, year, social links), Skills & Proficiency (add, delete, proficiency select, primary star toggle, unlisted requests), Portfolio Projects (full CRUD with image upload and skill association), and Availability & Roles.
- **Navigation & Dashboard Enhancements:**
  - `Navbar.jsx`: Added direct links to My Profile (`/profile/me`), Edit Profile (`/profile/edit`), and Dashboard.
  - `DashboardOverview.jsx`: Added onboarding prompt banner and direct profile shortcut buttons.

---

## [0.2.0] — 2026-11-17

### Added - Step 1C & Step 1D (Database Schema, Landing Page & Authentication)
- Database Migrations & Seed (`001_foundation_schema.sql`, `seed.sql`) with UUID PKs, timestamps, and RLS.
- Automated `on_auth_user_created` trigger and `trg_prevent_role_escalation` trigger.
- Landing Page (`src/pages/public/LandingPage.jsx`) with all 7 core sections.
- Authentication system (`authService.js`, `AuthContext.jsx`, `/login`, `/register`, `/forgot-password`, `/verify-email`, `/dashboard`).
- Updated documentation (`docs/DATABASE.md`, `docs/SECURITY.md`, `docs/DEVELOPMENT_PLAN.md`).

---

## [0.1.0] — 2026-11-17

### Added - Step 1A & Step 1B (Foundation & Core UI)
- Initialized React 19 + Vite 8 + Tailwind CSS v4 project.
- Installed `react-router-dom`, `lucide-react`, `@supabase/supabase-js`.
- Configured LinkedIn-inspired design system with Inter font.
- Reusable UI Components: `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`, `Spinner`, `EmptyState`.
- Layout components: `Navbar`, `Footer`, `PageContainer`.
- Documentation: `docs/README.md`, `DESIGN_SYSTEM.md`, `DEVELOPMENT_PLAN.md`, `CHANGELOG.md`.
