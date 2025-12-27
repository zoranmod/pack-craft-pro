-- Create app_role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add auth_user_id to employees table (links employee to their auth account)
ALTER TABLE public.employees ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX employees_auth_user_id_unique ON public.employees(auth_user_id) WHERE auth_user_id IS NOT NULL;

-- Add carried_over_days to leave entitlements
ALTER TABLE public.employee_leave_entitlements ADD COLUMN carried_over_days integer DEFAULT 0;

-- Create employee_permissions table
CREATE TABLE public.employee_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  -- Dokumenti
  can_view_documents boolean DEFAULT false,
  can_create_documents boolean DEFAULT false,
  can_edit_documents boolean DEFAULT false,
  -- Zaposlenici
  can_manage_employees boolean DEFAULT false,
  -- Godišnji i bolovanja
  can_request_leave boolean DEFAULT true,
  can_approve_leave boolean DEFAULT false,
  can_request_sick_leave boolean DEFAULT true,
  -- Radna odjeća
  can_view_work_clothing boolean DEFAULT true,
  -- Artikli
  can_view_articles boolean DEFAULT false,
  can_edit_articles boolean DEFAULT false,
  -- Klijenti
  can_view_clients boolean DEFAULT false,
  can_edit_clients boolean DEFAULT false,
  -- Postavke
  can_view_settings boolean DEFAULT false,
  can_edit_settings boolean DEFAULT false,
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(employee_id)
);

-- Enable RLS on employee_permissions
ALTER TABLE public.employee_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin (has admin role OR owns employees)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM public.employees WHERE user_id = _user_id
  )
$$;

-- Create function to get employee_id for a given auth user
CREATE OR REPLACE FUNCTION public.get_employee_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.employees WHERE auth_user_id = _user_id LIMIT 1
$$;

-- Create function to get the admin (owner) user_id for an employee
CREATE OR REPLACE FUNCTION public.get_employee_admin(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.employees WHERE auth_user_id = _user_id LIMIT 1
$$;

-- Create function to check if employee has a specific permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employee_permissions p ON p.employee_id = e.id
    WHERE e.auth_user_id = _user_id
    AND CASE _permission
      WHEN 'view_documents' THEN p.can_view_documents
      WHEN 'create_documents' THEN p.can_create_documents
      WHEN 'edit_documents' THEN p.can_edit_documents
      WHEN 'manage_employees' THEN p.can_manage_employees
      WHEN 'request_leave' THEN p.can_request_leave
      WHEN 'approve_leave' THEN p.can_approve_leave
      WHEN 'request_sick_leave' THEN p.can_request_sick_leave
      WHEN 'view_work_clothing' THEN p.can_view_work_clothing
      WHEN 'view_articles' THEN p.can_view_articles
      WHEN 'edit_articles' THEN p.can_edit_articles
      WHEN 'view_clients' THEN p.can_view_clients
      WHEN 'edit_clients' THEN p.can_edit_clients
      WHEN 'view_settings' THEN p.can_view_settings
      WHEN 'edit_settings' THEN p.can_edit_settings
      ELSE false
    END
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- RLS policies for employee_permissions
-- Admin (owner of employee) can manage permissions
CREATE POLICY "Admin can manage employee permissions"
  ON public.employee_permissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.employees 
    WHERE employees.id = employee_permissions.employee_id 
    AND employees.user_id = auth.uid()
  ));

-- Employee can view their own permissions
CREATE POLICY "Employee can view own permissions"
  ON public.employee_permissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.employees 
    WHERE employees.id = employee_permissions.employee_id 
    AND employees.auth_user_id = auth.uid()
  ));

-- Update employees RLS to allow employees to view their own record
CREATE POLICY "Employees can view their own employee record"
  ON public.employees FOR SELECT
  USING (auth.uid() = auth_user_id);

-- Allow employees to view leave entitlements if they have permission
CREATE POLICY "Employees can view own leave entitlements"
  ON public.employee_leave_entitlements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE employees.id = employee_leave_entitlements.employee_id 
      AND employees.auth_user_id = auth.uid()
    )
  );

-- Allow employees to create leave requests if they have permission
CREATE POLICY "Employees can create own leave requests"
  ON public.employee_leave_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE employees.id = employee_leave_requests.employee_id 
      AND employees.auth_user_id = auth.uid()
    )
    AND public.has_permission(auth.uid(), 'request_leave')
  );

-- Allow employees to view their own leave requests
CREATE POLICY "Employees can view own leave requests"
  ON public.employee_leave_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE employees.id = employee_leave_requests.employee_id 
      AND employees.auth_user_id = auth.uid()
    )
  );

-- Allow employees to create sick leave if they have permission
CREATE POLICY "Employees can create own sick leave"
  ON public.employee_sick_leaves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE employees.id = employee_sick_leaves.employee_id 
      AND employees.auth_user_id = auth.uid()
    )
    AND public.has_permission(auth.uid(), 'request_sick_leave')
  );

-- Allow employees to view their own sick leaves
CREATE POLICY "Employees can view own sick leaves"
  ON public.employee_sick_leaves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees 
      WHERE employees.id = employee_sick_leaves.employee_id 
      AND employees.auth_user_id = auth.uid()
    )
  );

-- Trigger to update updated_at on employee_permissions
CREATE TRIGGER update_employee_permissions_updated_at
  BEFORE UPDATE ON public.employee_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();