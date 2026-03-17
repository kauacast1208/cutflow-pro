
CREATE TABLE public.enterprise_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_interest text NOT NULL,
  name text NOT NULL,
  whatsapp text NOT NULL,
  city text NOT NULL,
  barbers_count integer NOT NULL DEFAULT 1,
  units_count integer NOT NULL DEFAULT 1,
  monthly_revenue text,
  main_challenge text,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.enterprise_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert leads"
ON public.enterprise_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Master can view all leads"
ON public.enterprise_leads
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Master can update leads"
ON public.enterprise_leads
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'master'::app_role));

CREATE POLICY "Master can delete leads"
ON public.enterprise_leads
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'master'::app_role));
