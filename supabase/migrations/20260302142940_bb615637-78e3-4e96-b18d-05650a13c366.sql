
CREATE TABLE public.apartment_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid NOT NULL,
  owner_user_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'receptionist',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.apartment_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apartment users can view own record" ON public.apartment_users
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Owner can manage apartment users" ON public.apartment_users
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE TABLE public.apartment_units (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id uuid NOT NULL,
  name text NOT NULL,
  unit_type text NOT NULL DEFAULT 'apartment',
  capacity integer NOT NULL DEFAULT 2,
  price_per_person numeric NOT NULL DEFAULT 0,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.apartment_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage units" ON public.apartment_units
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Apartment users can view units" ON public.apartment_units
  FOR SELECT TO authenticated
  USING (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()));

CREATE TABLE public.apartment_guests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id uuid NOT NULL,
  guest_type text NOT NULL DEFAULT 'fizicko_lice',
  first_name text,
  last_name text,
  id_number text,
  nationality text,
  date_of_birth date,
  company_name text,
  jib text,
  pdv_number text,
  contact_person text,
  phone text,
  email text,
  address text,
  country text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.apartment_guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage guests" ON public.apartment_guests
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Apartment users can manage guests" ON public.apartment_guests
  FOR ALL TO authenticated
  USING (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()))
  WITH CHECK (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()));

CREATE TABLE public.apartment_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id uuid NOT NULL,
  unit_id uuid NOT NULL REFERENCES public.apartment_units(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES public.apartment_guests(id) ON DELETE SET NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  adults integer NOT NULL DEFAULT 1,
  children integer NOT NULL DEFAULT 0,
  price_per_person numeric NOT NULL DEFAULT 0,
  breakfast_included boolean NOT NULL DEFAULT false,
  breakfast_price_per_person numeric NOT NULL DEFAULT 0,
  tourist_tax_per_person numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'reserved',
  source text NOT NULL DEFAULT 'manual',
  booking_reference text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.apartment_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage reservations" ON public.apartment_reservations
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Apartment users can manage reservations" ON public.apartment_reservations
  FOR ALL TO authenticated
  USING (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()))
  WITH CHECK (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()));

CREATE TABLE public.apartment_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_user_id uuid NOT NULL,
  reservation_id uuid REFERENCES public.apartment_reservations(id) ON DELETE SET NULL,
  document_type text NOT NULL DEFAULT 'ponuda',
  number text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  pdf_data jsonb,
  guest_name text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.apartment_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage apartment documents" ON public.apartment_documents
  FOR ALL TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Apartment users can manage apartment documents" ON public.apartment_documents
  FOR ALL TO authenticated
  USING (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()))
  WITH CHECK (owner_user_id IN (SELECT au.owner_user_id FROM public.apartment_users au WHERE au.auth_user_id = auth.uid()));

CREATE TRIGGER update_apartment_users_updated_at BEFORE UPDATE ON public.apartment_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_apartment_units_updated_at BEFORE UPDATE ON public.apartment_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_apartment_guests_updated_at BEFORE UPDATE ON public.apartment_guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_apartment_reservations_updated_at BEFORE UPDATE ON public.apartment_reservations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_apartment_documents_updated_at BEFORE UPDATE ON public.apartment_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
