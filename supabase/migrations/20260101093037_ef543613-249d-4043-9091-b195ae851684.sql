-- Add soft delete columns to documents table
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Add soft delete columns to clients table
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Add soft delete columns to dobavljaci (suppliers) table
ALTER TABLE public.dobavljaci
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Add soft delete columns to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Add soft delete columns to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL;

-- Create indexes for efficient filtering on deleted_at
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON public.documents (deleted_at);
CREATE INDEX IF NOT EXISTS idx_clients_deleted_at ON public.clients (deleted_at);
CREATE INDEX IF NOT EXISTS idx_dobavljaci_deleted_at ON public.dobavljaci (deleted_at);
CREATE INDEX IF NOT EXISTS idx_articles_deleted_at ON public.articles (deleted_at);
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at ON public.employees (deleted_at);