
-- Campaigns table
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  audience text NOT NULL DEFAULT 'all_clients',
  channel text NOT NULL DEFAULT 'whatsapp',
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamp with time zone,
  sent_at timestamp with time zone,
  recipient_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Owners can view their campaigns"
  ON public.campaigns FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()
  ));

CREATE POLICY "Owners can insert campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()
  ));

CREATE POLICY "Owners can update campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()
  ));

CREATE POLICY "Owners can delete campaigns"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM barbershops WHERE barbershops.id = campaigns.barbershop_id AND barbershops.owner_id = auth.uid()
  ));

-- updated_at trigger
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
