ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS contact_person text;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS delivery_address text;