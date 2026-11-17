# SkillBridge Security & Authorization Architecture

## 1. Authentication Architecture
- **Provider:** Supabase Auth (OAuth 2.0 / JWT / PKCE).
- **Password Security:** Salted and hashed using `bcrypt` via Supabase internal authentication; plaintext passwords are never transferred or stored in application state.
- **Session Handling:** JSON Web Tokens (JWT) with automatic refresh cycles stored securely in local browser storage; invalidated on explicit logout.

---

## 2. Row Level Security (RLS) Policies

RLS is strictly enabled across all public schema tables in `001_foundation_schema.sql` and `002_profiles_and_portfolios.sql`.

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

### 2.6 Universities & Departments
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
