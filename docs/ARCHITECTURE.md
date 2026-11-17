# SkillBridge Architecture

## Application layers

- `src/pages/` contains route-level React screens.
- `src/components/` contains shared UI, layout, and project widgets.
- `src/context/AuthContext.jsx` owns the authenticated session and profile state.
- `src/services/` contains domain operations and the local sandbox fallback.
- `src/lib/supabase.js` initializes the Supabase client without hardcoded credentials.
- `supabase/migrations/` defines relational schema, integrity functions, and row-level permissions.

Pages call services instead of embedding database operations in presentation components. Supabase policies remain the authoritative authorization boundary; hiding a control in React is not permission enforcement.

## Domain areas

Profiles and portfolios are separate from completed project collaborations. Projects and applications feed into a capacity-safe acceptance operation. Accepted applicants become project members. Project members establish a versioned agreement before they can read or write workspace milestones and updates. Completed projects allow participant reviews. Organization records are private to members with the required permission. Reports are visible to their reporter and platform administrators.

## Data modes

When Supabase credentials are absent, the application uses local storage and bundled demo records for the original marketplace/profile flows. Collaboration and organization demo data is limited; the organization workspace requires Supabase. Local mode is for UI exploration and does not establish production persistence or database security.

## Database migration order

Apply migrations in numeric order: `001_foundation_schema.sql`, `002_profiles_and_portfolios.sql`, `003_marketplace_and_projects.sql`, `004_applications_and_notifications.sql`, `005_project_workspaces.sql`, and `006_organizations_reviews_reports.sql`.

## Operational assumptions

- Supabase Auth supplies `auth.uid()` for authenticated actions.
- Database functions that perform privileged writes use `SECURITY DEFINER` with a fixed `search_path` and explicit actor checks.
- The browser uses only public project configuration; no service-role key belongs in frontend code.
- Production deployment and live database validation are still pending.
