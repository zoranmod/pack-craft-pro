-- Update the reason column to allow 'radna_subota' as a valid value
-- The column is text type so we just need to ensure it accepts the new value

-- Add a comment to document the valid values
COMMENT ON COLUMN leave_request_excluded_dates.reason IS 'Valid values: neradna_subota (exclude Saturday for employee who normally works Saturdays), neradni_dan (exclude a weekday), radna_subota (include Saturday for employee who normally does not work Saturdays)';