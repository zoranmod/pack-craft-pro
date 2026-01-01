-- Add soft delete columns to employee_leave_requests table
ALTER TABLE public.employee_leave_requests 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- Add soft delete columns to employee_work_clothing table
ALTER TABLE public.employee_work_clothing 
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;