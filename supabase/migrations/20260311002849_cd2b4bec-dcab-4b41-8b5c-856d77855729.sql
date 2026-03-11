
-- Add client_id and provider columns to notifications table
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS provider text;

-- Create index for faster lookups on idempotency checks
CREATE INDEX IF NOT EXISTS idx_notifications_appointment_type
  ON public.notifications (appointment_id, type)
  WHERE appointment_id IS NOT NULL;

-- Create index for pending notifications processing
CREATE INDEX IF NOT EXISTS idx_notifications_pending_scheduled
  ON public.notifications (status, scheduled_for)
  WHERE status = 'pending';

-- Create index for client notification history
CREATE INDEX IF NOT EXISTS idx_notifications_client
  ON public.notifications (client_id, created_at DESC)
  WHERE client_id IS NOT NULL;
