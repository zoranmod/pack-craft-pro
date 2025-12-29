-- Add code column to document_items to store article code
ALTER TABLE public.document_items ADD COLUMN IF NOT EXISTS code text;