-- Kreiranje tablice za audit log
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  entity_name text,
  details jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indeksi za brže pretraživanje
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);

-- Omogući RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Vlasnici mogu vidjeti i kreirati logove za svoje podatke
CREATE POLICY "Users can view their own activity logs"
ON public.activity_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admin zaposlenici mogu vidjeti logove vlasnika
CREATE POLICY "Admin employees can view owner activity logs"
ON public.activity_logs FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- Omogući realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;