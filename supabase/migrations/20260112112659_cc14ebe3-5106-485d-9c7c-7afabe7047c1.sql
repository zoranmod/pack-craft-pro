-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can delete ignored duplicates" ON public.ignored_duplicates;
DROP POLICY IF EXISTS "Authenticated users can insert ignored duplicates" ON public.ignored_duplicates;
DROP POLICY IF EXISTS "Authenticated users can view ignored duplicates" ON public.ignored_duplicates;

-- Create proper user-scoped policies
-- Users can only view duplicates they created
CREATE POLICY "Users can view their own ignored duplicates"
ON public.ignored_duplicates
FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Users can only insert duplicates with themselves as creator
CREATE POLICY "Users can insert their own ignored duplicates"
ON public.ignored_duplicates
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can only delete duplicates they created
CREATE POLICY "Users can delete their own ignored duplicates"
ON public.ignored_duplicates
FOR DELETE
TO authenticated
USING (created_by = auth.uid());