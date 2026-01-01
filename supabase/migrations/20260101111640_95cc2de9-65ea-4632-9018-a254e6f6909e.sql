-- Create leave_request_excluded_dates table for per-request Saturday selection and neradni dan exclusions
CREATE TABLE public.leave_request_excluded_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  leave_request_id UUID NOT NULL REFERENCES public.employee_leave_requests(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('neradna_subota', 'neradni_dan')),
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create unique constraint to prevent duplicate dates per request
CREATE UNIQUE INDEX leave_request_excluded_dates_unique ON public.leave_request_excluded_dates(leave_request_id, date) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE public.leave_request_excluded_dates ENABLE ROW LEVEL SECURITY;

-- Users can view excluded dates for their employees' leave requests
CREATE POLICY "Users can view excluded dates of their employees leave requests"
ON public.leave_request_excluded_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND e.user_id = auth.uid()
  )
);

-- Users can insert excluded dates for their employees' leave requests
CREATE POLICY "Users can insert excluded dates for their employees leave requests"
ON public.leave_request_excluded_dates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND e.user_id = auth.uid()
  )
);

-- Users can update excluded dates of their employees' leave requests
CREATE POLICY "Users can update excluded dates of their employees leave requests"
ON public.leave_request_excluded_dates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND e.user_id = auth.uid()
  )
);

-- Users can delete excluded dates of their employees' leave requests
CREATE POLICY "Users can delete excluded dates of their employees leave requests"
ON public.leave_request_excluded_dates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND e.user_id = auth.uid()
  )
);

-- Admin employees can view all owner excluded dates
CREATE POLICY "Admin employees can view owner excluded dates"
ON public.leave_request_excluded_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND is_employee_admin(auth.uid())
    AND e.user_id = get_employee_owner(auth.uid())
  )
);

-- Admin employees can manage owner excluded dates
CREATE POLICY "Admin employees can manage owner excluded dates"
ON public.leave_request_excluded_dates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND is_employee_admin(auth.uid())
    AND e.user_id = get_employee_owner(auth.uid())
  )
);

-- Employees can view excluded dates for their own leave requests
CREATE POLICY "Employees can view own excluded dates"
ON public.leave_request_excluded_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND e.auth_user_id = auth.uid()
  )
);

-- Employees can manage excluded dates for their own leave requests
CREATE POLICY "Employees can manage own excluded dates"
ON public.leave_request_excluded_dates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.employee_leave_requests lr
    JOIN public.employees e ON e.id = lr.employee_id
    WHERE lr.id = leave_request_excluded_dates.leave_request_id
    AND e.auth_user_id = auth.uid()
  )
);