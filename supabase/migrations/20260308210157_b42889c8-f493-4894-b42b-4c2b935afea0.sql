
-- Add birth_date to clients
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS birth_date date;

-- Create automations config table
CREATE TABLE public.automations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  type text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(barbershop_id, type)
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage automations" ON public.automations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = automations.barbershop_id AND barbershops.owner_id = auth.uid())
  );
