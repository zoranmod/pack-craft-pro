-- Funkcija za provjeru je li korisnik admin zaposlenik (ima can_manage_employees)
CREATE OR REPLACE FUNCTION public.is_employee_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees e
    JOIN public.employee_permissions p ON p.employee_id = e.id
    WHERE e.auth_user_id = _user_id
    AND p.can_manage_employees = true
  )
$$;

-- Funkcija za dohvat vlasnika (user_id) za admin zaposlenika
CREATE OR REPLACE FUNCTION public.get_employee_owner(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.user_id FROM public.employees e
  WHERE e.auth_user_id = _user_id
  LIMIT 1
$$;

-- RLS politike za ARTICLES
CREATE POLICY "Admin employees can view owner articles"
ON public.articles FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner articles"
ON public.articles FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner articles"
ON public.articles FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner articles"
ON public.articles FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- RLS politike za CLIENTS
CREATE POLICY "Admin employees can view owner clients"
ON public.clients FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner clients"
ON public.clients FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner clients"
ON public.clients FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner clients"
ON public.clients FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- RLS politike za DOCUMENTS
CREATE POLICY "Admin employees can view owner documents"
ON public.documents FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner documents"
ON public.documents FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner documents"
ON public.documents FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner documents"
ON public.documents FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- RLS politike za DOCUMENT_ITEMS (preko documents)
CREATE POLICY "Admin employees can view owner document items"
ON public.document_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_items.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can insert owner document items"
ON public.document_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_items.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can update owner document items"
ON public.document_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_items.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can delete owner document items"
ON public.document_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_items.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za DOCUMENT_CONTRACT_ARTICLES (preko documents)
CREATE POLICY "Admin employees can view owner contract articles"
ON public.document_contract_articles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_contract_articles.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can insert owner contract articles"
ON public.document_contract_articles FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_contract_articles.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can update owner contract articles"
ON public.document_contract_articles FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_contract_articles.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can delete owner contract articles"
ON public.document_contract_articles FOR DELETE
USING (EXISTS (
  SELECT 1 FROM documents d
  WHERE d.id = document_contract_articles.document_id
  AND is_employee_admin(auth.uid())
  AND d.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za CONTRACT_ARTICLE_TEMPLATES
CREATE POLICY "Admin employees can view owner templates"
ON public.contract_article_templates FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner templates"
ON public.contract_article_templates FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner templates"
ON public.contract_article_templates FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner templates"
ON public.contract_article_templates FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- RLS politike za COMPANY_SETTINGS
CREATE POLICY "Admin employees can view owner settings"
ON public.company_settings FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner settings"
ON public.company_settings FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- RLS politike za EMPLOYEES (admin zaposlenik može vidjeti sve zaposlenike istog vlasnika)
CREATE POLICY "Admin employees can view all owner employees"
ON public.employees FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can insert owner employees"
ON public.employees FOR INSERT
WITH CHECK (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner employees"
ON public.employees FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner employees"
ON public.employees FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

-- RLS politike za EMPLOYEE_PERMISSIONS
CREATE POLICY "Admin employees can view all owner permissions"
ON public.employee_permissions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_permissions.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner permissions"
ON public.employee_permissions FOR ALL
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_permissions.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za EMPLOYEE_DOCUMENTS
CREATE POLICY "Admin employees can view all owner employee documents"
ON public.employee_documents FOR SELECT
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_documents.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner employee documents"
ON public.employee_documents FOR ALL
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_documents.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za EMPLOYEE_LEAVE_ENTITLEMENTS
CREATE POLICY "Admin employees can view all owner leave entitlements"
ON public.employee_leave_entitlements FOR SELECT
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_leave_entitlements.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner leave entitlements"
ON public.employee_leave_entitlements FOR ALL
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_leave_entitlements.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za EMPLOYEE_LEAVE_REQUESTS
CREATE POLICY "Admin employees can view all owner leave requests"
ON public.employee_leave_requests FOR SELECT
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_leave_requests.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner leave requests"
ON public.employee_leave_requests FOR ALL
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_leave_requests.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za EMPLOYEE_SICK_LEAVES
CREATE POLICY "Admin employees can view all owner sick leaves"
ON public.employee_sick_leaves FOR SELECT
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_sick_leaves.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner sick leaves"
ON public.employee_sick_leaves FOR ALL
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_sick_leaves.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za EMPLOYEE_WORK_CLOTHING
CREATE POLICY "Admin employees can view all owner work clothing"
ON public.employee_work_clothing FOR SELECT
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_work_clothing.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

CREATE POLICY "Admin employees can manage owner work clothing"
ON public.employee_work_clothing FOR ALL
USING (EXISTS (
  SELECT 1 FROM employees e
  WHERE e.id = employee_work_clothing.employee_id
  AND is_employee_admin(auth.uid())
  AND e.user_id = get_employee_owner(auth.uid())
));

-- RLS politike za NOTIFICATIONS
CREATE POLICY "Admin employees can view owner notifications"
ON public.notifications FOR SELECT
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can update owner notifications"
ON public.notifications FOR UPDATE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));

CREATE POLICY "Admin employees can delete owner notifications"
ON public.notifications FOR DELETE
USING (is_employee_admin(auth.uid()) AND user_id = get_employee_owner(auth.uid()));