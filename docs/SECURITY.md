# SkillBridge Security & Authorization Architecture

## 1. Authentication Architecture
- **Provider:** Supabase Auth (OAuth 2.0 / JWT / PKCE).
- **Password Security:** Salted and hashed using `bcrypt` via Supabase internal authentication; plaintext passwords are never transferred or stored in application state.
- **Session Handling:** JSON Web Tokens (JWT) with automatic refresh cycles stored securely in local browser storage; invalidated on explicit logout.

---

## 2. Row Level Security (RLS) Policies

RLS is strictly enabled across all public schema tables in `001_foundation_schema.sql`.

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
- **INSERT:** Regular authenticated users can submit suggestions with `is_approved = false`. Only administrators can insert pre-approved skills directly.

### 2.4 Universities & Departments
- **SELECT:** Active universities and their associated departments are publicly readable.
- **INSERT / UPDATE / DELETE:** Restricted to administrative users.

---

## 3. Input Validation & Campus Email Domain Rules
- All frontend inputs undergo strict client-side validation for character length, email regex, and password complexity.
- University email verification checks if `universities.email_domain` is populated. When set (e.g. `'apex.edu'`), signups are restricted to emails matching `@<email_domain>`.
- For early testing and local sandbox iteration, `email_domain` defaults to `NULL`, allowing standard addresses while preserving production-readiness.
