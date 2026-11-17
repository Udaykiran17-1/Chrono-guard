# SkillBridge Database Architecture

## Overview
SkillBridge uses Supabase PostgreSQL (15+) as its core persistence engine, employing UUID v4 primary keys, strict foreign key constraints, updated_at triggers, and comprehensive Row Level Security (RLS) on every table.

---

## 1. Schema Entities

```mermaid
erDiagram
  UNIVERSITIES ||--o{ DEPARTMENTS : contains
  UNIVERSITIES ||--o{ PROFILES : enrolls
  DEPARTMENTS ||--o{ PROFILES : categorizes
  PROFILES ||--o{ USER_SKILLS : possesses
  SKILLS ||--o{ USER_SKILLS : categorized_in
  PROFILES ||--o{ PORTFOLIO_ITEMS : authors
  PORTFOLIO_ITEMS ||--o{ PORTFOLIO_ITEM_SKILLS : tags
  SKILLS ||--o{ PORTFOLIO_ITEM_SKILLS : references
  PROFILES ||--o{ PROJECTS : creates
  PROJECTS ||--o{ PROJECT_SKILLS : requires
  SKILLS ||--o{ PROJECT_SKILLS : referenced_by
  PROFILES ||--o{ SAVED_PROJECTS : bookmarks
  PROJECTS ||--o{ SAVED_PROJECTS : bookmarked_in
  PROFILES ||--o{ SAVED_FREELANCERS : bookmarks
```

### 1.1 `universities`
Stores institutional campus records. Configured with optional email domain verification.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique university ID |
| `name` | `TEXT` | `NOT NULL` | Full university name |
| `short_name` | `TEXT` | | Abbreviated name (e.g. "Apex Tech") |
| `email_domain` | `TEXT` | `NULLABLE` | Campus email domain (e.g. `campus.edu`). If `NULL`, open testing is permitted |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT true` | Active flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

### 1.2 `departments`
Academic departments under universities.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique department ID |
| `university_id` | `UUID` | `NOT NULL REFERENCES universities(id) ON DELETE CASCADE` | Parent institution |
| `name` | `TEXT` | `NOT NULL` | Department name |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Last update timestamp |

*Constraint:* `UNIQUE (university_id, name)`

### 1.3 `profiles`
The primary user record, linked 1:1 with Supabase `auth.users(id)`.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` | Auth user ID |
| `university_id` | `UUID` | `REFERENCES universities(id) ON DELETE SET NULL` | Campus affiliation |
| `department_id` | `UUID` | `REFERENCES departments(id) ON DELETE SET NULL` | Department affiliation |
| `full_name` | `TEXT` | `NOT NULL` | User full name |
| `email` | `TEXT` | `NOT NULL` | Registered university email |
| `avatar_url` | `TEXT` | | Profile avatar image URL |
| `course` | `TEXT` | | Program of study (e.g. B.Tech CS) |
| `academic_year` | `TEXT` | | Year (1st, 2nd, 3rd, 4th, PG) |
| `headline` | `TEXT` | | Professional student headline |
| `bio` | `TEXT` | | Extended biography |
| `availability_status`| `TEXT` | `DEFAULT 'available' CHECK ('available', 'limited', 'busy', 'unavailable')` | Availability status |
| `availability_note` | `TEXT` | | Context (e.g. "Available on weekends") |
| `available_from` | `DATE` | | Earliest available date for projects |
| `areas_of_interest` | `TEXT[]` | `DEFAULT '{}'` | Tags of personal interest |
| `contact_links` | `JSONB` | `DEFAULT '{}'::jsonb` | Opt-in links (LinkedIn, GitHub, Website) |
| `onboarding_completed` | `BOOLEAN` | `DEFAULT false` | Guided wizard status |
| `is_seeker_enabled` | `BOOLEAN` | `DEFAULT true` | Dual capability: hire talent |
| `is_freelancer_enabled` | `BOOLEAN` | `DEFAULT true` | Dual capability: offer skills |
| `platform_role` | `TEXT` | `DEFAULT 'user' CHECK ('user', 'admin', 'moderator')` | Role for moderation |
| `account_status` | `TEXT` | `DEFAULT 'active' CHECK ('active', 'suspended', 'deactivated')` | Lifecycle status |
| `last_active_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Last online timestamp |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Record created |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Record updated |

### 1.4 `skills`
Central approved and proposed taxonomy of technical, creative, and managerial skills.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique skill ID |
| `name` | `TEXT` | `NOT NULL UNIQUE` | Unique skill title |
| `category` | `TEXT` | `CHECK ('Technical', 'Creative', 'Management & Other')` | Skill category |
| `is_approved` | `BOOLEAN` | `DEFAULT true` | Admin approval status |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Creation timestamp |

### 1.5 `user_skills`
Junction table linking student profiles to claimed skills with self-reported proficiency.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique user skill ID |
| `user_id` | `UUID` | `REFERENCES profiles(id) ON DELETE CASCADE` | Profile owner |
| `skill_id` | `UUID` | `REFERENCES skills(id) ON DELETE CASCADE` | Claimed skill |
| `proficiency` | `TEXT` | `DEFAULT 'beginner' CHECK ('beginner', 'intermediate', 'advanced')` | Self-reported level |
| `is_primary` | `BOOLEAN` | `DEFAULT false` | Highlighted on card |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT now()` | Creation timestamp |

*Constraint:* `UNIQUE (user_id, skill_id)`

### 1.6 `portfolio_items`
Self-reported student projects, previous work, GitHub repositories, and creative assets.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique portfolio item ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Project owner |
| `title` | `TEXT` | `NOT NULL` | Project title |
| `description` | `TEXT` | | Project summary and deliverables |
| `category` | `TEXT` | | Categorization (e.g. Web Dev, Design) |
| `thumbnail_url` | `TEXT` | | Preview visual or document cover |
| `project_url` | `TEXT` | | External demo or live link |
| `github_url` | `TEXT` | | Code repository link |
| `attachment_url` | `TEXT` | | Optional attachment/document link |
| `completed_date` | `DATE` | | Completion date |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Record created |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Record updated |

### 1.7 `portfolio_item_skills`
Junction linking portfolio entries to relevant skills utilized during project execution.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `portfolio_item_id` | `UUID` | `NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE` | Portfolio entry |
| `skill_id` | `UUID` | `NOT NULL REFERENCES skills(id) ON DELETE CASCADE` | Utilized skill |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |

*Constraint:* `PRIMARY KEY (portfolio_item_id, skill_id)`

### 1.8 `projects` (Added in 003)
Structured project briefs created by student peers or campus club organizers.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique project ID |
| `creator_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Creator user profile |
| `organisation_id` | `UUID` | `NULLABLE` | Optional club/organisation affiliation |
| `title` | `TEXT` | `NOT NULL` | Brief title |
| `what_needs_doing` | `TEXT` | `NOT NULL` | Plain-English project scope |
| `why_required` | `TEXT` | `NOT NULL` | Context and objective |
| `expected_deliverables`| `TEXT` | `NOT NULL` | Concrete output milestones |
| `additional_requirements`| `TEXT` | `NULLABLE` | Formatting, tools, attendance rules |
| `category` | `TEXT` | `NOT NULL` | Market category |
| `budget_type` | `TEXT` | `CHECK ('fixed', 'negotiable', 'unpaid', 'volunteer', 'other')` | Compensation model |
| `budget_min` | `NUMERIC` | `CHECK (budget_min >= 0)` | Lower range |
| `budget_max` | `NUMERIC` | `CHECK (budget_max >= 0)` | Upper range |
| `budget_note` | `TEXT` | `NULLABLE` | Milestone pay context |
| `deadline` | `DATE` | `NOT NULL` | Final delivery date |
| `estimated_duration` | `TEXT` | `NULLABLE` | e.g. "2 weeks", "1 month" |
| `positions_total` | `INTEGER` | `NOT NULL DEFAULT 1 CHECK (positions_total >= 1)` | Open spots count |
| `positions_filled` | `INTEGER` | `NOT NULL DEFAULT 0 CHECK (positions_filled >= 0)` | Contracted spots count |
| `status` | `TEXT` | `CHECK ('draft', 'open', 'reviewing', 'in_progress', 'completed', 'cancelled', 'closed')` | Project lifecycle |
| `cancellation_reason` | `TEXT` | `NULLABLE` | Mandatory on cancellation |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Record created |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Record updated |

### 1.9 `project_skills` (Added in 003)
Junction linking projects to required technical and creative skills.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `project_id` | `UUID` | `NOT NULL REFERENCES projects(id) ON DELETE CASCADE` | Parent project |
| `skill_id` | `UUID` | `NOT NULL REFERENCES skills(id) ON DELETE CASCADE` | Required skill |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Creation timestamp |

*Constraint:* `PRIMARY KEY (project_id, skill_id)`

### 1.10 `saved_projects` (Added in 003)
Student bookmarks for projects of interest.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Student saving project |
| `project_id` | `UUID` | `NOT NULL REFERENCES projects(id) ON DELETE CASCADE` | Saved project |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Bookmark timestamp |

*Constraint:* `PRIMARY KEY (user_id, project_id)`

### 1.11 `saved_freelancers` (Added in 003)
Creator / organizer bookmarks for student talent discovered in the directory.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | User saving talent |
| `freelancer_id` | `UUID` | `NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` | Saved student talent |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | Bookmark timestamp |

*Constraint:* `PRIMARY KEY (user_id, freelancer_id)`

---

## 2. Storage Buckets (Supabase Storage)

1. **`avatars`**:
   - Public read access for rendering profile photographs across the platform.
   - Max file size: 5MB.
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
   - Write/Delete operations strictly isolated to authenticated user's own prefix folder (`storage.foldername(name)[1] = auth.uid()::text`).

2. **`portfolio-media`**:
   - Public read access for portfolio project previews and attachments.
   - Max file size: 5MB.
   - Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
   - Write/Delete operations isolated to owner.

---

## 3. Database Triggers

1. **`on_auth_user_created`**:
   - Executes `handle_new_user()` with `SECURITY DEFINER SET search_path = public` upon user registration in `auth.users`.
2. **`trg_prevent_role_escalation`**:
   - Restricts modification of `platform_role` to users who already possess the `admin` role.
3. **`trg_enforce_project_status_transition`** (Added in 003):
   - Enforces valid state machine transitions:
     - `draft` → `open`, `cancelled`
     - `open` → `reviewing`, `cancelled`, `closed`
     - `reviewing` → `open`, `in_progress`, `cancelled`, `closed`
     - `in_progress` → `completed`, `cancelled`
     - `completed`, `cancelled`, `closed` → terminal states
   - Mandates non-empty `cancellation_reason` when moving to `cancelled`.
   - Automatically transitions project to `closed` when `positions_filled >= positions_total`.
4. **`trg_*_updated_at`**:
   - Automatically maintains `updated_at = now()` across `universities`, `departments`, `profiles`, `portfolio_items`, and `projects`.

## 4. Collaboration, Organizations and Trust & Safety (Migrations 004–006)

- `applications`, `project_members`, and `notifications` support applications, capacity-safe acceptance, and in-app events.
- `project_agreements` identify the client and freelancer; `agreement_versions` hold versioned JSON terms and both parties' acceptance timestamps.
- `project_milestones` and `project_updates` track work after the latest agreement version has been accepted.
- `project_change_requests` records member-to-member disputes and scope changes; accepting a scope change appends a new agreement version.
- `organizations`, `organization_members`, `organization_freelancers`, and `organization_handovers` preserve committee continuity and private collaboration records.
- `project_reviews` and `project_skill_endorsements` store participant feedback tied to completed projects. `content_reports` and `moderation_actions` support reporting and administrator review.
- `notification_preferences` stores each user's in-app delivery choice; email delivery remains disabled until an email provider is configured.
- `projects.organization_id` associates projects with organizations and requires organization-management permission when set.

Apply migrations `001` through `006` in order. Migrations `004`–`006` have not been applied to a configured Supabase database in this workspace; validate them on a development project before production use.
