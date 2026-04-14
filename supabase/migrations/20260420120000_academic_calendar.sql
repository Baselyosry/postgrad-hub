-- Academic calendar PDFs (public postgraduate hub). RLS: public read, admin full access.

CREATE TABLE public.academic_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.academic_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read academic_calendar" ON public.academic_calendar FOR SELECT USING (true);
CREATE POLICY "Admins manage academic_calendar" ON public.academic_calendar
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_academic_calendar_updated_at
  BEFORE UPDATE ON public.academic_calendar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.academic_calendar IS 'Official academic year / term calendar PDFs for the PG hub public page.';
