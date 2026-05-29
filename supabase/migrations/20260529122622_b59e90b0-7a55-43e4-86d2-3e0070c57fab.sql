CREATE TABLE public.furniture_complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_name text NOT NULL,
  customer_location text,
  customer_phone text,
  description text,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  deadline_date date,
  status text NOT NULL DEFAULT 'otvoreno',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.furniture_complaints TO authenticated;
GRANT ALL ON public.furniture_complaints TO service_role;

ALTER TABLE public.furniture_complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own furniture complaints"
ON public.furniture_complaints FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin employees manage owner furniture complaints"
ON public.furniture_complaints FOR ALL
TO authenticated
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()))
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Emp view_documents can see owner furniture complaints"
ON public.furniture_complaints FOR SELECT
TO authenticated
USING (has_permission(auth.uid(), 'view_documents') AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Emp create_documents can insert owner furniture complaints"
ON public.furniture_complaints FOR INSERT
TO authenticated
WITH CHECK (has_permission(auth.uid(), 'create_documents') AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Emp edit_documents can update owner furniture complaints"
ON public.furniture_complaints FOR UPDATE
TO authenticated
USING (has_permission(auth.uid(), 'edit_documents') AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Emp edit_documents can delete owner furniture complaints"
ON public.furniture_complaints FOR DELETE
TO authenticated
USING (has_permission(auth.uid(), 'edit_documents') AND user_id = get_employee_owner(auth.uid()));

CREATE TRIGGER update_furniture_complaints_updated_at
BEFORE UPDATE ON public.furniture_complaints
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_furniture_complaints_user ON public.furniture_complaints(user_id);
CREATE INDEX idx_furniture_complaints_deadline ON public.furniture_complaints(deadline_date);