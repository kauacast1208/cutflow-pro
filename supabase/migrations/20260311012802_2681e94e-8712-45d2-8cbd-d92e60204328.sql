-- Tighten clients INSERT: require authentication
DROP POLICY IF EXISTS "Anyone can insert clients for valid barbershops" ON public.clients;
CREATE POLICY "Authenticated users can insert clients"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Tighten appointments INSERT: require authentication
DROP POLICY IF EXISTS "Anyone can create appointments for valid barbershops" ON public.appointments;
CREATE POLICY "Authenticated users can create appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (barbershop_id = get_user_barbershop_id(auth.uid()));
