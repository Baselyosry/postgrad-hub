-- Portal: regulations track, research validation, staff scholar, services outlook,
-- thesis uploads, sample defense events.

-- ─── research_plans: regulation track ─────────────────────────────────────────
ALTER TABLE public.research_plans
  ADD COLUMN IF NOT EXISTS regulation_track TEXT;

UPDATE public.research_plans SET regulation_track = 'general' WHERE regulation_track IS NULL;

ALTER TABLE public.research_plans
  ALTER COLUMN regulation_track SET DEFAULT 'general',
  ALTER COLUMN regulation_track SET NOT NULL;

ALTER TABLE public.research_plans DROP CONSTRAINT IF EXISTS research_plans_regulation_track_check;

ALTER TABLE public.research_plans
  ADD CONSTRAINT research_plans_regulation_track_check CHECK (regulation_track IN ('masters', 'phd', 'general'));

COMMENT ON COLUMN public.research_plans.regulation_track IS 'Which regulations page lists this plan: masters, phd, or general.';

-- ─── staff_cv: Google Scholar ─────────────────────────────────────────────────
ALTER TABLE public.staff_cv
  ADD COLUMN IF NOT EXISTS google_scholar_url TEXT;

COMMENT ON COLUMN public.staff_cv.google_scholar_url IS 'Optional public Google Scholar profile URL.';

-- ─── research_database: publication place + stricter data ─────────────────────
ALTER TABLE public.research_database
  ADD COLUMN IF NOT EXISTS publication_place TEXT;

UPDATE public.research_database
SET
  authors = COALESCE(NULLIF(trim(authors), ''), 'Unknown'),
  year = COALESCE(year, EXTRACT(YEAR FROM created_at)::int, 2026),
  abstract = COALESCE(NULLIF(trim(abstract), ''), '—'),
  publication_place = COALESCE(NULLIF(trim(publication_place), ''), 'Not specified')
WHERE true;

UPDATE public.research_database SET year = 2026 WHERE year IS NULL;

UPDATE public.research_database
SET url = 'https://must.edu.eg/'
WHERE (url IS NULL OR trim(url) = '')
  AND (pdf_url IS NULL OR trim(pdf_url) = '');

UPDATE public.research_database
SET pdf_url = url
WHERE (pdf_url IS NULL OR trim(pdf_url) = '')
  AND url IS NOT NULL
  AND trim(url) <> '';

ALTER TABLE public.research_database
  ALTER COLUMN authors SET NOT NULL,
  ALTER COLUMN year SET NOT NULL,
  ALTER COLUMN abstract SET NOT NULL,
  ALTER COLUMN publication_place SET NOT NULL;

ALTER TABLE public.research_database
  DROP CONSTRAINT IF EXISTS research_database_link_check;

ALTER TABLE public.research_database
  ADD CONSTRAINT research_database_link_check CHECK (
    (url IS NOT NULL AND length(trim(url)) > 0)
    OR (pdf_url IS NOT NULL AND length(trim(pdf_url)) > 0)
  );

-- ─── service_offerings: allow outlook slug ───────────────────────────────────
ALTER TABLE public.service_offerings DROP CONSTRAINT IF EXISTS service_offerings_slug_check;

ALTER TABLE public.service_offerings
  ADD CONSTRAINT service_offerings_slug_check CHECK (slug IN ('ithenticate', 'ekb', 'outlook'));

INSERT INTO public.service_offerings (slug, title, description, primary_url, info_url)
VALUES (
  'outlook',
  'Outlook Email (MUST)',
  'University email via Microsoft 365 / Outlook. Sign in with your MUST credentials.',
  'https://outlook.office.com/',
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  primary_url = EXCLUDED.primary_url;

-- ─── thesis document uploads (separate from student_submissions applications) ─
CREATE TABLE IF NOT EXISTS public.thesis_upload_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('proposal', 'thesis')),
  thesis_name TEXT NOT NULL,
  supervisor_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.thesis_upload_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own thesis_upload_submissions" ON public.thesis_upload_submissions;
DROP POLICY IF EXISTS "Users select own thesis_upload_submissions" ON public.thesis_upload_submissions;
DROP POLICY IF EXISTS "Admins select all thesis_upload_submissions" ON public.thesis_upload_submissions;
DROP POLICY IF EXISTS "Admins update thesis_upload_submissions" ON public.thesis_upload_submissions;

CREATE POLICY "Users insert own thesis_upload_submissions"
  ON public.thesis_upload_submissions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users select own thesis_upload_submissions"
  ON public.thesis_upload_submissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins select all thesis_upload_submissions"
  ON public.thesis_upload_submissions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update thesis_upload_submissions"
  ON public.thesis_upload_submissions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_thesis_upload_submissions_updated_at ON public.thesis_upload_submissions;
CREATE TRIGGER update_thesis_upload_submissions_updated_at
  BEFORE UPDATE ON public.thesis_upload_submissions FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Sample defense events (PG hub); skip rows that already exist by title ──
INSERT INTO public.events (title, event_type, description, starts_at, location, "time")
SELECT v.title, v.event_type, v.description, v.starts_at, v.location, v.slot
FROM (
  VALUES
    (
      'PhD thesis defense — Computer Science (discussion)',
      'defense',
      'Public defense session: advanced topics in distributed systems and graduate research discussion.'::text,
      (timezone('utc', now()) - interval '21 days'),
      'MUST — Faculty of Computer Science, Hall A',
      '10:00'
    ),
    (
      'Master''s thesis defense — Engineering (discussion)',
      'defense',
      'Master''s candidate defense and committee Q&A; prior session materials available from the postgraduate office.'::text,
      (timezone('utc', now()) - interval '14 days'),
      'MUST — Engineering Building, Room 204',
      '11:30'
    ),
    (
      'Research proposal defense — Interdisciplinary panel',
      'defense',
      'Proposal defense and methodology discussion for doctoral candidates; attendance by invitation.'::text,
      (timezone('utc', now()) - interval '7 days'),
      'MUST — Postgraduate Studies, Seminar Room',
      '09:00'
    )
) AS v(title, event_type, description, starts_at, location, slot)
WHERE NOT EXISTS (SELECT 1 FROM public.events e WHERE e.title = v.title);

-- ─── Storage: allow authenticated students to upload thesis-submissions PDFs ─
DROP POLICY IF EXISTS "Authenticated upload thesis-submissions PDFs" ON storage.objects;

CREATE POLICY "Authenticated upload thesis-submissions PDFs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (name LIKE 'thesis-submissions/%')
  );
