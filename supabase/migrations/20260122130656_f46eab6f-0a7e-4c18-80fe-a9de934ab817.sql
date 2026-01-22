-- 1) Storage bucket for contract template backgrounds
insert into storage.buckets (id, name, public)
values ('contract-templates', 'contract-templates', false)
on conflict (id) do nothing;

-- 2) RLS policies for storage.objects in bucket `contract-templates`
-- We scope files by folder: <owner_user_id>/furniture-contract/p1.png etc.
-- owner_user_id is derived from the authenticated user via public.get_employee_owner(auth.uid()).

-- SELECT (needed for signed URLs / downloads)
drop policy if exists "contract_templates_select" on storage.objects;
create policy "contract_templates_select"
on storage.objects
for select
using (
  bucket_id = 'contract-templates'
  and (storage.foldername(name))[1] = public.get_employee_owner(auth.uid())::text
);

-- INSERT (upload)
drop policy if exists "contract_templates_insert" on storage.objects;
create policy "contract_templates_insert"
on storage.objects
for insert
with check (
  bucket_id = 'contract-templates'
  and (storage.foldername(name))[1] = public.get_employee_owner(auth.uid())::text
);

-- UPDATE (replace files / metadata)
drop policy if exists "contract_templates_update" on storage.objects;
create policy "contract_templates_update"
on storage.objects
for update
using (
  bucket_id = 'contract-templates'
  and (storage.foldername(name))[1] = public.get_employee_owner(auth.uid())::text
)
with check (
  bucket_id = 'contract-templates'
  and (storage.foldername(name))[1] = public.get_employee_owner(auth.uid())::text
);

-- DELETE (optional cleanup)
drop policy if exists "contract_templates_delete" on storage.objects;
create policy "contract_templates_delete"
on storage.objects
for delete
using (
  bucket_id = 'contract-templates'
  and (storage.foldername(name))[1] = public.get_employee_owner(auth.uid())::text
);
