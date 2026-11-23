CREATE TABLE public.wrappeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.wrappeds TO service_role;
ALTER TABLE public.wrappeds ENABLE ROW LEVEL SECURITY;