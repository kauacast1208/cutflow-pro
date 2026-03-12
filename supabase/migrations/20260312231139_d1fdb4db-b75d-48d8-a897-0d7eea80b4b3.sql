-- Remove anon SELECT on services table (exposes pricing across all tenants)
-- Public booking should use edge functions or scoped queries
DROP POLICY IF EXISTS "Anon can read services for public booking" ON public.services;
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;
DROP POLICY IF EXISTS "Public services are viewable" ON public.services;

-- Create a more restrictive policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
CREATE POLICY "Authenticated users can view services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Remove anon SELECT on professional_availability table (exposes schedules)
DROP POLICY IF EXISTS "Anon can read availability for public booking" ON public.professional_availability;
DROP POLICY IF EXISTS "Anyone can view availability" ON public.professional_availability;
DROP POLICY IF EXISTS "Public availability is viewable" ON public.professional_availability;

-- Create a more restrictive policy for authenticated users
DROP POLICY IF EXISTS "Authenticated users can view availability" ON public.professional_availability;
CREATE POLICY "Authenticated users can view availability"
  ON public.professional_availability
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM professionals p
    WHERE p.id = professional_availability.professional_id
    AND p.barbershop_id = get_user_barbershop_id(auth.uid())
  ));

-- Add policy for public booking via edge function (service role)
-- The public-booking edge function uses service role, so it bypasses RLS
-- No anon policy needed since edge function handles public reads
