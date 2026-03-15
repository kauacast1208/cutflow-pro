
-- Ambassador/referral acquisition table
CREATE TABLE public.platform_ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  referral_link text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  total_invites integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_rewards_earned numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT platform_ambassadors_user_id_unique UNIQUE (user_id)
);

-- Ambassador referral tracking
CREATE TABLE public.platform_referral_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.platform_ambassadors(id) ON DELETE CASCADE,
  referred_email text,
  referred_name text,
  status text NOT NULL DEFAULT 'invited',
  converted_at timestamp with time zone,
  reward_amount numeric DEFAULT 0,
  reward_status text DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_referral_leads ENABLE ROW LEVEL SECURITY;

-- Ambassadors: users can view their own record
CREATE POLICY "Users can view own ambassador record"
  ON public.platform_ambassadors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Ambassadors: master can view all
CREATE POLICY "Master can view all ambassadors"
  ON public.platform_ambassadors FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

-- Ambassadors: master can manage all
CREATE POLICY "Master can manage ambassadors"
  ON public.platform_ambassadors FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'))
  WITH CHECK (public.has_role(auth.uid(), 'master'));

-- Referral leads: ambassadors can view their own leads
CREATE POLICY "Ambassadors can view own leads"
  ON public.platform_referral_leads FOR SELECT
  TO authenticated
  USING (ambassador_id IN (SELECT id FROM public.platform_ambassadors WHERE user_id = auth.uid()));

-- Referral leads: master can view all
CREATE POLICY "Master can view all leads"
  ON public.platform_referral_leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

-- Updated_at trigger
CREATE TRIGGER update_platform_ambassadors_updated_at
  BEFORE UPDATE ON public.platform_ambassadors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
