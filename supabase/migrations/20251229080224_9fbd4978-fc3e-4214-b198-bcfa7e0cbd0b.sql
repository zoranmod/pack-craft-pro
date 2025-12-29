-- Add is_template column to articles table
ALTER TABLE public.articles 
ADD COLUMN is_template boolean NOT NULL DEFAULT false;

-- Add index for faster template fetching
CREATE INDEX idx_articles_is_template ON public.articles(is_template) WHERE is_template = true;