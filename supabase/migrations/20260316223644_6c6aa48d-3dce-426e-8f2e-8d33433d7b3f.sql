CREATE OR REPLACE FUNCTION public.ensure_current_user_setup(_full_name text DEFAULT NULL::text)
RETURNS TABLE(profile_id uuid, user_role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _resolved_name text := nullif(btrim(_full_name), '');
  _profile_id uuid;
  _role app_role;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.profiles (user_id, full_name)
  VALUES (_uid, _resolved_name)
  ON CONFLICT (user_id)
  DO UPDATE SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name)
  RETURNING id INTO _profile_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _uid
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_uid, 'owner');
  END IF;

  SELECT ur.role INTO _role
  FROM public.user_roles ur
  WHERE ur.user_id = _uid
  ORDER BY CASE ur.role
    WHEN 'master' THEN 1
    WHEN 'owner' THEN 2
    WHEN 'admin' THEN 3
    WHEN 'professional' THEN 4
    WHEN 'receptionist' THEN 5
    ELSE 99
  END
  LIMIT 1;

  RETURN QUERY SELECT _profile_id, _role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_current_user_setup(text) TO authenticated;

DROP TRIGGER IF EXISTS create_subscription_after_barbershop_insert ON public.barbershops;

CREATE TRIGGER create_subscription_after_barbershop_insert
AFTER INSERT ON public.barbershops
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_barbershop();