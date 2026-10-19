ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS other_skills text;
