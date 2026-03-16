-- Ensure schema consistency for barbershops.address_complement across environments
ALTER TABLE public.barbershops
ADD COLUMN IF NOT EXISTS address_complement text;