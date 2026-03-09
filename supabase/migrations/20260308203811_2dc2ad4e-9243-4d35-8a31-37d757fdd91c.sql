
-- Create team_invites table for invite flow
CREATE TABLE public.team_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'professional',
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(barbershop_id, email)
);

ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Owners can manage invites
CREATE POLICY "Owners can view invites" ON public.team_invites
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = team_invites.barbershop_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can create invites" ON public.team_invites
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM barbershops WHERE id = team_invites.barbershop_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete invites" ON public.team_invites
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = team_invites.barbershop_id AND owner_id = auth.uid())
  );

-- Anyone can view their own invite (by email match)
CREATE POLICY "Users can view their own invites" ON public.team_invites
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update their own invites" ON public.team_invites
  FOR UPDATE USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
