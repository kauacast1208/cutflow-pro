
-- Function to get barbershop for any team member (owner or professional)
CREATE OR REPLACE FUNCTION public.get_user_barbershop_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    -- First check if user is owner
    (SELECT id FROM barbershops WHERE owner_id = _user_id LIMIT 1),
    -- Then check if user is a linked professional
    (SELECT barbershop_id FROM professionals WHERE user_id = _user_id AND active = true LIMIT 1)
  )
$$;

-- Function to get user's effective role for a barbershop
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;
