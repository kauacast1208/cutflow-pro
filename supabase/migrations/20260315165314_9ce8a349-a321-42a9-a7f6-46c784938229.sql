
-- Update trial trigger to use 15 days
CREATE OR REPLACE FUNCTION public.handle_new_barbershop()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.subscriptions (barbershop_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'pro', 'trial', now() + interval '15 days');
  RETURN NEW;
END;
$function$;
