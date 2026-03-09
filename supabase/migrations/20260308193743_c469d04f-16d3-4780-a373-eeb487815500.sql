
-- Backend enforcement: prevent adding professionals beyond plan limit
CREATE OR REPLACE FUNCTION public.check_professional_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_plan subscription_plan;
  current_count integer;
  max_allowed integer;
BEGIN
  -- Get the current plan for the barbershop
  SELECT s.plan INTO current_plan
  FROM subscriptions s
  WHERE s.barbershop_id = NEW.barbershop_id
  LIMIT 1;

  -- Count existing active professionals
  SELECT count(*) INTO current_count
  FROM professionals p
  WHERE p.barbershop_id = NEW.barbershop_id AND p.active = true;

  -- Determine limit based on plan
  max_allowed := CASE current_plan
    WHEN 'starter' THEN 1
    WHEN 'pro' THEN 5
    WHEN 'premium' THEN 999999
    ELSE 1
  END;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Professional limit reached for plan %. Maximum allowed: %', current_plan, max_allowed;
  END IF;

  RETURN NEW;
END;
$$;

-- Attach trigger to professionals table
CREATE TRIGGER enforce_professional_limit
  BEFORE INSERT ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_professional_limit();
