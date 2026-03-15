
-- Add new columns to plans table for extended limits and feature flags
ALTER TABLE public.plans 
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS max_units integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS max_users integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS max_clients integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS max_services integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS trial_days integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS description text;

-- Add RLS policy for master to manage plans
CREATE POLICY "Master can insert plans" ON public.plans FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'master'::app_role));
CREATE POLICY "Master can update plans" ON public.plans FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'master'::app_role));
CREATE POLICY "Master can delete plans" ON public.plans FOR DELETE TO authenticated USING (has_role(auth.uid(), 'master'::app_role));
