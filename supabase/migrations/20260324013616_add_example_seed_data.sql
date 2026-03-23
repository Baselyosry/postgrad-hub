-- Seed migration: Add example rows for every table/column.
-- Run with: supabase db push (or apply via Supabase Dashboard)
-- Note: user_roles and student_submissions reference auth.users; those are handled conditionally.

-- =============================================================================
-- ADMISSIONS (degree_type, title, requirements JSONB, documents JSONB)
-- =============================================================================
INSERT INTO public.admissions (degree_type, title, requirements, documents)
VALUES
  (
    'master',
    'Master of Science (MSc) - General Requirements',
    '[
      {"item": "Bachelor degree or equivalent (minimum 2:2 or 60% average)"},
      {"item": "English proficiency: IELTS 6.5 or TOEFL 550"},
      {"item": "Relevant field of study or work experience"}
    ]'::jsonb,
    '[
      {"name": "Academic transcripts", "required": true},
      {"name": "Two letters of recommendation", "required": true},
      {"name": "Statement of purpose (500-1000 words)", "required": true},
      {"name": "CV / Résumé", "required": true}
    ]'::jsonb
  ),
  (
    'phd',
    'Doctor of Philosophy (PhD) - General Requirements',
    '[
      {"item": "Master degree or equivalent in relevant field"},
      {"item": "English proficiency: IELTS 7.0 or TOEFL 600"},
      {"item": "Research proposal aligned with department expertise"},
      {"item": "Evidence of research capability (publications, thesis abstract)"}
    ]'::jsonb,
    '[
      {"name": "Master transcripts and diploma", "required": true},
      {"name": "Three letters of recommendation", "required": true},
      {"name": "Research proposal (2000-3000 words)", "required": true},
      {"name": "Writing sample or published paper", "required": false}
    ]'::jsonb
  );

-- =============================================================================
-- INQUIRIES (name, email, message, is_read)
-- =============================================================================
INSERT INTO public.inquiries (name, email, message, is_read)
VALUES
  ('Alice Johnson', 'alice.johnson@example.com', 'I am interested in the MSc programme in Computer Science. Could you provide more details about the application deadline for the 2026 intake?', false),
  ('Bob Williams', 'bob.williams@example.com', 'I would like to inquire about the PhD supervision process and whether I need to contact potential supervisors before applying.', true),
  ('Carol Davis', 'carol.davis@example.com', 'Hello, I am an international student. What documents are required for the student visa application once I am admitted?', false);

-- =============================================================================
-- RESEARCH_ARCHIVE (title, author, year, type, department, abstract, file_url)
-- =============================================================================
INSERT INTO public.research_archive (title, author, year, type, department, abstract, file_url)
VALUES
  (
    'Machine Learning Applications in Healthcare',
    'Dr. Jane Smith',
    2024,
    'phd',
    'Computer Science',
    'This thesis explores the application of deep learning models for medical image analysis, focusing on early detection of cardiovascular conditions from X-ray and MRI datasets. The research demonstrates a 15% improvement over traditional methods in clinical validation.',
    NULL
  ),
  (
    'Sustainable Urban Planning in Sub-Saharan Africa',
    'John Okello',
    2023,
    'master',
    'Environmental Science',
    'A comparative study of urban planning policies across five African cities, examining the role of green infrastructure in mitigating climate change and improving quality of life for residents.',
    NULL
  ),
  (
    'Antimicrobial Resistance in Hospital Settings',
    'Dr. Mary Chen',
    2024,
    'research',
    'Medical Sciences',
    'Epidemiological analysis of antibiotic resistance patterns in a tertiary hospital over five years, with recommendations for stewardship programmes.',
    NULL
  );

-- =============================================================================
-- SCHEDULES (title, category, date_info, description, file_url)
-- category: 'study' | 'exams' | 'research_plan'
-- =============================================================================
INSERT INTO public.schedules (title, category, date_info, description, file_url)
VALUES
  (
    'MSc Coursework Timeline 2025-26',
    'study',
    'September 2025 - June 2026',
    'Semester-by-semester breakdown of core and elective modules for MSc students.',
    NULL
  ),
  (
    'Final Examinations - Semester 1',
    'exams',
    'January 15-26, 2026',
    'Timetable for end-of-semester written examinations. Room allocations will be posted one week before exams.',
    NULL
  ),
  (
    'PhD Research Proposal Defence Deadlines',
    'research_plan',
    'March 2026 / September 2026',
    'Students must submit their research proposal and defend within 12 months of enrolment. Two intake windows per year.',
    NULL
  );

-- =============================================================================
-- TEMPLATES (title, category, description, file_size, file_url)
-- file_url is NOT NULL; use placeholder URLs until real files are uploaded to storage
-- Replace with actual Supabase Storage URLs (e.g. /documents/templates/proposal.pdf) when ready
-- =============================================================================
INSERT INTO public.templates (title, category, description, file_size, file_url)
VALUES
  (
    'Research Proposal Template',
    'general',
    'Standard template for PhD and Master research proposals. Includes sections for objectives, methodology, and timeline.',
    '85 KB',
    'https://example.com/documents/proposal-template.pdf'
  ),
  (
    'Thesis Title Page',
    'thesis',
    'University-approved title page format for final thesis submission.',
    '12 KB',
    'https://example.com/documents/title-page.docx'
  ),
  (
    'Progress Report Form',
    'administrative',
    'Required biannual progress report for PhD candidates.',
    '42 KB',
    'https://example.com/documents/progress-report.pdf'
  );

-- =============================================================================
-- STUDENT_SUMISSIONS (requires user_id from auth.users)
-- Only inserts if at least one user exists in auth.users
-- =============================================================================
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.student_submissions (user_id, title, description, degree_type, department, abstract, status)
    VALUES (
      first_user_id,
      'Example Thesis Proposal - Neural Networks',
      'A sample research proposal exploring applications of neural networks in natural language processing for low-resource languages.',
      'master',
      'Computer Science',
      'This abstract demonstrates the expected format and length for student submission abstracts.',
      'pending'
    );
  END IF;
END $$;

-- =============================================================================
-- user_roles: Not seeded here. Admins must be assigned manually via:
--   INSERT INTO public.user_roles (user_id, role) VALUES ('<auth.users.id>', 'admin');
-- Or via Supabase Dashboard > Authentication > Users, then SQL Editor.
-- =============================================================================
