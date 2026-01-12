-- Add html_content column to document_templates for WYSIWYG editing
ALTER TABLE public.document_templates
ADD COLUMN IF NOT EXISTS html_content text,
ADD COLUMN IF NOT EXISTS use_wysiwyg boolean DEFAULT false;