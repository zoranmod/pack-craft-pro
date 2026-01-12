-- Create table for storing WYSIWYG contract layout templates
CREATE TABLE public.contract_layout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  html_content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contract_layout_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies - owners can manage their templates
CREATE POLICY "Users can view their own contract layout templates" 
ON public.contract_layout_templates 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  user_id = (SELECT get_employee_owner(auth.uid()))
);

CREATE POLICY "Users can create their own contract layout templates" 
ON public.contract_layout_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contract layout templates" 
ON public.contract_layout_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contract layout templates" 
ON public.contract_layout_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_contract_layout_templates_updated_at
BEFORE UPDATE ON public.contract_layout_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();