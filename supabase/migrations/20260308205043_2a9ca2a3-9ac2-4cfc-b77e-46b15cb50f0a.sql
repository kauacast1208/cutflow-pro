
-- 1. Add address_complement to barbershops
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS address_complement text;

-- 2. Create notifications table for confirmations/reminders
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email',
  type text NOT NULL,
  recipient_name text,
  recipient_email text,
  recipient_phone text,
  subject text,
  body text,
  status text NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view notifications" ON public.notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = notifications.barbershop_id AND barbershops.owner_id = auth.uid())
  );

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = notifications.barbershop_id)
  );

-- 3. Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id uuid NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  referrer_client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  referred_client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage referrals" ON public.referrals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM barbershops WHERE barbershops.id = referrals.barbershop_id AND barbershops.owner_id = auth.uid())
  );

-- 4. Add referral settings to barbershops
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS referral_enabled boolean DEFAULT false;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS referral_goal integer DEFAULT 5;
ALTER TABLE public.barbershops ADD COLUMN IF NOT EXISTS referral_reward text DEFAULT 'Corte grátis';

-- Index for notification scheduling
CREATE INDEX idx_notifications_scheduled ON public.notifications(status, scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notifications_appointment ON public.notifications(appointment_id);
