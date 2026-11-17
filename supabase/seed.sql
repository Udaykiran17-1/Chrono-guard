-- ============================================================================
-- SkillBridge Database Seed: seed.sql
-- Description: Starter data for universities, departments, and skills
-- Target: Supabase / PostgreSQL 15+
-- ============================================================================

-- 1. Default University Entry
-- NOTE: email_domain is set to NULL so that any email works during local testing.
-- To restrict to a specific campus later, execute:
-- UPDATE public.universities SET email_domain = 'apex.edu' WHERE short_name = 'Apex Tech';
INSERT INTO public.universities (id, name, short_name, email_domain, is_active)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Apex Institute of Technology & Sciences',
  'Apex Tech',
  NULL, -- Set to 'apex.edu' for strict university domain enforcement
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  is_active = EXCLUDED.is_active;

-- 2. Common Departments for the Default University
INSERT INTO public.departments (id, university_id, name)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Computer Science & Engineering'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Electronics & Communication Engineering'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Mechanical Engineering'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Design & Digital Media Arts'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Business Administration & Management'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Media & Communications')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- 3. Approved Starter Skills

-- 3.1 Technical Skills
INSERT INTO public.skills (name, category, is_approved)
VALUES
  ('C++', 'Technical', true),
  ('Python', 'Technical', true),
  ('Java', 'Technical', true),
  ('JavaScript', 'Technical', true),
  ('TypeScript', 'Technical', true),
  ('React', 'Technical', true),
  ('Node.js', 'Technical', true),
  ('SQL & Database Design', 'Technical', true),
  ('UI/UX Design', 'Technical', true),
  ('Machine Learning & AI', 'Technical', true),
  ('Web Development', 'Technical', true),
  ('Mobile App Development', 'Technical', true),
  ('Cloud & DevOps (Docker/AWS)', 'Technical', true),
  ('Cybersecurity & Ethical Hacking', 'Technical', true),
  ('Embedded Systems & IoT', 'Technical', true)
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  is_approved = EXCLUDED.is_approved;

-- 3.2 Creative Skills
INSERT INTO public.skills (name, category, is_approved)
VALUES
  ('Graphic Design', 'Creative', true),
  ('Video Editing & Post-Production', 'Creative', true),
  ('Motion Graphics', 'Creative', true),
  ('Photography', 'Creative', true),
  ('Content Writing & Copywriting', 'Creative', true),
  ('3D Modeling & Animation', 'Creative', true),
  ('Illustration & Digital Art', 'Creative', true),
  ('Audio Production & Sound Design', 'Creative', true),
  ('Brand Identity Design', 'Creative', true)
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  is_approved = EXCLUDED.is_approved;

-- 3.3 Management & Other Skills
INSERT INTO public.skills (name, category, is_approved)
VALUES
  ('Public Speaking & Pitching', 'Management & Other', true),
  ('Event Management', 'Management & Other', true),
  ('Presentation Design', 'Management & Other', true),
  ('Digital Marketing & SEO', 'Management & Other', true),
  ('Project Management', 'Management & Other', true),
  ('Social Media Strategy', 'Management & Other', true),
  ('Sponsorship & Outreach', 'Management & Other', true),
  ('Technical Writing', 'Management & Other', true)
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  is_approved = EXCLUDED.is_approved;
