
-- 1. Fix appointments UPDATE policy to allow team members
DROP POLICY IF EXISTS "Owners can update appointments" ON public.appointments;
CREATE POLICY "Team can update appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- 2. Fix appointments DELETE policy to allow team members  
DROP POLICY IF EXISTS "Owners can delete appointments" ON public.appointments;
CREATE POLICY "Team can delete appointments" ON public.appointments
  FOR DELETE TO authenticated
  USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- 3. Create accept-invite trigger function
CREATE OR REPLACE FUNCTION public.handle_accept_invite()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite RECORD;
BEGIN
  -- Check if there's a pending invite for this user's email
  SELECT * INTO _invite
  FROM public.team_invites
  WHERE email = NEW.email
    AND status = 'pending'
  LIMIT 1;

  IF _invite IS NULL THEN
    RETURN NEW;
  END IF;

  -- Update user_roles to the invited role (replace default 'owner')
  UPDATE public.user_roles
  SET role = _invite.role
  WHERE user_id = NEW.id;

  -- If invited as professional, create a professionals record
  IF _invite.role = 'professional' THEN
    INSERT INTO public.professionals (barbershop_id, user_id, name, active)
    VALUES (_invite.barbershop_id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), true)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Mark invite as accepted
  UPDATE public.team_invites
  SET status = 'accepted', accepted_at = now()
  WHERE id = _invite.id;

  RETURN NEW;
END;
$$;

-- 4. Create trigger that fires AFTER handle_new_user (which creates profile + owner role)
CREATE TRIGGER on_auth_user_created_accept_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_accept_invite();
