
-- 1. Remove anon SELECT on barbershops base table (exposes owner_id)
-- Public booking already uses barbershops_public view
DROP POLICY IF EXISTS "Anon can read barbershops for public booking" ON public.barbershops;

-- 2. Remove anon SELECT on professionals base table (exposes user_id)
-- Public booking already uses professionals_public view
DROP POLICY IF EXISTS "Anon can read professionals for public booking" ON public.professionals;

-- 3. Remove anon SELECT on blocked_times base table (exposes reason)
-- Public booking already uses blocked_times_public view
DROP POLICY IF EXISTS "Anon can read blocked times for public booking" ON public.blocked_times;

-- 4. Scope services authenticated SELECT to user's barbershop
DROP POLICY IF EXISTS "Authenticated users can view services" ON public.services;
CREATE POLICY "Authenticated users can view services"
  ON public.services
  FOR SELECT
  TO authenticated
  USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- 5. Scope professional_availability authenticated SELECT to user's barbershop
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
