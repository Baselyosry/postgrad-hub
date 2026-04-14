-- Idempotent: adds research_plans.regulation_track if the project never applied 20260414120000_portal_routes_schema.sql.

ALTER TABLE public.research_plans
  ADD COLUMN IF NOT EXISTS regulation_track TEXT;

UPDATE public.research_plans SET regulation_track = 'general' WHERE regulation_track IS NULL;

ALTER TABLE public.research_plans
  ALTER COLUMN regulation_track SET DEFAULT 'general';

ALTER TABLE public.research_plans
  ALTER COLUMN regulation_track SET NOT NULL;

ALTER TABLE public.research_plans DROP CONSTRAINT IF EXISTS research_plans_regulation_track_check;

ALTER TABLE public.research_plans
  ADD CONSTRAINT research_plans_regulation_track_check CHECK (regulation_track IN ('masters', 'phd', 'general'));

COMMENT ON COLUMN public.research_plans.regulation_track IS 'Which surface lists this plan: masters or phd (Study plan), or general (Research plan page).';
