
-- Business groups for franchise support
CREATE TABLE public.business_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Link barbershops to business groups (optional)
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS business_group_id uuid REFERENCES public.business_groups(id) ON DELETE SET NULL;

-- RLS for business_groups
ALTER TABLE public.business_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage their groups"
  ON public.business_groups FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Master can view all groups"
  ON public.business_groups FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

-- Master policies: allow master to read all key tables
CREATE POLICY "Master can view all barbershops"
  ON public.barbershops FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can update all barbershops"
  ON public.barbershops FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can view all subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can update all subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can view all user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can view all professionals"
  ON public.professionals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can view all clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "Master can view all appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

-- Updated_at trigger for business_groups
CREATE TRIGGER update_business_groups_updated_at
  BEFORE UPDATE ON public.business_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
