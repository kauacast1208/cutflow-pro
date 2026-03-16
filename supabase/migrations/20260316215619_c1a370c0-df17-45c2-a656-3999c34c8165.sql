
-- Create missing triggers that connect existing functions

-- 1. Trigger on auth.users for new user signup (creates profile + user_role)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger on barbershops for new barbershop (creates subscription)
CREATE OR REPLACE TRIGGER on_barbershop_created
  AFTER INSERT ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_barbershop();

-- 3. Trigger on auth.users for invite acceptance
CREATE OR REPLACE TRIGGER on_auth_user_created_accept_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_accept_invite();

-- 4. Updated_at triggers
CREATE OR REPLACE TRIGGER set_updated_at_barbershops
  BEFORE UPDATE ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_professionals
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_appointments
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Fix barbershops INSERT policy to explicitly target authenticated role
DROP POLICY IF EXISTS "Owners can insert their barbershop" ON public.barbershops;
CREATE POLICY "Owners can insert their barbershop"
  ON public.barbershops
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);
