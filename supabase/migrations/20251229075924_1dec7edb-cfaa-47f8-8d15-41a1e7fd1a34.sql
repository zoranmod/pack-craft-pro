-- Add client_type column (private = privatna osoba, company = pravna osoba)
ALTER TABLE public.clients 
ADD COLUMN client_type text NOT NULL DEFAULT 'company';

-- Add default_pdv column for client's default VAT rate
ALTER TABLE public.clients 
ADD COLUMN default_pdv numeric NOT NULL DEFAULT 25;

-- Add a comment explaining the values
COMMENT ON COLUMN public.clients.client_type IS 'Client type: private (privatna osoba) or company (pravna osoba)';
COMMENT ON COLUMN public.clients.default_pdv IS 'Default VAT rate for this client (0 for private, 25 for company by default)';