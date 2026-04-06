-- Replace bulky / duplicate demo rows with one curated set for UI + Admin dashboard.
-- Preserves service_offerings (static slugs); refreshes copy in place.
-- Safe to re-run philosophy: DELETE broad demo patterns then INSERT known keys only where needed.

-- ─── Remove redundant legacy seed rows (from older example migration) ─────────
DELETE FROM public.student_submissions
WHERE title = 'Example Thesis Proposal - Neural Networks';

DELETE FROM public.inquiries;

DELETE FROM public.research_archive;

DELETE FROM public.schedules;

DELETE FROM public.templates;

DELETE FROM public.admissions;

-- New portal tables (may be empty on first run)
DELETE FROM public.admission_docs;
DELETE FROM public.news_posts;
DELETE FROM public.events;
DELETE FROM public.study_plans;
DELETE FROM public.research_plans;
DELETE FROM public.research_database;

-- Staff CV: single clean showcase set (replace any existing demo rows)
DELETE FROM public.staff_cv;

-- ─── Admissions (2 rows: master + PhD) ───────────────────────────────────────
INSERT INTO public.admissions (degree_type, title, requirements, documents)
VALUES
  (
    'master',
    'MSc — General requirements',
    '[
      {"item": "Bachelor degree (≥ 2:2 or 60%)"},
      {"item": "English: IELTS 6.5 or equivalent"},
      {"item": "Background aligned with the programme"}
    ]'::jsonb,
    '[
      {"name": "Certified transcripts", "required": true},
      {"name": "Two recommendation letters", "required": true},
      {"name": "Statement of purpose", "required": true},
      {"name": "CV", "required": true}
    ]'::jsonb
  ),
  (
    'phd',
    'PhD — General requirements',
    '[
      {"item": "Relevant Master degree"},
      {"item": "English: IELTS 7.0 or equivalent"},
      {"item": "Approved research proposal"},
      {"item": "Supervisor acceptance"}
    ]'::jsonb,
    '[
      {"name": "Master transcripts & diploma", "required": true},
      {"name": "Three recommendation letters", "required": true},
      {"name": "Research proposal (2000–3000 words)", "required": true},
      {"name": "Publications list (if any)", "required": false}
    ]'::jsonb
  );

-- ─── Inquiries (1 unread — enough for dashboard demo) ─────────────────────────
INSERT INTO public.inquiries (name, email, message, is_read)
VALUES
  (
    'Postgraduate Office (demo)',
    'pg.demo@example.com',
    'This is a sample inquiry. Replace with real messages from the contact form.',
    false
  );

-- ─── Research archive / thesis list (2 items) ────────────────────────────────
INSERT INTO public.research_archive (title, author, year, type, department, abstract, file_url)
VALUES
  (
    'Deep Learning for ECG Arrhythmia Detection',
    'Dr. Youssef Nabil',
    2024,
    'phd',
    'Computer Science',
    'End-to-end CNN and transformer models evaluated on a multi-site ECG corpus; thesis includes clinical validation protocol.',
    NULL
  ),
  (
    'Green Roofs and Urban Heat Islands — Cairo Case Study',
    'Layla Hassan',
    2023,
    'master',
    'Environmental Engineering',
    'Measured surface temperature and runoff across pilot sites; policy recommendations for new developments.',
    NULL
  );

-- ─── Schedules (one per category) ────────────────────────────────────────────
INSERT INTO public.schedules (title, category, date_info, description, file_url)
VALUES
  (
    'MSc coursework calendar (demo)',
    'study',
    'Sept 2025 – Jun 2026',
    'Illustrative semester timeline for postgraduate coursework.',
    NULL
  ),
  (
    'Semester examinations window (demo)',
    'exams',
    'Jan 2026',
    'Placeholder exam period; rooms announced two weeks prior.',
    NULL
  ),
  (
    'PhD proposal defence windows (demo)',
    'research_plan',
    'Mar / Sep each year',
    'Two annual windows for proposal submission and defence scheduling.',
    NULL
  );

-- ─── Templates (2 items) ─────────────────────────────────────────────────────
INSERT INTO public.templates (title, category, description, file_size, file_url)
VALUES
  (
    'Research proposal template (demo)',
    'general',
    'Section headings and word-count guidance for MSc/PhD proposals.',
    '—',
    'https://example.com/demo/proposal-template.pdf'
  ),
  (
    'Thesis title page (demo)',
    'thesis',
    'University-style title page; replace URL after uploading to Storage.',
    '—',
    'https://example.com/demo/title-page.docx'
  );

-- ─── Staff CV (featured faculty — former landing-page spotlight: Eman, Khaled, Alaa) ──
-- Staff photos: public/staff/eman-karam.png, khaled-abdelslame.png, alaa-zaghloul.png in the web app.
INSERT INTO public.staff_cv (
  display_name, department, photo_url, personal_data, qualifications, experience, skills, sort_order
)
VALUES
  (
    'Dr. Eman Karam',
    'Computer Science',
    '/staff/eman-karam.png',
    '{
      "email": "e.karam@must.edu.eg",
      "academic_title": "Professor",
      "bio": "Featured academic staff in postgraduate studies; research supervision and graduate programme leadership in computer science."
    }'::jsonb,
    '[
      {"degree":"PhD, Computer Science","institution":"MUST","year":"2005"},
      {"degree":"MSc, Computer Science","institution":"MUST","year":"2000"}
    ]'::jsonb,
    '[
      {"role":"Faculty & postgraduate supervisor","organization":"MUST, Computer Science","period":"2005–present","details":"MSc and PhD supervision, thesis examination committees, and departmental research coordination."}
    ]'::jsonb,
    '["Postgraduate supervision","Computer science research","Thesis examination","Curriculum development"]'::jsonb,
    0
  ),
  (
    'Dr. Khaled Abdelslame',
    'Computer Science',
    '/staff/khaled-abdelslame.png',
    '{
      "email": "k.abdelslame@must.edu.eg",
      "academic_title": "Professor",
      "bio": "Featured academic staff in postgraduate studies; supports MSc and PhD candidates in computer science."
    }'::jsonb,
    '[
      {"degree":"PhD, Computer Science","institution":"MUST","year":"2004"},
      {"degree":"MSc, Computer Science","institution":"MUST","year":"1999"}
    ]'::jsonb,
    '[
      {"role":"Faculty & postgraduate supervisor","organization":"MUST, Computer Science","period":"2004–present","details":"Graduate advising, research projects, and defence panels for postgraduate programmes."}
    ]'::jsonb,
    '["Graduate advising","Computer science","Research projects","PhD committees"]'::jsonb,
    1
  ),
  (
    'Dr. Alaa Zaghloul',
    'Computer Science',
    '/staff/alaa-zaghloul.png',
    '{
      "email": "a.zaghloul@must.edu.eg",
      "academic_title": "Professor",
      "bio": "Featured academic staff in postgraduate studies; mentors graduate researchers and contributes to CS postgraduate activities."
    }'::jsonb,
    '[
      {"degree":"PhD, Computer Science","institution":"MUST","year":"2003"},
      {"degree":"MSc, Computer Science","institution":"MUST","year":"1998"}
    ]'::jsonb,
    '[
      {"role":"Faculty & postgraduate supervisor","organization":"MUST, Computer Science","period":"2003–present","details":"Supervision of dissertations, graduate seminars, and collaboration with industry on applied CS topics."}
    ]'::jsonb,
    '["Dissertation supervision","Applied computing","Graduate seminars","Industry collaboration"]'::jsonb,
    2
  );

-- ─── Study plans ─────────────────────────────────────────────────────────────
INSERT INTO public.study_plans (title, program, description, file_url)
VALUES
  (
    'MSc Computer Science — study plan (demo)',
    'MSc Computer Science',
    'Year 1: core modules in algorithms, systems, and research methods. Year 2: electives + dissertation.',
    NULL
  ),
  (
    'PhD milestone overview (demo)',
    'PhD (all departments)',
    'Coursework (if required) → proposal → annual progress → thesis submission → defence.',
    NULL
  );

-- ─── Research plans ──────────────────────────────────────────────────────────
INSERT INTO public.research_plans (title, summary, milestones, file_url)
VALUES
  (
    'PhD proposal format & review (demo)',
    'Standard sections: background, aims, methods, ethics, timeline, references.',
    'Draft by month 6 → supervisor review → committee by month 9 → defence by month 12.',
    NULL
  ),
  (
    'MSc dissertation timeline (demo)',
    'Topic approval, literature review, methodology, data collection, writing, submission.',
    'Supervisor meetings every 2–4 weeks; submit final by programme deadline.',
    NULL
  );

-- ─── Research database (curated list) ───────────────────────────────────────
INSERT INTO public.research_database (title, authors, year, keywords, abstract, url)
VALUES
  (
    'Egyptian Knowledge Bank — portal',
    'EKB',
    2025,
    'library, journals, e-resources',
    'National gateway to subscribed journals and databases for Egyptian universities.',
    'https://www.ekb.eg/'
  ),
  (
    'WHO Antimicrobial Resistance Global Report (reference)',
    'WHO',
    2024,
    'AMR, policy, health',
    'Global synthesis used as background reading for medical PG literature reviews.',
    'https://www.who.int/teams/antimicrobial-resistance'
  ),
  (
    'Scopus search tips for systematic reviews',
    'Elsevier',
    NULL,
    'bibliometrics, systematic review',
    'Official guidance on queries, filters, and exports for thesis literature chapters.',
    'https://www.elsevier.com/solutions/scopus'
  );

-- ─── Admission page blocks ───────────────────────────────────────────────────
INSERT INTO public.admission_docs (section, title, body, sort_order, file_url)
VALUES
  (
    'how_to_apply',
    '1. Choose your programme',
    'Review MSc and PhD tracks under Admissions Hub, then note intake dates and language requirements.',
    0,
    NULL
  ),
  (
    'how_to_apply',
    '2. Prepare documents & apply',
    'Gather transcripts, recommendations, and statement of purpose. Submit through the official channel announced by the faculty.',
    1,
    NULL
  ),
  (
    'required_documents',
    'Core checklist (demo)',
    '- Certified degree certificates\n- Official transcripts\n- ID / passport copy\n- Language certificate (if applicable)\n- CV and recommendation letters',
    0,
    NULL
  );

-- ─── News ────────────────────────────────────────────────────────────────────
INSERT INTO public.news_posts (title, slug, excerpt, body, image_url, published_at)
VALUES
  (
    'Spring 2026 PG registration window (demo)',
    'spring-2026-registration-demo',
    'Illustrative announcement for the portal.',
    'This is sample news content. Admins can replace it with real dates and links from the News admin page.',
    NULL,
    now() - interval '2 days'
  ),
  (
    'Thesis formatting clinic — save the date (demo)',
    'thesis-formatting-clinic-demo',
    'Short session on title pages, references, and Turnitin submission.',
    'Demo post body: room and time TBA. Contact the postgraduate office for registration.',
    NULL,
    now() - interval '10 days'
  );

-- ─── Events ──────────────────────────────────────────────────────────────────
INSERT INTO public.events (title, event_type, description, starts_at, location)
VALUES
  (
    'PhD proposal defence — sample student (demo)',
    'defense',
    'Illustrative defence event for the Events page layout.',
    now() + interval '14 days',
    'Faculty PG Hall (demo)'
  ),
  (
    'Application deadline — January intake (demo)',
    'deadline',
    'Replace with your faculty''s real deadline.',
    now() + interval '45 days',
    'Online submission'
  ),
  (
    'Research methods seminar (demo)',
    'seminar',
    'Open to all PG students; demo entry.',
    now() + interval '7 days',
    'Building A — Room 101 (demo)'
  );

-- ─── Service offerings: keep rows, refresh static copy (no DELETE) ───────────
UPDATE public.service_offerings
SET
  title = 'iThenticate / Turnitin',
  description = 'Similarity checking for theses and dissertations. Access is arranged via the postgraduate office after supervisor approval.',
  primary_url = 'https://www.turnitin.com/',
  info_url = NULL,
  updated_at = now()
WHERE slug = 'ithenticate';

UPDATE public.service_offerings
SET
  title = 'Egyptian Knowledge Bank (EKB)',
  description = 'National subscription to journals, e-books, and databases for MUST students and staff.',
  primary_url = 'https://www.ekb.eg/',
  info_url = NULL,
  updated_at = now()
WHERE slug = 'ekb';
