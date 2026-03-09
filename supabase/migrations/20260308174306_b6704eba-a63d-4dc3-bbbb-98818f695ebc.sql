
-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'expired');

-- Create subscription plan enum
CREATE TYPE public.subscription_plan AS ENUM ('starter', 'pro', 'premium');

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL DEFAULT 'pro',
  status subscription_status NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(barbershop_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can view subscriptions (needed for trial check)
CREATE POLICY "Owners can view their subscription"
  ON public.subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.barbershops
      WHERE barbershops.id = subscriptions.barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- Only owners can update their subscription
CREATE POLICY "Owners can update their subscription"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.barbershops
      WHERE barbershops.id = subscriptions.barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- Allow insert for authenticated users (during onboarding)
CREATE POLICY "Authenticated users can create subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.barbershops
      WHERE barbershops.id = subscriptions.barbershop_id
      AND barbershops.owner_id = auth.uid()
    )
  );

-- Function to auto-create subscription when barbershop is created
CREATE OR REPLACE FUNCTION public.handle_new_barbershop()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (barbershop_id, plan, status, trial_ends_at)
  VALUES (NEW.id, 'pro', 'trial', now() + interval '7 days');
  RETURN NEW;
END;
$$;

-- Trigger on barbershop creation
CREATE TRIGGER on_barbershop_created
  AFTER INSERT ON public.barbershops
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_barbershop();
