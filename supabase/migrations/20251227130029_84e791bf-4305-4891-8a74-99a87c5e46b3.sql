-- Create table for contract article templates (predlošci članaka)
CREATE TABLE public.contract_article_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  article_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for document contract articles (članci vezani uz dokument)
CREATE TABLE public.document_contract_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  article_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contract_article_templates
ALTER TABLE public.contract_article_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for contract_article_templates
CREATE POLICY "Users can view their own contract templates"
ON public.contract_article_templates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contract templates"
ON public.contract_article_templates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contract templates"
ON public.contract_article_templates
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract templates"
ON public.contract_article_templates
FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on document_contract_articles
ALTER TABLE public.document_contract_articles ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_contract_articles (through document ownership)
CREATE POLICY "Users can view articles of their documents"
ON public.document_contract_articles
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.documents
  WHERE documents.id = document_contract_articles.document_id
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create articles for their documents"
ON public.document_contract_articles
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents
  WHERE documents.id = document_contract_articles.document_id
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update articles of their documents"
ON public.document_contract_articles
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.documents
  WHERE documents.id = document_contract_articles.document_id
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete articles of their documents"
ON public.document_contract_articles
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.documents
  WHERE documents.id = document_contract_articles.document_id
  AND documents.user_id = auth.uid()
));

-- Create trigger for updated_at on contract_article_templates
CREATE TRIGGER update_contract_article_templates_updated_at
BEFORE UPDATE ON public.contract_article_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();