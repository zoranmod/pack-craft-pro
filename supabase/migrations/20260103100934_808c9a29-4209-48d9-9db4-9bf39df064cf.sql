-- Update check constraint to include 'neradni_dan'
ALTER TABLE public.leave_request_excluded_dates 
DROP CONSTRAINT IF EXISTS leave_request_excluded_dates_reason_check;

ALTER TABLE public.leave_request_excluded_dates 
ADD CONSTRAINT leave_request_excluded_dates_reason_check 
CHECK (reason IN ('praznik', 'neradna_subota', 'radna_subota', 'neradni_dan', 'ostalo'));