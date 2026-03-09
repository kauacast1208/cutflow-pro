
-- Campaign recipients / mala direta tracking
CREATE TABLE public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, client_id)
);

ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Owners can view recipients of their campaigns
CREATE POLICY "Owners can view campaign recipients"
ON public.campaign_recipients FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.campaigns c
  JOIN public.barbershops b ON b.id = c.barbershop_id
  WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()
));

-- Owners can insert recipients
CREATE POLICY "Owners can insert campaign recipients"
ON public.campaign_recipients FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.campaigns c
  JOIN public.barbershops b ON b.id = c.barbershop_id
  WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()
));

-- Owners can update recipients
CREATE POLICY "Owners can update campaign recipients"
ON public.campaign_recipients FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.campaigns c
  JOIN public.barbershops b ON b.id = c.barbershop_id
  WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()
));

-- Owners can delete recipients
CREATE POLICY "Owners can delete campaign recipients"
ON public.campaign_recipients FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.campaigns c
  JOIN public.barbershops b ON b.id = c.barbershop_id
  WHERE c.id = campaign_recipients.campaign_id AND b.owner_id = auth.uid()
));
