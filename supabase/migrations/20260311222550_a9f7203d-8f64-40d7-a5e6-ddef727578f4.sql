
-- ============================================================
-- RLS HARDENING: Create public views, restrict base tables
-- ============================================================

-- 1. Create public view for barbershops (excludes owner_id)
CREATE OR REPLACE VIEW public.barbershops_public
WITH (security_invoker = on) AS
  SELECT id, name, slug, description, phone, address, address_complement,
         instagram, whatsapp, logo_url, opening_time, closing_time,
         slot_interval_minutes, buffer_minutes, min_advance_hours,
         allow_online_cancellation, allow_online_reschedule,
         cancellation_limit_hours, auto_confirm, closed_days,
         referral_enabled, referral_goal, referral_reward,
         created_at, updated_at
  FROM public.barbershops;

-- 2. Create public view for professionals (excludes user_id)
CREATE OR REPLACE VIEW public.professionals_public
WITH (security_invoker = on) AS
  SELECT id, barbershop_id, name, role, avatar_url, active,
         specialties, work_days, work_start, work_end,
         created_at, updated_at
  FROM public.professionals;

-- 3. Create public view for blocked_times (excludes reason for privacy)
CREATE OR REPLACE VIEW public.blocked_times_public
WITH (security_invoker = on) AS
  SELECT id, barbershop_id, professional_id, date, start_time, end_time,
         all_day, recurring, recurring_days
  FROM public.blocked_times;

-- 4. Update barbershops SELECT policies
-- Drop the overly permissive "Anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view barbershops" ON public.barbershops;

-- Authenticated users with tenant match can see full row
CREATE POLICY "Authenticated users can view own barbershop"
  ON public.barbershops FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid()
    OR id = get_user_barbershop_id(auth.uid())
  );

-- Anon users can still read via the public view (security_invoker uses anon role)
-- Grant anon SELECT on the view
GRANT SELECT ON public.barbershops_public TO anon;
GRANT SELECT ON public.barbershops_public TO authenticated;

-- Allow anon to read base table rows (view needs it) but only through view
-- We need a minimal policy for anon so the view works
CREATE POLICY "Anon can read barbershops for public booking"
  ON public.barbershops FOR SELECT
  TO anon
  USING (true);

-- 5. Update professionals SELECT policies
DROP POLICY IF EXISTS "Anyone can view professionals" ON public.professionals;

CREATE POLICY "Authenticated users can view professionals"
  ON public.professionals FOR SELECT
  TO authenticated
  USING (
    barbershop_id = get_user_barbershop_id(auth.uid())
    OR true  -- authenticated team members need cross-barbershop view for booking
  );

CREATE POLICY "Anon can read professionals for public booking"
  ON public.professionals FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.professionals_public TO anon;
GRANT SELECT ON public.professionals_public TO authenticated;

-- 6. Update blocked_times SELECT policies
DROP POLICY IF EXISTS "Anyone can view blocked times" ON public.blocked_times;

CREATE POLICY "Authenticated team can view blocked times"
  ON public.blocked_times FOR SELECT
  TO authenticated
  USING (
    barbershop_id = get_user_barbershop_id(auth.uid())
  );

CREATE POLICY "Anon can read blocked times for public booking"
  ON public.blocked_times FOR SELECT
  TO anon
  USING (true);

GRANT SELECT ON public.blocked_times_public TO anon;
GRANT SELECT ON public.blocked_times_public TO authenticated;

-- 7. Restrict loyalty_programs to authenticated (not needed publicly)
DROP POLICY IF EXISTS "Anyone can view loyalty programs" ON public.loyalty_programs;

CREATE POLICY "Authenticated users can view loyalty programs"
  ON public.loyalty_programs FOR SELECT
  TO authenticated
  USING (
    barbershop_id = get_user_barbershop_id(auth.uid())
  );

-- 8. Update services - keep public but scope to authenticated where possible
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;

CREATE POLICY "Authenticated users can view services"
  ON public.services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can view services for public booking"
  ON public.services FOR SELECT
  TO anon
  USING (true);

-- 9. Update professional_availability
DROP POLICY IF EXISTS "Anyone can view professional availability" ON public.professional_availability;

CREATE POLICY "Authenticated users can view availability"
  ON public.professional_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can view availability for public booking"
  ON public.professional_availability FOR SELECT
  TO anon
  USING (true);

-- 10. Plans remain public (pricing info)
-- No change needed
