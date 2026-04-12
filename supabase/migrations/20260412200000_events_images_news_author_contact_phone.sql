-- Event cards: hero image + optional display time string.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "time" TEXT;

-- News cards: byline + featured styling.
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE public.news_posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Contact form (split layout): optional phone; subject reserved for future / admin-only use.
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS subject TEXT;
