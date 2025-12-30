-- Drop the existing check constraint
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_status_check;

-- Add updated check constraint with all valid status values
ALTER TABLE public.documents ADD CONSTRAINT documents_status_check 
CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'pending', 'completed', 'cancelled'));