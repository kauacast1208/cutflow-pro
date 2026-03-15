
-- 1. Add 'master' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'master';

-- 2. Add 'franquias' to subscription_plan enum
ALTER TYPE public.subscription_plan ADD VALUE IF NOT EXISTS 'franquias';
