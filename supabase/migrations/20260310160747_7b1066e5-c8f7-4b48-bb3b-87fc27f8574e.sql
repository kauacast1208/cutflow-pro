-- 1. Fix: Replace anon SELECT on clients with a restricted view for booking matching
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view clients for booking matching" ON public.clients;

-- Create a restricted policy that only allows anon to check existence by barbershop
-- The public booking page needs to match existing clients by phone/email within a specific barbershop
CREATE POLICY "Anon can view client names for booking" ON public.clients
  FOR SELECT TO anon
  USING (true);

-- Actually, the booking page needs to look up clients. Let's use a security definer function instead.
-- Drop the policy we just created
DROP POLICY IF EXISTS "Anon can view client names for booking" ON public.clients;

-- Create a function for booking matching that only returns minimal data
CREATE OR REPLACE FUNCTION public.match_client_for_booking(
  _barbershop_id uuid,
  _phone text DEFAULT NULL,
  _email text DEFAULT NULL
)
RETURNS TABLE(id uuid, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name FROM public.clients
  WHERE barbershop_id = _barbershop_id
    AND (
      (_phone IS NOT NULL AND phone = _phone)
      OR (_email IS NOT NULL AND email = _email)
    )
  LIMIT 1;
$$;

-- 2. Fix: Replace anon SELECT on appointments with restricted view for slot checking
DROP POLICY IF EXISTS "Public can view appointments for slot checking" ON public.appointments;

-- Create a function for slot availability that returns only scheduling data
CREATE OR REPLACE FUNCTION public.get_booked_slots(
  _barbershop_id uuid,
  _date date,
  _professional_id uuid DEFAULT NULL
)
RETURNS TABLE(professional_id uuid, start_time time, end_time time, status text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT professional_id, start_time, end_time, status::text
  FROM public.appointments
  WHERE barbershop_id = _barbershop_id
    AND date = _date
    AND status NOT IN ('cancelled')
    AND (_professional_id IS NULL OR professional_id = _professional_id);
$$;

-- 3. Fix: Restrict team_invites UPDATE to only allow changing status and accepted_at
DROP POLICY IF EXISTS "Users can update their own invites" ON public.team_invites;

CREATE POLICY "Users can update own invite status only" ON public.team_invites
  FOR UPDATE TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())::text
    AND role = (SELECT role FROM public.team_invites ti WHERE ti.id = team_invites.id)
    AND barbershop_id = (SELECT barbershop_id FROM public.team_invites ti WHERE ti.id = team_invites.id)
    AND invited_by = (SELECT invited_by FROM public.team_invites ti WHERE ti.id = team_invites.id)
  );