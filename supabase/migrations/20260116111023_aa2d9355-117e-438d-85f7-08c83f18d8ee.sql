-- Add columns for reklamacija (complaint record) documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS supplier_name text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS supplier_address text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS supplier_oib text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS supplier_contact text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS pickup_date date;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS received_by text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS company_representative text;

-- Add invoice number to document items for reklamacija
ALTER TABLE document_items ADD COLUMN IF NOT EXISTS invoice_number text;