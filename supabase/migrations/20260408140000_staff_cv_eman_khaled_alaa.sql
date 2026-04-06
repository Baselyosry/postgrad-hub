-- Replace staff_cv demo rows with featured CS faculty (Eman Karam, Khaled Abdelslame, Alaa Zaghloul).
-- Use if an older consolidated seed already ran with different names.
-- Photos: public/staff/eman-karam.png, khaled-abdelslame.png, alaa-zaghloul.png in the web app.

DELETE FROM public.staff_cv;

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
