-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('database-backups', 'database-backups', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for backups bucket - only admins can access
CREATE POLICY "Admins can manage backups"
ON storage.objects
FOR ALL
USING (bucket_id = 'database-backups' AND is_admin(auth.uid()))
WITH CHECK (bucket_id = 'database-backups' AND is_admin(auth.uid()));