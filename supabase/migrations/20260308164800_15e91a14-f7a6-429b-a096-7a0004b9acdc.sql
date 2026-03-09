
-- Create enum for appointment status
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'professional');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Barbershops table
CREATE TABLE public.barbershops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  phone TEXT,
  address TEXT,
  instagram TEXT,
  whatsapp TEXT,
  logo_url TEXT,
  opening_time TIME NOT NULL DEFAULT '09:00',
  closing_time TIME NOT NULL DEFAULT '19:00',
  slot_interval_minutes INT NOT NULL DEFAULT 30,
  buffer_minutes INT NOT NULL DEFAULT 0,
  min_advance_hours INT NOT NULL DEFAULT 1,
  allow_online_cancellation BOOLEAN NOT NULL DEFAULT true,
  allow_online_reschedule BOOLEAN NOT NULL DEFAULT true,
  cancellation_limit_hours INT NOT NULL DEFAULT 2,
  auto_confirm BOOLEAN NOT NULL DEFAULT true,
  closed_days INT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view barbershops" ON public.barbershops FOR SELECT USING (true);
CREATE POLICY "Owners can insert their barbershop" ON public.barbershops FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their barbershop" ON public.barbershops FOR UPDATE USING (auth.uid() = owner_id);
CREATE TRIGGER update_barbershops_updated_at BEFORE UPDATE ON public.barbershops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 30,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  category TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Owners can insert services" ON public.services FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update services" ON public.services FOR UPDATE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete services" ON public.services FOR DELETE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Professionals table
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Barbeiro',
  specialties TEXT[],
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  work_start TIME DEFAULT '09:00',
  work_end TIME DEFAULT '19:00',
  work_days INT[] DEFAULT '{1,2,3,4,5,6}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view professionals" ON public.professionals FOR SELECT USING (true);
CREATE POLICY "Owners can insert professionals" ON public.professionals FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update professionals" ON public.professionals FOR UPDATE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete professionals" ON public.professionals FOR DELETE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled',
  price DECIMAL(10,2),
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Owners can update appointments" ON public.appointments FOR UPDATE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete appointments" ON public.appointments FOR DELETE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Blocked times table
CREATE TABLE public.blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  all_day BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_days INT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blocked_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view blocked times" ON public.blocked_times FOR SELECT USING (true);
CREATE POLICY "Owners can insert blocked times" ON public.blocked_times FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can update blocked times" ON public.blocked_times FOR UPDATE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can delete blocked times" ON public.blocked_times FOR DELETE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update clients" ON public.clients FOR UPDATE USING (EXISTS (SELECT 1 FROM public.barbershops WHERE id = barbershop_id AND owner_id = auth.uid()));
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes
CREATE INDEX idx_appointments_barbershop_date ON public.appointments(barbershop_id, date);
CREATE INDEX idx_appointments_professional_date ON public.appointments(professional_id, date);
CREATE INDEX idx_blocked_times_barbershop_date ON public.blocked_times(barbershop_id, date);
CREATE INDEX idx_services_barbershop ON public.services(barbershop_id);
CREATE INDEX idx_professionals_barbershop ON public.professionals(barbershop_id);
CREATE INDEX idx_barbershops_slug ON public.barbershops(slug);
CREATE INDEX idx_clients_barbershop ON public.clients(barbershop_id);
