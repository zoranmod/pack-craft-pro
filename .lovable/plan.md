

# Plan: Dozvole zaposlenika — RLS + kod za pristup podacima vlasnika

## Problem
Trenutno samo zaposlenici s `can_manage_employees` (admin) mogu vidjeti podatke vlasnika. Zaposlenici s drugim dozvolama (npr. `can_view_documents`, `can_view_clients`) ne vide ništa jer:
1. **RLS politike** koriste samo `is_employee_admin()` — koja provjerava `can_manage_employees`
2. **Kod za INSERT** koristi `user.id` zaposlenika umjesto vlasnikovog `user_id`

## Rješenje

### 1. Nove RLS politike (migracija)
Dodati politike koje koriste postojeću `has_permission()` funkciju + `get_employee_owner()`:

| Tablica | Dozvola za SELECT | Dozvola za INSERT | Dozvola za UPDATE/DELETE |
|---|---|---|---|
| `documents` | `view_documents` | `create_documents` | `edit_documents` |
| `document_items` | `view_documents` (kroz documents join) | `create_documents` | `edit_documents` |
| `document_versions` | `view_documents` | `create_documents` | — |
| `document_tags` | `view_documents` | `edit_documents` | `edit_documents` |
| `document_templates` | `view_documents` | `edit_documents` | `edit_documents` |
| `articles` | `view_articles` | `edit_articles` | `edit_articles` |
| `clients` | `view_clients` | `edit_clients` | `edit_clients` |
| `contract_article_templates` | `view_documents` | `edit_documents` | `edit_documents` |
| `calendar_events` | `view_documents` | `create_documents` | `edit_documents` |
| `public_holidays` | `view_settings` | `edit_settings` | `edit_settings` |
| `reminders` | `view_documents` | `create_documents` | `edit_documents` |

Primjer politike:
```sql
CREATE POLICY "Employees with view_documents can see owner documents"
ON public.documents FOR SELECT
USING (
  has_permission(auth.uid(), 'view_documents')
  AND user_id = get_employee_owner(auth.uid())
);
```

### 2. Kod — `useOwnerUserId` proširenje
Svaki zaposlenik (ne samo admin) treba koristiti vlasnikov `user_id` za INSERT:

```typescript
// Bilo koji zaposlenik koristi owner's user_id
if (employee) {
  return employee.user_id;
}
return user?.id || null;
```

### 3. Kod — hookovi za CREATE koriste ownerUserId
Ažurirati `useCreateDocument`, `useCreateClient`, `useCreateArticle` i slične hookove da koriste `useOwnerUserId()` umjesto `user.id` za `user_id` polje.

## Datoteke za promjenu

| Datoteka | Promjena |
|---|---|
| Nova migracija | ~30 novih RLS politika |
| `src/hooks/useOwnerUserId.tsx` | Vratiti owner ID za svakog zaposlenika |
| `src/hooks/useDocuments.tsx` | Koristiti ownerUserId za INSERT |
| `src/hooks/useClients.tsx` | Koristiti ownerUserId za INSERT |
| `src/hooks/useArticles.tsx` | Koristiti ownerUserId za INSERT |
| `src/hooks/useCalendarEvents.tsx` | Koristiti ownerUserId za INSERT |
| `src/hooks/useReminders.tsx` | Koristiti ownerUserId za INSERT |
| Ostali hookovi s INSERT | Isti obrazac |

