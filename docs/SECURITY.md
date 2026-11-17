# SkillBridge Security & Authorization Architecture

## 1. Authentication Architecture
- **Provider:** Supabase Auth (OAuth 2.0 / JWT / PKCE).
- **Password Security:** Salted and hashed using `bcrypt` via Supabase internal authentication; plaintext passwords are never transferred or stored in application state.
- **Session Handling:** JSON Web Tokens (JWT) with automatic refresh cycles stored securely in local browser storage; invalidated on explicit logout.

---

## 2. Row Level Security (RLS) Policies

RLS is strictly enabled across all public schema tables in `001_foundation_schema.sql`, `002_profiles_and_portfolios.sql`, and `003_marketplace_and_projects.sql`.

### 2.1 Profiles (`public.profiles`)
- **SELECT:**
  - Authenticated users can view profiles where `account_status = 'active'`.
  - Users can view their own profile regardless of account status.
  - Platform administrators can view all profiles.
- **INSERT:**
  - Enforced `auth.uid() = id`.
  - Automated trigger `handle_new_user()` operates via `SECURITY DEFINER` with fixed `search_path = public` to prevent search-path hijacking.
- **UPDATE:**
  - Users can only update their own row (`id = auth.uid()`).
  - **Self-Escalation Protection:** Protected by PostgreSQL trigger `trg_prevent_role_escalation`, which aborts transactions attempting to mutate `platform_role` unless performed by a verified administrator.

### 2.2 User Skills (`public.user_skills`)
- **SELECT:** Authenticated users can read skills associated with active profiles.
- **INSERT / UPDATE / DELETE:** Strictly restricted to the owner (`user_id = auth.uid()`).

### 2.3 Skills (`public.skills`)
- **SELECT:** All authenticated users can query `is_approved = true`. Administrators can inspect all skills.
- **INSERT:** Regular authenticated users can submit suggestions with `is_approved = false` (controlled request policy). Direct addition of pre-approved skills is restricted to administrators.

### 2.4 Portfolio Items (`public.portfolio_items`)
- **SELECT:** Authenticated users can view portfolio items belonging to users with `account_status = 'active'`.
- **INSERT:** Enforced `user_id = auth.uid()`.
- **UPDATE:** Restricted to owner (`user_id = auth.uid()`).
- **DELETE:** Restricted to owner (`user_id = auth.uid()`).

### 2.5 Portfolio Item Skills (`public.portfolio_item_skills`)
- **SELECT:** Authenticated users can read skills linked to portfolio entries belonging to active profiles.
- **INSERT / UPDATE / DELETE:** Restricted to cases where the parent portfolio item belongs to the authenticated user (`EXISTS (SELECT 1 FROM portfolio_items pi WHERE pi.id = portfolio_item_skills.portfolio_item_id AND pi.user_id = auth.uid())`).

### 2.6 Projects (`public.projects`) (Added in 003)
- **SELECT:**
  - Authenticated users can view all non-draft projects (`status != 'draft'`).
  - Project creators can view their own draft projects (`creator_id = auth.uid()`).
- **INSERT:**
  - Restricted to authenticated users creating projects under their own identity (`WITH CHECK (creator_id = auth.uid())`).
- **UPDATE:**
  - Restricted to the project creator (`creator_id = auth.uid()`).
  - Status mutations are gated by database trigger `trg_enforce_project_status_transition` to ensure workflow integrity.
- **DELETE:**
  - Restricted to the project creator (`creator_id = auth.uid()`).

### 2.7 Project Skills (`public.project_skills`) (Added in 003)
- **SELECT:**
  - Authenticated users can view skills for visible projects (`p.status != 'draft' OR p.creator_id = auth.uid()`).
- **INSERT / UPDATE / DELETE:**
  - Restricted to the project creator (`EXISTS (SELECT 1 FROM projects p WHERE p.id = project_skills.project_id AND p.creator_id = auth.uid())`).

### 2.8 Saved Bookmarks (`public.saved_projects` & `public.saved_freelancers`) (Added in 003)
- **SELECT:**
  - Strictly restricted to the bookmark owner (`user_id = auth.uid()`). Privacy guaranteed: peers cannot inspect other users' bookmarks.
- **INSERT:**
  - Restricted to inserting for self (`user_id = auth.uid()`).
  - Constraint `chk_no_self_save` prevents users from bookmarking their own talent profile.
- **DELETE:**
  - Restricted to removing self-created bookmarks (`user_id = auth.uid()`).

### 2.9 Universities & Departments
- **SELECT:** Active universities and their associated departments are publicly readable.
- **INSERT / UPDATE / DELETE:** Restricted to administrative users.

---

## 3. Storage Security & Media Validation

1. **Storage Bucket Isolation:**
   - Supabase storage buckets `avatars` and `portfolio-media` enforce owner-scoped write rules.
   - Objects must be uploaded into folder paths matching `${auth.uid()}/...`.
   - Update and delete operations require `(storage.foldername(name))[1] = auth.uid()::text`.
2. **Client-Side & Server MIME / Size Enforcement:**
   - Maximum file size: `5MB` (`5,242,880` bytes).
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, and `application/pdf` (portfolio media only).
   - In fallback/offline local mode, images are sanitized and stored as local data URLs to prevent arbitrary executable file execution.

---

## 4. State Transition Integrity

The platform enforces state-machine constraints at the database trigger level:
- Projects cannot arbitrarily transition between non-sequential statuses (e.g. `open` cannot jump directly to `completed` without an intermediate `in_progress` agreement phase).
- Cancelling a project requires a non-empty `cancellation_reason` to provide transparency to applicants.
- Completed and cancelled projects are immutable terminal states.

## 5. Applications, Agreements and Workspaces

- Applicants can read and withdraw only their own applications; project creators can read applications for their projects.
- Application content and identity fields are immutable after submission. Acceptance must use the capacity-locking RPC and requires an authenticated project creator.
- Cross-user application notifications are written by database triggers. Authenticated clients can only create notifications for themselves.
- Agreement rows and version terms are readable only by the named client and freelancer. Version terms cannot be updated or deleted; parties accept the latest version through a database function.
- Workspace milestones and updates are readable and writable only by project members with a mutually accepted latest agreement.
- Scope-change and dispute requests are visible to their two named project participants. Only the named respondent can answer; an accepted scope change creates a fresh agreement version.

## 6. Organizations, Reviews and Reports

- Organization freelancer and handover records are protected by organization membership permissions.
- Only platform administrators can mark an organization official or moderate reports and review visibility.
- Reviews require a completed project and both reviewer and reviewee to be project members. Review content is immutable; admins can change visibility only.
- Reports are private to their reporter and platform administrators. Moderation actions are stored in an administrator-only audit table.

The policies and RPCs described here are defined in migrations `004` through `006`. Their behavior still needs validation against a configured Supabase project before production use.
