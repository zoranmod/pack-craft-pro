-- Drop the old constraint
ALTER TABLE public.documents DROP CONSTRAINT documents_type_check;

-- Add the updated constraint with all document types
ALTER TABLE public.documents ADD CONSTRAINT documents_type_check 
CHECK (type = ANY (ARRAY['otpremnica'::text, 'ponuda'::text, 'nalog-dostava-montaza'::text, 'racun'::text, 'ugovor'::text]));