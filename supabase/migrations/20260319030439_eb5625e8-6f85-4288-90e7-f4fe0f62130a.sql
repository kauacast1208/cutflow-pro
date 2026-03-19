
-- Recreate professionals_public view WITHOUT security_invoker
DROP VIEW IF EXISTS public.professionals_public;

CREATE VIEW public.professionals_public AS
SELECT
  id, barbershop_id, name, role, specialties, avatar_url, active,
  work_days, work_start, work_end, created_at, updated_at
FROM public.professionals;

GRANT SELECT ON public.professionals_public TO anon, authenticated;

-- Recreate blocked_times_public view WITHOUT security_invoker
DROP VIEW IF EXISTS public.blocked_times_public;

CREATE VIEW public.blocked_times_public AS
SELECT
  id, barbershop_id, professional_id, date, start_time, end_time,
  all_day, recurring, recurring_days
FROM public.blocked_times;

GRANT SELECT ON public.blocked_times_public TO anon, authenticated;
