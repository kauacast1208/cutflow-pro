ALTER TABLE public.loyalty_programs
ADD COLUMN IF NOT EXISTS service_ids UUID[] NULL;

UPDATE public.loyalty_programs
SET service_ids = ARRAY[specific_service_id]
WHERE specific_service_id IS NOT NULL
  AND (service_ids IS NULL OR array_length(service_ids, 1) IS NULL);
