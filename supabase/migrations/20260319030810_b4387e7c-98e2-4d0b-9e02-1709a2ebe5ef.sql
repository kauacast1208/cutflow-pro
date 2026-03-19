
-- Reviews table for client feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a review (public booking page)
CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Owners can view their reviews
CREATE POLICY "Owners can view reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (barbershop_id = get_user_barbershop_id(auth.uid()));

-- Master can view all reviews
CREATE POLICY "Master can view all reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'master'::app_role));

-- Anon can view reviews for public page
CREATE POLICY "Anon can view reviews" ON public.reviews
  FOR SELECT TO anon USING (true);

-- Add theme customization columns to barbershops
ALTER TABLE public.barbershops
  ADD COLUMN IF NOT EXISTS theme_primary_color TEXT DEFAULT '#10b981',
  ADD COLUMN IF NOT EXISTS theme_mode TEXT DEFAULT 'auto';
