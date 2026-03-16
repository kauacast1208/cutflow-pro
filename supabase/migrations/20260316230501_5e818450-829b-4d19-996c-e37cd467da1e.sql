-- Make auth/bootstrap flows idempotent and remove duplicate onboarding side effects

-- 1) Ensure new auth users create profile + default role safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NULLIF(btrim(NEW.raw_user_meta_data->>'full_name'), ''))
  ON CONFLICT (user_id)
  DO UPDATE SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 2) Make runtime bootstrap safe under race conditions
CREATE OR REPLACE FUNCTION public.ensure_current_user_setup(_full_name text DEFAULT NULL::text)
RETURNS TABLE(profile_id uuid, user_role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_uid, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;

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
$function$;

-- 3) Deterministic role lookup for frontend RPC calls
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  ORDER BY CASE ur.role
    WHEN 'master' THEN 1
    WHEN 'owner' THEN 2
    WHEN 'admin' THEN 3
    WHEN 'professional' THEN 4
    WHEN 'receptionist' THEN 5
    ELSE 99
  END
  LIMIT 1
$function$;

-- 4) Make initial subscription bootstrap idempotent
CREATE OR REPLACE FUNCTION public.handle_new_barbershop()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.subscriptions (barbershop_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'pro', 'trial', now() + interval '15 days')
  ON CONFLICT (barbershop_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 5) Remove duplicate triggers causing double inserts during onboarding
DROP TRIGGER IF EXISTS create_subscription_after_barbershop_insert ON public.barbershops;
DROP TRIGGER IF EXISTS update_barbershops_updated_at ON public.barbershops;