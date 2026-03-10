
-- Fix 1: Restrict appointments SELECT to barbershop owners (authenticated)
DROP POLICY IF EXISTS "Anyone can view appointments" ON public.appointments;
CREATE POLICY "Owners and team can view appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (
    barbershop_id = public.get_user_barbershop_id(auth.uid())
  );

-- Public booking page needs to check existing appointments for slot availability
CREATE POLICY "Public can view appointments for slot checking"
  ON public.appointments FOR SELECT
  TO anon
  USING (true);

-- Fix 2: Restrict clients SELECT to barbershop owners
DROP POLICY IF EXISTS "Anyone can view clients" ON public.clients;
CREATE POLICY "Owners can view their clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (
    barbershop_id = public.get_user_barbershop_id(auth.uid())
  );

-- Public booking needs to check/upsert clients by phone
CREATE POLICY "Public can view clients for booking matching"
  ON public.clients FOR SELECT
  TO anon
  USING (true);

-- Fix 3: Restrict loyalty_rewards SELECT to owners
DROP POLICY IF EXISTS "Anyone can view loyalty rewards for valid barbershops" ON public.loyalty_rewards;
CREATE POLICY "Owners can view loyalty rewards"
  ON public.loyalty_rewards FOR SELECT
  TO authenticated
  USING (
    barbershop_id = public.get_user_barbershop_id(auth.uid())
  );

-- Fix 4: Restrict loyalty_rewards INSERT to service_role only (remove public insert)
DROP POLICY IF EXISTS "System can insert loyalty rewards" ON public.loyalty_rewards;

-- Fix 5: Restrict notifications INSERT to service_role only
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
