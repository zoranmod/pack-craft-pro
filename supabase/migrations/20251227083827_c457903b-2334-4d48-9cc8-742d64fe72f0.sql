-- Add new columns to articles table for import compatibility
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS stock NUMERIC NOT NULL DEFAULT 0;