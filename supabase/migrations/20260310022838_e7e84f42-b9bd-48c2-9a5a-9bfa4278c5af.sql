
-- Loyalty program type enum
CREATE TYPE public.loyalty_type AS ENUM ('visits', 'spending', 'specific_service');

-- Loyalty reward status enum
CREATE TYPE public.loyalty_reward_status AS ENUM ('in_progress', 'earned', 'redeemed', 'expired');

-- Loyalty program configuration per barbershop
CREATE TABLE public.loyalty_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  type loyalty_type NOT NULL DEFAULT 'visits',
  target INTEGER NOT NULL DEFAULT 10,
  reward_description TEXT NOT NULL DEFAULT 'Corte grátis',
  reward_validity_days INTEGER NOT NULL DEFAULT 30,
  specific_service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  notification_message TEXT DEFAULT 'Parabéns {{client_name}}! Você ganhou {{reward}} na {{barbershop_name}}. Apresente esta recompensa no seu próximo agendamento.',
  notification_near_message TEXT DEFAULT 'Faltam apenas {{remaining}} para você ganhar {{reward}} na {{barbershop_name}}!',
  near_threshold INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (barbershop_id)
);

-- Loyalty rewards tracking per client
CREATE TABLE public.loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.loyalty_programs(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC NOT NULL DEFAULT 0,
  target INTEGER NOT NULL,
  reward_description TEXT NOT NULL,
  status loyalty_reward_status NOT NULL DEFAULT 'in_progress',
  earned_at TIMESTAMPTZ,
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- RLS for loyalty_programs
CREATE POLICY "Anyone can view loyalty programs" ON public.loyalty_programs
  FOR SELECT TO public USING (true);

CREATE POLICY "Owners can insert loyalty programs" ON public.loyalty_programs
  FOR INSERT TO public WITH CHECK (
    EXISTS (SELECT 1 FROM barbershops WHERE id = loyalty_programs.barbershop_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can update loyalty programs" ON public.loyalty_programs
  FOR UPDATE TO public USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = loyalty_programs.barbershop_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete loyalty programs" ON public.loyalty_programs
  FOR DELETE TO public USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = loyalty_programs.barbershop_id AND owner_id = auth.uid())
  );

-- RLS for loyalty_rewards
CREATE POLICY "Anyone can view loyalty rewards for valid barbershops" ON public.loyalty_rewards
  FOR SELECT TO public USING (true);

CREATE POLICY "System can insert loyalty rewards" ON public.loyalty_rewards
  FOR INSERT TO public WITH CHECK (
    EXISTS (SELECT 1 FROM barbershops WHERE id = loyalty_rewards.barbershop_id)
  );

CREATE POLICY "Owners can update loyalty rewards" ON public.loyalty_rewards
  FOR UPDATE TO public USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = loyalty_rewards.barbershop_id AND owner_id = auth.uid())
  );

CREATE POLICY "Owners can delete loyalty rewards" ON public.loyalty_rewards
  FOR DELETE TO public USING (
    EXISTS (SELECT 1 FROM barbershops WHERE id = loyalty_rewards.barbershop_id AND owner_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_loyalty_rewards_barbershop ON public.loyalty_rewards(barbershop_id);
CREATE INDEX idx_loyalty_rewards_client ON public.loyalty_rewards(client_id);
CREATE INDEX idx_loyalty_rewards_status ON public.loyalty_rewards(status);

-- Updated_at triggers
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON public.loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_rewards_updated_at BEFORE UPDATE ON public.loyalty_rewards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
