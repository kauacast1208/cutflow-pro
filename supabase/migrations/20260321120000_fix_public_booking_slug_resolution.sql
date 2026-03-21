CREATE OR REPLACE FUNCTION public.get_public_booking_page_data(_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_slug text := nullif(btrim(_slug), '');
  v_shop record;
BEGIN
  IF v_slug IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT
    b.id,
    b.name,
    b.slug,
    b.description,
    b.phone,
    b.address,
    b.address_complement,
    b.instagram,
    b.whatsapp,
    b.logo_url,
    b.opening_time,
    b.closing_time,
    b.slot_interval_minutes,
    b.buffer_minutes,
    b.min_advance_hours,
    b.allow_online_cancellation,
    b.allow_online_reschedule,
    b.cancellation_limit_hours,
    b.auto_confirm,
    b.closed_days,
    b.referral_enabled,
    b.referral_goal,
    b.referral_reward,
    b.created_at,
    b.updated_at
  INTO v_shop
  FROM public.barbershops b
  WHERE b.slug = v_slug
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'barbershop',
    to_jsonb(v_shop),
    'services',
    COALESCE(
      (
        SELECT jsonb_agg(to_jsonb(s) ORDER BY s.sort_order NULLS LAST, s.name)
        FROM (
          SELECT
            id,
            barbershop_id,
            name,
            description,
            duration_minutes,
            price,
            category,
            active,
            sort_order,
            created_at,
            updated_at
          FROM public.services
          WHERE barbershop_id = v_shop.id
            AND active = true
        ) s
      ),
      '[]'::jsonb
    ),
    'professionals',
    COALESCE(
      (
        SELECT jsonb_agg(to_jsonb(p) ORDER BY p.name)
        FROM (
          SELECT
            id,
            barbershop_id,
            name,
            role,
            avatar_url,
            active AS is_active,
            specialties,
            work_days,
            work_start,
            work_end,
            created_at,
            updated_at
          FROM public.professionals
          WHERE barbershop_id = v_shop.id
            AND active = true
        ) p
      ),
      '[]'::jsonb
    ),
    'availability',
    COALESCE(
      (
        SELECT jsonb_agg(to_jsonb(pa) ORDER BY pa.weekday, pa.start_time, pa.end_time)
        FROM (
          SELECT
            pa.id,
            pa.professional_id,
            pa.weekday,
            pa.start_time,
            pa.end_time,
            pa.created_at
          FROM public.professional_availability pa
          INNER JOIN public.professionals p
            ON p.id = pa.professional_id
          WHERE p.barbershop_id = v_shop.id
            AND p.active = true
        ) pa
      ),
      '[]'::jsonb
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_booking_page_data(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_booking_page_data(text) TO authenticated;
