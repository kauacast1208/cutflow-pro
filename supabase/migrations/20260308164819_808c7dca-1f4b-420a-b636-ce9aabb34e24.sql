
-- Tighten INSERT policies - require that the barbershop_id exists
DROP POLICY "Anyone can create appointments" ON public.appointments;
CREATE POLICY "Anyone can create appointments for valid barbershops" ON public.appointments 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id)
  );

DROP POLICY "Anyone can insert clients" ON public.clients;
CREATE POLICY "Anyone can insert clients for valid barbershops" ON public.clients 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id)
  );
