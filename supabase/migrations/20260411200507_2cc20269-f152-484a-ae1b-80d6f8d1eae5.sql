
-- 1. Remove activity_logs from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.activity_logs;

-- 2. Fix is_admin function - only check user_roles, not employees table
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 3. Fix employee_permissions self-escalation
DROP POLICY IF EXISTS "Admin employees can manage owner permissions" ON public.employee_permissions;

CREATE POLICY "Admin employees can manage owner permissions"
ON public.employee_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = employee_permissions.employee_id
    AND is_employee_admin(auth.uid())
    AND e.user_id = get_employee_owner(auth.uid())
    AND e.auth_user_id IS DISTINCT FROM auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.id = employee_permissions.employee_id
    AND is_employee_admin(auth.uid())
    AND e.user_id = get_employee_owner(auth.uid())
    AND e.auth_user_id IS DISTINCT FROM auth.uid()
  )
);

-- 4. Add storage policy for employees to read their own documents
CREATE POLICY "Employees can view own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'employee-documents'
  AND (storage.foldername(name))[1] = (SELECT e.user_id::text FROM public.employees e WHERE e.auth_user_id = auth.uid() LIMIT 1)
);
