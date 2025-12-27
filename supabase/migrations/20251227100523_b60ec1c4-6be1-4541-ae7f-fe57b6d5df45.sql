-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  oib TEXT,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  employment_start_date DATE NOT NULL,
  employment_end_date DATE,
  position TEXT,
  department TEXT,
  employment_type TEXT NOT NULL DEFAULT 'stalni',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'aktivan',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_leave_entitlements table (godišnji odmor - prava)
CREATE TABLE public.employee_leave_entitlements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 20,
  used_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, year)
);

-- Create employee_leave_requests table (zahtjevi za godišnji)
CREATE TABLE public.employee_leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  leave_type TEXT NOT NULL DEFAULT 'godišnji',
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  approved_by TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_sick_leaves table (bolovanja)
CREATE TABLE public.employee_sick_leaves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  days_count INTEGER,
  sick_leave_type TEXT NOT NULL DEFAULT 'bolovanje',
  document_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_work_clothing table (radna odjeća/oprema)
CREATE TABLE public.employee_work_clothing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  return_date DATE,
  condition TEXT NOT NULL DEFAULT 'novo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_documents table (dokumenti)
CREATE TABLE public.employee_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  expiry_date DATE,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_sick_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_work_clothing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for employees
CREATE POLICY "Users can view their own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for employee_leave_entitlements (via employee ownership)
CREATE POLICY "Users can view leave entitlements of their employees" ON public.employee_leave_entitlements FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_entitlements.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can create leave entitlements for their employees" ON public.employee_leave_entitlements FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_entitlements.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update leave entitlements of their employees" ON public.employee_leave_entitlements FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_entitlements.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete leave entitlements of their employees" ON public.employee_leave_entitlements FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_entitlements.employee_id AND employees.user_id = auth.uid()));

-- RLS policies for employee_leave_requests
CREATE POLICY "Users can view leave requests of their employees" ON public.employee_leave_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_requests.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can create leave requests for their employees" ON public.employee_leave_requests FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_requests.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update leave requests of their employees" ON public.employee_leave_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_requests.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete leave requests of their employees" ON public.employee_leave_requests FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_leave_requests.employee_id AND employees.user_id = auth.uid()));

-- RLS policies for employee_sick_leaves
CREATE POLICY "Users can view sick leaves of their employees" ON public.employee_sick_leaves FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_sick_leaves.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can create sick leaves for their employees" ON public.employee_sick_leaves FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_sick_leaves.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update sick leaves of their employees" ON public.employee_sick_leaves FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_sick_leaves.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete sick leaves of their employees" ON public.employee_sick_leaves FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_sick_leaves.employee_id AND employees.user_id = auth.uid()));

-- RLS policies for employee_work_clothing
CREATE POLICY "Users can view work clothing of their employees" ON public.employee_work_clothing FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_work_clothing.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can create work clothing for their employees" ON public.employee_work_clothing FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_work_clothing.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update work clothing of their employees" ON public.employee_work_clothing FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_work_clothing.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete work clothing of their employees" ON public.employee_work_clothing FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_work_clothing.employee_id AND employees.user_id = auth.uid()));

-- RLS policies for employee_documents
CREATE POLICY "Users can view documents of their employees" ON public.employee_documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_documents.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can create documents for their employees" ON public.employee_documents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_documents.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can update documents of their employees" ON public.employee_documents FOR UPDATE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_documents.employee_id AND employees.user_id = auth.uid()));
CREATE POLICY "Users can delete documents of their employees" ON public.employee_documents FOR DELETE USING (EXISTS (SELECT 1 FROM public.employees WHERE employees.id = employee_documents.employee_id AND employees.user_id = auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_leave_entitlements_updated_at BEFORE UPDATE ON public.employee_leave_entitlements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_leave_requests_updated_at BEFORE UPDATE ON public.employee_leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_sick_leaves_updated_at BEFORE UPDATE ON public.employee_sick_leaves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_work_clothing_updated_at BEFORE UPDATE ON public.employee_work_clothing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON public.employee_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for employee documents
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false);

-- Storage policies for employee documents
CREATE POLICY "Users can view their employee documents" ON storage.objects FOR SELECT USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their employee documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their employee documents" ON storage.objects FOR UPDATE USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their employee documents" ON storage.objects FOR DELETE USING (bucket_id = 'employee-documents' AND auth.uid()::text = (storage.foldername(name))[1]);