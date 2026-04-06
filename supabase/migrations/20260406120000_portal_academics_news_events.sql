-- Postgraduate portal: academics subdivisions, admission pages, news, events, services.
-- RLS: public read, admin full access.

-- ─── Staff functional CV (4 JSON sections) ───────────────────────────────────
CREATE TABLE public.staff_cv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  department TEXT,
  photo_url TEXT,
  personal_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_cv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read staff_cv" ON public.staff_cv FOR SELECT USING (true);
CREATE POLICY "Admins manage staff_cv" ON public.staff_cv
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_staff_cv_updated_at
  BEFORE UPDATE ON public.staff_cv FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Study plans (distinct from schedules calendar) ─────────────────────────
CREATE TABLE public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  program TEXT,
  description TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read study_plans" ON public.study_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage study_plans" ON public.study_plans
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON public.study_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Research plans (guidelines / milestones) ──────────────────────────────
CREATE TABLE public.research_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  milestones TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read research_plans" ON public.research_plans FOR SELECT USING (true);
CREATE POLICY "Admins manage research_plans" ON public.research_plans
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_research_plans_updated_at
  BEFORE UPDATE ON public.research_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Research database (curated entries) ─────────────────────────────────────
CREATE TABLE public.research_database (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  authors TEXT,
  year INTEGER,
  keywords TEXT,
  abstract TEXT,
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_database ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read research_database" ON public.research_database FOR SELECT USING (true);
CREATE POLICY "Admins manage research_database" ON public.research_database
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_research_database_updated_at
  BEFORE UPDATE ON public.research_database FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Admission page blocks (How to apply / Required documents) ───────────────
CREATE TABLE public.admission_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL CHECK (section IN ('how_to_apply', 'required_documents')),
  title TEXT NOT NULL,
  body TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admission_docs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read admission_docs" ON public.admission_docs FOR SELECT USING (true);
CREATE POLICY "Admins manage admission_docs" ON public.admission_docs
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_admission_docs_updated_at
  BEFORE UPDATE ON public.admission_docs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── News ───────────────────────────────────────────────────────────────────
CREATE TABLE public.news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read news_posts" ON public.news_posts FOR SELECT USING (true);
CREATE POLICY "Admins manage news_posts" ON public.news_posts
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Events (defenses, announcements, etc.) ──────────────────────────────────
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'announcement' CHECK (event_type IN ('defense', 'seminar', 'announcement', 'deadline', 'other')),
  description TEXT,
  starts_at TIMESTAMPTZ,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── Services (iThenticate, EKB) ─────────────────────────────────────────────
CREATE TABLE public.service_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug IN ('ithenticate', 'ekb')),
  title TEXT NOT NULL,
  description TEXT,
  primary_url TEXT,
  info_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_offerings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read service_offerings" ON public.service_offerings FOR SELECT USING (true);
CREATE POLICY "Admins manage service_offerings" ON public.service_offerings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_service_offerings_updated_at
  BEFORE UPDATE ON public.service_offerings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.service_offerings (slug, title, description, primary_url, info_url)
VALUES
  (
    'ithenticate',
    'iThenticate / Turnitin',
    'Plagiarism detection and similarity checking for theses and research papers. Access is typically provided through the postgraduate office.',
    'https://www.turnitin.com/',
    NULL
  ),
  (
    'ekb',
    'Egyptian Knowledge Bank (EKB)',
    'National digital library and research resources for Egyptian universities.',
    'https://www.ekb.eg/',
    NULL
  )
ON CONFLICT (slug) DO NOTHING;
