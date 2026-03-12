-- Fix the broken "OR true" in professionals authenticated SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view professionals" ON public.professionals;
CREATE POLICY "Authenticated users can view professionals"
  ON public.professionals
  FOR SELECT
  TO authenticated
  USING (barbershop_id = get_user_barbershop_id(auth.uid()));