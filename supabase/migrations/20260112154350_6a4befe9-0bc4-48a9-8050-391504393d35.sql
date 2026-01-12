-- Add custom HTML content field to documents for WYSIWYG editing
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS custom_html_content text;