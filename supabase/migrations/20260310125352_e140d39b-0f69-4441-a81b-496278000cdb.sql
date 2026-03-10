
-- =============================================
-- RLS policies for employees with granular permissions
-- =============================================

-- DOCUMENTS: SELECT with view_documents
CREATE POLICY "Emp view_documents can see owner docs"
ON public.documents FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENTS: INSERT with create_documents
CREATE POLICY "Emp create_documents can insert owner docs"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'create_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENTS: UPDATE with edit_documents
CREATE POLICY "Emp edit_documents can update owner docs"
ON public.documents FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENTS: DELETE with edit_documents
CREATE POLICY "Emp edit_documents can delete owner docs"
ON public.documents FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENT_ITEMS: SELECT
CREATE POLICY "Emp view_documents can see owner doc items"
ON public.document_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_items.document_id
    AND has_permission(auth.uid(), 'view_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_ITEMS: INSERT
CREATE POLICY "Emp create_documents can insert owner doc items"
ON public.document_items FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_items.document_id
    AND has_permission(auth.uid(), 'create_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_ITEMS: UPDATE
CREATE POLICY "Emp edit_documents can update owner doc items"
ON public.document_items FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_items.document_id
    AND has_permission(auth.uid(), 'edit_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_ITEMS: DELETE
CREATE POLICY "Emp edit_documents can delete owner doc items"
ON public.document_items FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_items.document_id
    AND has_permission(auth.uid(), 'edit_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_VERSIONS: SELECT
CREATE POLICY "Emp view_documents can see owner doc versions"
ON public.document_versions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_versions.document_id
    AND has_permission(auth.uid(), 'view_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_VERSIONS: INSERT
CREATE POLICY "Emp create_documents can insert owner doc versions"
ON public.document_versions FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_versions.document_id
    AND has_permission(auth.uid(), 'create_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_TAGS: SELECT
CREATE POLICY "Emp view_documents can see owner doc tags"
ON public.document_tags FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_tags.document_id
    AND has_permission(auth.uid(), 'view_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_TAGS: INSERT
CREATE POLICY "Emp edit_documents can insert owner doc tags"
ON public.document_tags FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_tags.document_id
    AND has_permission(auth.uid(), 'edit_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_TAGS: UPDATE
CREATE POLICY "Emp edit_documents can update owner doc tags"
ON public.document_tags FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_tags.document_id
    AND has_permission(auth.uid(), 'edit_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_TAGS: DELETE
CREATE POLICY "Emp edit_documents can delete owner doc tags"
ON public.document_tags FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM documents d
    WHERE d.id = document_tags.document_id
    AND has_permission(auth.uid(), 'edit_documents')
    AND d.user_id = get_employee_owner(auth.uid())
  )
);

-- DOCUMENT_TEMPLATES: SELECT
CREATE POLICY "Emp view_documents can see owner templates"
ON public.document_templates FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENT_TEMPLATES: INSERT
CREATE POLICY "Emp edit_documents can insert owner templates"
ON public.document_templates FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENT_TEMPLATES: UPDATE
CREATE POLICY "Emp edit_documents can update owner templates"
ON public.document_templates FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOCUMENT_TEMPLATES: DELETE
CREATE POLICY "Emp edit_documents can delete owner templates"
ON public.document_templates FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- ARTICLES: SELECT
CREATE POLICY "Emp view_articles can see owner articles"
ON public.articles FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_articles')
  AND user_id = get_employee_owner(auth.uid())
);

-- ARTICLES: INSERT
CREATE POLICY "Emp edit_articles can insert owner articles"
ON public.articles FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'edit_articles')
  AND user_id = get_employee_owner(auth.uid())
);

-- ARTICLES: UPDATE
CREATE POLICY "Emp edit_articles can update owner articles"
ON public.articles FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_articles')
  AND user_id = get_employee_owner(auth.uid())
);

-- ARTICLES: DELETE
CREATE POLICY "Emp edit_articles can delete owner articles"
ON public.articles FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_articles')
  AND user_id = get_employee_owner(auth.uid())
);

-- CLIENTS: SELECT
CREATE POLICY "Emp view_clients can see owner clients"
ON public.clients FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_clients')
  AND user_id = get_employee_owner(auth.uid())
);

-- CLIENTS: INSERT
CREATE POLICY "Emp edit_clients can insert owner clients"
ON public.clients FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'edit_clients')
  AND user_id = get_employee_owner(auth.uid())
);

-- CLIENTS: UPDATE
CREATE POLICY "Emp edit_clients can update owner clients"
ON public.clients FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_clients')
  AND user_id = get_employee_owner(auth.uid())
);

-- CLIENTS: DELETE
CREATE POLICY "Emp edit_clients can delete owner clients"
ON public.clients FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_clients')
  AND user_id = get_employee_owner(auth.uid())
);

-- CONTRACT_ARTICLE_TEMPLATES: SELECT
CREATE POLICY "Emp view_documents can see owner contract templates"
ON public.contract_article_templates FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CONTRACT_ARTICLE_TEMPLATES: INSERT
CREATE POLICY "Emp edit_documents can insert owner contract templates"
ON public.contract_article_templates FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CONTRACT_ARTICLE_TEMPLATES: UPDATE
CREATE POLICY "Emp edit_documents can update owner contract templates"
ON public.contract_article_templates FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CONTRACT_ARTICLE_TEMPLATES: DELETE
CREATE POLICY "Emp edit_documents can delete owner contract templates"
ON public.contract_article_templates FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CALENDAR_EVENTS: SELECT
CREATE POLICY "Emp view_documents can see owner calendar events"
ON public.calendar_events FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CALENDAR_EVENTS: INSERT
CREATE POLICY "Emp create_documents can insert owner calendar events"
ON public.calendar_events FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'create_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CALENDAR_EVENTS: UPDATE
CREATE POLICY "Emp edit_documents can update owner calendar events"
ON public.calendar_events FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- CALENDAR_EVENTS: DELETE
CREATE POLICY "Emp edit_documents can delete owner calendar events"
ON public.calendar_events FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- PUBLIC_HOLIDAYS: SELECT
CREATE POLICY "Emp view_settings can see owner holidays"
ON public.public_holidays FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_settings')
  AND user_id = get_employee_owner(auth.uid())
);

-- PUBLIC_HOLIDAYS: INSERT
CREATE POLICY "Emp edit_settings can insert owner holidays"
ON public.public_holidays FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'edit_settings')
  AND user_id = get_employee_owner(auth.uid())
);

-- PUBLIC_HOLIDAYS: UPDATE
CREATE POLICY "Emp edit_settings can update owner holidays"
ON public.public_holidays FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_settings')
  AND user_id = get_employee_owner(auth.uid())
);

-- PUBLIC_HOLIDAYS: DELETE
CREATE POLICY "Emp edit_settings can delete owner holidays"
ON public.public_holidays FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_settings')
  AND user_id = get_employee_owner(auth.uid())
);

-- REMINDERS: SELECT
CREATE POLICY "Emp view_documents can see owner reminders"
ON public.reminders FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- REMINDERS: INSERT
CREATE POLICY "Emp create_documents can insert owner reminders"
ON public.reminders FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'create_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- REMINDERS: UPDATE
CREATE POLICY "Emp edit_documents can update owner reminders"
ON public.reminders FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- REMINDERS: DELETE
CREATE POLICY "Emp edit_documents can delete owner reminders"
ON public.reminders FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- COMPANY_SETTINGS: SELECT for employees with view_settings
CREATE POLICY "Emp view_settings can see owner company settings"
ON public.company_settings FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_settings')
  AND user_id = get_employee_owner(auth.uid())
);

-- COMPANY_SETTINGS: UPDATE for employees with edit_settings
CREATE POLICY "Emp edit_settings can update owner company settings"
ON public.company_settings FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_settings')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOBAVLJACI (suppliers): SELECT for employees with view_documents
CREATE POLICY "Emp view_documents can see owner suppliers"
ON public.dobavljaci FOR SELECT TO authenticated
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOBAVLJACI: INSERT
CREATE POLICY "Emp edit_documents can insert owner suppliers"
ON public.dobavljaci FOR INSERT TO authenticated
WITH CHECK (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOBAVLJACI: UPDATE
CREATE POLICY "Emp edit_documents can update owner suppliers"
ON public.dobavljaci FOR UPDATE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);

-- DOBAVLJACI: DELETE
CREATE POLICY "Emp edit_documents can delete owner suppliers"
ON public.dobavljaci FOR DELETE TO authenticated
USING (
  has_permission(auth.uid(), 'edit_documents')
  AND user_id = get_employee_owner(auth.uid())
);
