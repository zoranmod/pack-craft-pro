-- Drop existing check constraint and add new one that includes 'ponuda-komarnici'
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;

ALTER TABLE documents ADD CONSTRAINT documents_type_check 
  CHECK (type = ANY (ARRAY['otpremnica', 'ponuda', 'nalog-dostava-montaza', 'racun', 'ugovor', 'ponuda-komarnici']));