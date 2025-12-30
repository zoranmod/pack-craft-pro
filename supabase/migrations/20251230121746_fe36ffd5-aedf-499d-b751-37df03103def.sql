-- Add source_document_id column to track document conversions
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS source_document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_source_document_id ON public.documents(source_document_id);