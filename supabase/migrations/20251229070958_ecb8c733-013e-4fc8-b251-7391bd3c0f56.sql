-- Make company-logos bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'company-logos';

-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view company logos" ON storage.objects;

-- Create a new SELECT policy that requires authentication and owner access
CREATE POLICY "Authenticated users can view company logos" 
ON storage.objects FOR SELECT
USING (
  bucket_id = 'company-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);