-- Extend company_settings with additional fields
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS pdv_id TEXT,
ADD COLUMN IF NOT EXISTS iban_2 TEXT,
ADD COLUMN IF NOT EXISTS swift_1 TEXT,
ADD COLUMN IF NOT EXISTS swift_2 TEXT,
ADD COLUMN IF NOT EXISTS bank_name_1 TEXT,
ADD COLUMN IF NOT EXISTS bank_name_2 TEXT,
ADD COLUMN IF NOT EXISTS phone_main TEXT,
ADD COLUMN IF NOT EXISTS phone_sales TEXT,
ADD COLUMN IF NOT EXISTS phone_accounting TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS email_info TEXT,
ADD COLUMN IF NOT EXISTS registration_court TEXT,
ADD COLUMN IF NOT EXISTS registration_number TEXT,
ADD COLUMN IF NOT EXISTS capital_amount TEXT,
ADD COLUMN IF NOT EXISTS director_name TEXT;

-- Create document_templates table
CREATE TABLE public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  
  -- Header settings
  show_logo BOOLEAN DEFAULT true,
  header_layout TEXT DEFAULT 'left-right',
  show_company_info BOOLEAN DEFAULT true,
  show_iban_in_header BOOLEAN DEFAULT true,
  show_second_iban BOOLEAN DEFAULT false,
  
  -- Document metadata display
  show_payment_method BOOLEAN DEFAULT true,
  show_validity_days BOOLEAN DEFAULT true,
  show_delivery_days BOOLEAN DEFAULT true,
  default_validity_days INTEGER DEFAULT 15,
  default_delivery_days INTEGER DEFAULT 60,
  default_payment_method TEXT DEFAULT 'Transakcijski račun',
  
  -- Table columns configuration
  table_columns JSONB DEFAULT '["rbr","sifra","naziv","jmj","kolicina","cijena","rabat","cijena_s_rabatom","ukupno"]'::jsonb,
  show_pdv_breakdown BOOLEAN DEFAULT true,
  show_discount_column BOOLEAN DEFAULT true,
  
  -- Footer settings
  show_prepared_by BOOLEAN DEFAULT true,
  prepared_by_label TEXT DEFAULT 'Ponudu pripremio/la:',
  show_signature_line BOOLEAN DEFAULT true,
  show_stamp_placeholder BOOLEAN DEFAULT true,
  show_director_signature BOOLEAN DEFAULT true,
  show_certificates BOOLEAN DEFAULT false,
  certificate_images JSONB DEFAULT '[]'::jsonb,
  show_footer_contacts BOOLEAN DEFAULT true,
  show_registration_info BOOLEAN DEFAULT true,
  footer_note TEXT DEFAULT 'Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.',
  
  -- Styles
  primary_color TEXT DEFAULT '#1a365d',
  secondary_color TEXT DEFAULT '#4a5568',
  font_family TEXT DEFAULT 'Arial',
  header_font_size INTEGER DEFAULT 10,
  body_font_size INTEGER DEFAULT 9,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_templates
CREATE POLICY "Users can view their own templates"
ON public.document_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
ON public.document_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
ON public.document_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
ON public.document_templates FOR DELETE
USING (auth.uid() = user_id);

-- Admin employee policies
CREATE POLICY "Admin employees can view owner templates"
ON public.document_templates FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner templates"
ON public.document_templates FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner templates"
ON public.document_templates FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner templates"
ON public.document_templates FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_document_templates_updated_at
BEFORE UPDATE ON public.document_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add template_id to documents table for template selection
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.document_templates(id);

-- Add additional metadata fields to documents
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS validity_days INTEGER,
ADD COLUMN IF NOT EXISTS delivery_days INTEGER,
ADD COLUMN IF NOT EXISTS prepared_by TEXT;