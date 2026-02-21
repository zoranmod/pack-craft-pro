-- Create document_tags table for tagging documents
CREATE TABLE public.document_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast lookups
CREATE INDEX idx_document_tags_document_id ON public.document_tags(document_id);
CREATE INDEX idx_document_tags_tag_name ON public.document_tags(tag_name);
CREATE INDEX idx_document_tags_user_id ON public.document_tags(user_id);

-- Unique constraint: no duplicate tags per document
CREATE UNIQUE INDEX idx_document_tags_unique ON public.document_tags(document_id, tag_name);

-- Enable RLS
ALTER TABLE public.document_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view tags on their documents"
ON public.document_tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid()
));

CREATE POLICY "Users can create tags on their documents"
ON public.document_tags FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid()
) AND auth.uid() = user_id);

CREATE POLICY "Users can delete tags on their documents"
ON public.document_tags FOR DELETE
USING (EXISTS (
  SELECT 1 FROM documents d WHERE d.id = document_tags.document_id AND d.user_id = auth.uid()
));

-- Admin employee policies
CREATE POLICY "Admin employees can view owner document tags"
ON public.document_tags FOR SELECT
USING (EXISTS (
  SELECT 1 FROM documents d WHERE d.id = document_tags.document_id 
  AND is_employee_admin(auth.uid()) AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner document tags"
ON public.document_tags FOR ALL
USING (EXISTS (
  SELECT 1 FROM documents d WHERE d.id = document_tags.document_id 
  AND is_employee_admin(auth.uid()) AND d.user_id = get_employee_owner(auth.uid())
));