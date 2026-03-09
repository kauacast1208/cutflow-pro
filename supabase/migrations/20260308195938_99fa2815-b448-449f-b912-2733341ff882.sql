
-- =============================================
-- Plans table: single source of truth for plan config
-- =============================================
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug subscription_plan UNIQUE NOT NULL,
  label text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  features text[] NOT NULL DEFAULT '{}',
  max_professionals integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Anyone can read plans (public pricing info)
CREATE POLICY "Anyone can view plans"
ON public.plans FOR SELECT
USING (true);

-- Seed the three plans
INSERT INTO public.plans (slug, label, price, features, max_professionals) VALUES
(
  'starter',
  'Starter',
  49,
  ARRAY['agenda','clients','services','basic_reports'],
  1
),
(
  'pro',
  'Pro',
  89,
  ARRAY['agenda','clients','services','basic_reports','advanced_reports','finance','blocked_times','simple_campaigns','basic_mailing','chat_support'],
  5
),
(
  'premium',
  'Premium',
  149,
  ARRAY['agenda','clients','services','basic_reports','advanced_reports','finance','blocked_times','simple_campaigns','advanced_campaigns','basic_mailing','mailing','marketing_automation','priority_support','chat_support','integrations'],
  999999
);

-- =============================================
-- Replace check_professional_limit to read from plans table
-- =============================================
CREATE OR REPLACE FUNCTION public.check_professional_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_plan subscription_plan;
  current_count integer;
  max_allowed integer;
  plan_label text;
BEGIN
  SELECT s.plan INTO current_plan
  FROM subscriptions s
  WHERE s.barbershop_id = NEW.barbershop_id
  LIMIT 1;

  SELECT count(*) INTO current_count
  FROM professionals p
  WHERE p.barbershop_id = NEW.barbershop_id AND p.active = true;

  SELECT pl.max_professionals, pl.label INTO max_allowed, plan_label
  FROM plans pl
  WHERE pl.slug = current_plan;

  IF max_allowed IS NULL THEN
    max_allowed := 1;
    plan_label := 'Starter';
  END IF;

  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'Seu plano % permite no máximo % profissional(is). Faça upgrade para continuar.', plan_label, max_allowed;
  END IF;

  RETURN NEW;
END;
$function$;

-- =============================================
-- Validate feature access on campaign insert
-- =============================================
CREATE OR REPLACE FUNCTION public.check_campaign_feature()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_plan subscription_plan;
  plan_features text[];
  plan_label text;
  required_feature text;
BEGIN
  SELECT s.plan INTO current_plan
  FROM subscriptions s
  WHERE s.barbershop_id = NEW.barbershop_id
  LIMIT 1;

  SELECT pl.features, pl.label INTO plan_features, plan_label
  FROM plans pl
  WHERE pl.slug = current_plan;

  -- Determine required feature based on audience
  IF NEW.audience = 'direct_mail' THEN
    required_feature := 'basic_mailing';
  ELSE
    required_feature := 'simple_campaigns';
  END IF;

  IF NOT (required_feature = ANY(plan_features)) THEN
    RAISE EXCEPTION 'O recurso de campanhas não está disponível no plano %. Faça upgrade para continuar.', plan_label;
  END IF;

  RETURN NEW;
END;
$function$;

-- Attach the campaign validation trigger
CREATE TRIGGER validate_campaign_feature
  BEFORE INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.check_campaign_feature();

-- Ensure professional limit trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_professional_limit'
  ) THEN
    CREATE TRIGGER validate_professional_limit
      BEFORE INSERT ON public.professionals
      FOR EACH ROW
      EXECUTE FUNCTION public.check_professional_limit();
  END IF;
END;
$$;
