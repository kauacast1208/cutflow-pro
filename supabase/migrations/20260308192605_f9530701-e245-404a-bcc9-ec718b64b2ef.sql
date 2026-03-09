
CREATE TABLE public.professional_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday >= 0 AND weekday <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(professional_id, weekday)
);

ALTER TABLE public.professional_availability ENABLE ROW LEVEL SECURITY;

-- Anyone can view availability (needed for public booking)
CREATE POLICY "Anyone can view professional availability"
  ON public.professional_availability
  FOR SELECT
  USING (true);

-- Owners can manage availability
CREATE POLICY "Owners can insert professional availability"
  ON public.professional_availability
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM professionals p
    JOIN barbershops b ON b.id = p.barbershop_id
    WHERE p.id = professional_availability.professional_id
    AND b.owner_id = auth.uid()
  ));

CREATE POLICY "Owners can update professional availability"
  ON public.professional_availability
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM professionals p
    JOIN barbershops b ON b.id = p.barbershop_id
    WHERE p.id = professional_availability.professional_id
    AND b.owner_id = auth.uid()
  ));

CREATE POLICY "Owners can delete professional availability"
  ON public.professional_availability
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM professionals p
    JOIN barbershops b ON b.id = p.barbershop_id
    WHERE p.id = professional_availability.professional_id
    AND b.owner_id = auth.uid()
  ));
