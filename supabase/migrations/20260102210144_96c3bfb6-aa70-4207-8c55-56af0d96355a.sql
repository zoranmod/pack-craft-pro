-- Create document_settings table for global header/footer configuration
CREATE TABLE public.document_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid,
  UNIQUE(user_id, setting_key)
);

-- Enable RLS
ALTER TABLE public.document_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own document settings"
ON public.document_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document settings"
ON public.document_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document settings"
ON public.document_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document settings"
ON public.document_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Admin employee policies
CREATE POLICY "Admin employees can view owner document settings"
ON public.document_settings
FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner document settings"
ON public.document_settings
FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner document settings"
ON public.document_settings
FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- Create trigger to update updated_at
CREATE TRIGGER update_document_settings_updated_at
BEFORE UPDATE ON public.document_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();