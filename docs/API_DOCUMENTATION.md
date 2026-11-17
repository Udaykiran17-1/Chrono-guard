# SkillBridge Service and Route Reference

The frontend uses domain services as its API layer. Supabase mode calls the database through its authenticated client; sandbox mode uses local storage where implemented.

## Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/register`, `/login`, `/forgot-password`, `/verify-email` | Authentication | Public |
| `/onboarding`, `/profile/me`, `/profile/edit` | Current-user setup and profile | Signed in |
| `/profile/:id`, `/talent` | Profiles and talent discovery | Signed in / public directory |
| `/projects`, `/projects/:id` | Marketplace and project brief | Public / signed in |
| `/projects/new`, `/projects/:id/edit` | Create or edit a project | Signed in / creator |
| `/projects/:id/applicants` | Review received proposals | Project creator |
| `/projects/:id/workspace` | Agreement, milestones, updates, reviews | Project members |
| `/organizations` | Organization, committee, records, handovers | Signed in with organization permissions |
| `/dashboard` | Student activity and notifications | Signed in |
| `/settings/notifications` | In-app notification preferences | Signed in |
| `/admin/reports` | Report queue and moderation actions | Platform administrator |

## Domain services

- `authService.js`: registration, login, password recovery, and local sandbox authentication.
- `profileService.js`: profile, skills, availability, portfolio, and media operations.
- `projectService.js`: project CRUD, saved projects, project state changes, and recommendations.
- `applicationService.js`: application submission, applicant lists, status changes, acceptance, and withdrawal.
- `notificationService.js`: read lists, unread counts, and read state. Cross-user events are inserted by database triggers in Supabase mode.
- `workspaceService.js`: agreement versions and acceptance, milestones, progress updates, completion, reviews, and content reports.
- `organizationService.js`: organization profile, membership, freelancer records, and committee handovers.

## Database operations

Use the SQL functions `accept_project_application`, `create_project_agreement`, `propose_agreement_revision`, and `accept_agreement_version` for the operations that need transaction integrity or controlled immutable writes. The corresponding migrations must be applied before those service calls can work against Supabase.
