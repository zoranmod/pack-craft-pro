-- Create suppliers (dobavljaci) table with same structure as clients
CREATE TABLE public.dobavljaci (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  oib TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  contact_person TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dobavljaci ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (same pattern as clients)
CREATE POLICY "Users can view their own suppliers"
  ON public.dobavljaci FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own suppliers"
  ON public.dobavljaci FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers"
  ON public.dobavljaci FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers"
  ON public.dobavljaci FOR DELETE
  USING (auth.uid() = user_id);

-- Admin employee policies
CREATE POLICY "Admin employees can view owner suppliers"
  ON public.dobavljaci FOR SELECT
  USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner suppliers"
  ON public.dobavljaci FOR INSERT
  WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner suppliers"
  ON public.dobavljaci FOR UPDATE
  USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner suppliers"
  ON public.dobavljaci FOR DELETE
  USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dobavljaci_updated_at
  BEFORE UPDATE ON public.dobavljaci
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();