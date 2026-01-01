-- Add works_saturday to employees
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS works_saturday BOOLEAN DEFAULT false;

-- Add manual_adjustment_days to employee_leave_entitlements
ALTER TABLE public.employee_leave_entitlements 
ADD COLUMN IF NOT EXISTS manual_adjustment_days INTEGER DEFAULT 0;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_leave_entitlements_employee_year 
ON public.employee_leave_entitlements(employee_id, year);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee 
ON public.employee_leave_requests(employee_id);

CREATE INDEX IF NOT EXISTS idx_leave_requests_dates 
ON public.employee_leave_requests(start_date, end_date);