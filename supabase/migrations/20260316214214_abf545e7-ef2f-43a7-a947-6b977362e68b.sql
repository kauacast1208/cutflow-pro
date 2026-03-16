
-- Recreate the trigger for handle_new_user on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Recreate the trigger for handle_new_barbershop on barbershops
CREATE OR REPLACE TRIGGER on_barbershop_created
  AFTER INSERT ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_barbershop();

-- Recreate the trigger for handle_accept_invite on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created_accept_invite
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_accept_invite();

-- Recreate the trigger for check_professional_limit
CREATE OR REPLACE TRIGGER on_professional_insert_check_limit
  BEFORE INSERT ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.check_professional_limit();

-- Recreate the trigger for check_campaign_feature
CREATE OR REPLACE TRIGGER on_campaign_insert_check_feature
  BEFORE INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.check_campaign_feature();

-- Recreate updated_at triggers
CREATE OR REPLACE TRIGGER set_updated_at_barbershops
  BEFORE UPDATE ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_services
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_professionals
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
