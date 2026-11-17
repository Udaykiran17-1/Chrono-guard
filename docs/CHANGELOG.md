# Changelog

All notable changes to SkillBridge will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] — 2026-11-17

### Added
- Initialized React + Vite (JavaScript) project with Tailwind CSS v4
- Installed `react-router-dom`, `lucide-react`, `@supabase/supabase-js`
- Configured LinkedIn-inspired design system with Inter font
- Brand colors: Deep Indigo (`#3730A3`), Cobalt Blue (`#2563EB`), Teal (`#0D9488`)
- Canvas background (`#F3F2EF`), white cards with subtle borders and 8px radius
- Supabase client (`src/lib/supabase.js`) with safe fallback warnings
- **UI Components** (`src/components/ui/`):
  - `Button` — 5 variants (primary, secondary, outline, ghost, danger), 3 sizes, loading & disabled
  - `Input` — labels, helper text, validation errors, disabled
  - `Select` — labels, helper text, validation errors, chevron icon
  - `Card`, `CardHeader`, `CardBody`, `CardFooter` — composable card system
  - `Badge` — 5 color variants with optional leading icon
  - `Modal` — keyboard Escape, backdrop click, focus trapping, scroll lock
  - `Spinner` — 4 sizes with accessible status role
  - `EmptyState` — customizable icon, title, description, action slot
- **Layout Components** (`src/components/layout/`):
  - `Navbar` — sticky 56px top bar, logo, search, nav links, mobile hamburger drawer
  - `Footer` — multi-column link layout with brand description
  - `PageContainer` — responsive max-width wrapper
- Component showcase page at `/` for visual inspection
- Documentation: `docs/README.md`, `DESIGN_SYSTEM.md`, `DEVELOPMENT_PLAN.md`, `CHANGELOG.md`
- `.env.example` with Supabase configuration placeholders
