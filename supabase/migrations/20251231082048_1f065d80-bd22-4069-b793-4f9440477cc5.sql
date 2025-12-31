-- Add print/PDF layout settings to company_settings table
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS print_footer_bottom_mm numeric DEFAULT 14,
ADD COLUMN IF NOT EXISTS print_footer_max_height_mm numeric DEFAULT 14,
ADD COLUMN IF NOT EXISTS print_content_bottom_padding_mm numeric DEFAULT 42;