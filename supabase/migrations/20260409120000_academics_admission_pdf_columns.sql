-- PDF attachments for Academics & Admission (Changes.pdf submenu scope)
ALTER TABLE public.staff_cv ADD COLUMN IF NOT EXISTS cv_pdf_url TEXT;
ALTER TABLE public.research_database ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.admissions ADD COLUMN IF NOT EXISTS brochure_pdf_url TEXT;

COMMENT ON COLUMN public.staff_cv.cv_pdf_url IS 'Public URL to downloadable CV PDF (e.g. Supabase Storage).';
COMMENT ON COLUMN public.research_database.pdf_url IS 'Optional PDF attachment; external link may remain in url.';
COMMENT ON COLUMN public.admissions.brochure_pdf_url IS 'Programme brochure / requirements PDF for the admissions hub.';
