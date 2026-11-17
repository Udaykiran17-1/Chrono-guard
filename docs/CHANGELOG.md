# Changelog

All notable changes to SkillBridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.2.0] — 2026-11-17

### Added - Step 1C & Step 1D (Database Schema, Landing Page & Authentication)
- **Database Migrations & Seed:**
  - `supabase/migrations/001_foundation_schema.sql` defining `universities`, `departments`, `profiles`, `skills`, and `user_skills` with UUID primary keys and timestamps.
  - Automated `on_auth_user_created` trigger inserting into `public.profiles` from `raw_user_meta_data`.
  - Trigger `trg_prevent_role_escalation` safeguarding `profiles.platform_role` against non-admin elevation.
  - Strict Row Level Security (RLS) policies on all tables enforcing read access for active profiles and write isolation for account owners.
  - `supabase/seed.sql` with default configurable university ("Apex Institute of Technology"), 6 foundational departments, and 30+ categorized skills.
- **Landing Page (`src/pages/public/LandingPage.jsx`):**
  - Replaced temporary showcase on `/` with production-grade LinkedIn-inspired landing page.
  - Hero section with exact required heading and supporting copy.
  - All 7 core sections: How SkillBridge Works, Student Talent Directory preview, Campus Projects preview, Freelancer Benefits, Club Benefits, Interactive FAQ Accordion, and Footer.
- **Authentication System:**
  - `src/services/authService.js` with live Supabase client calls and resilient offline/sandbox fallback.
  - `src/context/AuthContext.jsx` providing state management for `user`, `profile`, `session`, `loading`, and methods for `login`, `register`, `logout`, `resetPassword`.
  - Registration page (`/register`) with university email domain checks, department selector, academic year, and mandatory terms agreement.
  - Login page (`/login`) with session persistence, error alerting, and unverified email handling.
  - Password recovery page (`/forgot-password`) and email confirmation instruction page (`/verify-email`).
  - Protected route wrapper (`src/components/layout/ProtectedRoute.jsx`).
  - Temporary `/dashboard` console displaying authenticated user diagnostic profile summary.
- **Navbar Updates:**
  - Dynamic user avatar, name, and role badge for logged-in sessions.
  - Dedicated Logout button and mobile drawer synchronization.
- **Documentation:**
  - `docs/DATABASE.md`: Comprehensive entity relational schema, triggers, and column specifications.
  - `docs/SECURITY.md`: RLS policies, token handling, search-path protections, and role escalation rules.
  - Updated `docs/DEVELOPMENT_PLAN.md` with completed Steps 1C & 1D.

---

## [0.1.0] — 2026-11-17

### Added - Step 1A & Step 1B (Foundation & Core UI)
- Initialized React 19 + Vite 8 (JavaScript) project with Tailwind CSS v4.
- Installed `react-router-dom`, `lucide-react`, `@supabase/supabase-js`.
- Configured LinkedIn-inspired design system with Inter font.
- Brand colors: Deep Indigo (`#3730A3`), Cobalt Blue (`#2563EB`), Teal (`#0D9488`).
- Canvas background (`#F3F2EF`), white cards with subtle borders and 8px radius.
- Reusable UI Components: `Button`, `Input`, `Select`, `Card`, `Badge`, `Modal`, `Spinner`, `EmptyState`.
- Layout components: `Navbar`, `Footer`, `PageContainer`.
- Documentation: `docs/README.md`, `DESIGN_SYSTEM.md`, `DEVELOPMENT_PLAN.md`, `CHANGELOG.md`.
