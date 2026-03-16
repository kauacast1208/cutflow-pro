CREATE OR REPLACE FUNCTION public.get_user_barbershop_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT COALESCE(
    (SELECT b.id FROM public.barbershops b WHERE b.owner_id = _user_id LIMIT 1),
    (SELECT p.barbershop_id FROM public.professionals p WHERE p.user_id = _user_id AND p.active = true LIMIT 1),
    (
      SELECT ti.barbershop_id
      FROM public.team_invites ti
      JOIN auth.users u ON u.id = _user_id
      WHERE lower(ti.email) = lower(u.email)
        AND ti.status = 'accepted'
      ORDER BY ti.accepted_at DESC NULLS LAST, ti.created_at DESC
      LIMIT 1
    )
  )
$$;