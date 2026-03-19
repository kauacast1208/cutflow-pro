
-- Recreate barbershops_public view WITHOUT security_invoker so anon users can access it
DROP VIEW IF EXISTS public.barbershops_public;

CREATE VIEW public.barbershops_public AS
SELECT
  id, name, slug, description, address, address_complement, phone, whatsapp, instagram,
  logo_url, opening_time, closing_time, slot_interval_minutes, buffer_minutes,
  closed_days, auto_confirm, min_advance_hours, allow_online_reschedule,
  allow_online_cancellation, cancellation_limit_hours,
  referral_enabled, referral_goal, referral_reward,
  created_at, updated_at
FROM public.barbershops;

-- Grant anon and authenticated access to the view
GRANT SELECT ON public.barbershops_public TO anon, authenticated;
