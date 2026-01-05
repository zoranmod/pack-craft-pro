-- Table to store ignored duplicate pairs
CREATE TABLE public.ignored_duplicates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'supplier' or 'client'
  entity_id_1 UUID NOT NULL,
  entity_id_2 UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(entity_type, entity_id_1, entity_id_2)
);

-- Enable RLS
ALTER TABLE public.ignored_duplicates ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can view all ignored duplicates
CREATE POLICY "Authenticated users can view ignored duplicates"
ON public.ignored_duplicates
FOR SELECT
TO authenticated
USING (true);

-- Policy: authenticated users can insert ignored duplicates
CREATE POLICY "Authenticated users can insert ignored duplicates"
ON public.ignored_duplicates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: authenticated users can delete ignored duplicates
CREATE POLICY "Authenticated users can delete ignored duplicates"
ON public.ignored_duplicates
FOR DELETE
TO authenticated
USING (true);

-- Index for faster lookups
CREATE INDEX idx_ignored_duplicates_entity_type ON public.ignored_duplicates(entity_type);
CREATE INDEX idx_ignored_duplicates_entities ON public.ignored_duplicates(entity_id_1, entity_id_2);