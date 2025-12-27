-- Remove the overly permissive INSERT policy that allows any authenticated user to create notifications
-- Notifications should only be created via database triggers (which use SECURITY DEFINER and bypass RLS)
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;