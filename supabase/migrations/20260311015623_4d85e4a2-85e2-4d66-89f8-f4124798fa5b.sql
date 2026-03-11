
-- Add reschedule token to appointments
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reschedule_token uuid DEFAULT gen_random_uuid();

-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_appointments_reschedule_token ON public.appointments(reschedule_token);
