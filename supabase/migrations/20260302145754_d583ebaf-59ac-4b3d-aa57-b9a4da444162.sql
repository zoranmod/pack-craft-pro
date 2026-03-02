
-- 1. Cjenik apartmana - stepenaste cijene po broju osoba
CREATE TABLE public.apartment_price_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  unit_type text NOT NULL DEFAULT 'apartment',
  persons integer NOT NULL DEFAULT 1,
  price_without_breakfast numeric NOT NULL DEFAULT 0,
  price_with_breakfast numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_user_id, unit_type, persons)
);

ALTER TABLE public.apartment_price_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can manage price list"
  ON public.apartment_price_list FOR ALL
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Apartment users can view price list"
  ON public.apartment_price_list FOR SELECT
  USING (owner_user_id IN (
    SELECT au.owner_user_id FROM apartment_users au WHERE au.auth_user_id = auth.uid()
  ));

-- 2. Dodati payment_method i city/postal_code na guests
ALTER TABLE public.apartment_reservations
  ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'gotovinski';

ALTER TABLE public.apartment_guests
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text;

-- 3. Proširiti apartment_documents za 4 tipa
ALTER TABLE public.apartment_documents
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS due_date date,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS validity_days integer DEFAULT 7;
