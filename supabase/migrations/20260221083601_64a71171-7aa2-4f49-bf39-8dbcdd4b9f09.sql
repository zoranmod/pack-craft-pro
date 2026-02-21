
-- Create document_versions table for storing document snapshots
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  user_id UUID NOT NULL,
  snapshot JSONB NOT NULL,
  items_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT
);

-- Index for fast lookups
CREATE INDEX idx_document_versions_doc ON public.document_versions(document_id, version_number);

-- Enable RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Owner can view versions of their documents
CREATE POLICY "Users can view versions of their documents"
ON public.document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND d.user_id = auth.uid()
  )
);

-- Owner can create versions
CREATE POLICY "Users can create versions for their documents"
ON public.document_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND d.user_id = auth.uid()
  )
);

-- Admin employees can view owner document versions
CREATE POLICY "Admin employees can view owner document versions"
ON public.document_versions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND is_employee_admin(auth.uid())
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- Admin employees can create owner document versions
CREATE POLICY "Admin employees can insert owner document versions"
ON public.document_versions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_versions.document_id
    AND is_employee_admin(auth.uid())
    AND d.user_id = get_employee_owner(auth.uid())
  )
);
