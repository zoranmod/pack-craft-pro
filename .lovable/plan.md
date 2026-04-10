

# Plan: Zamjena svih "Adaptiva" referenci s "Akord"

## Problem
Na 6 mjesta u kodu postoje hardkodirani fallback podaci s "Adaptiva Design" umjesto "Akord". Kad korisnik nema upisane podatke tvrtke u postavkama, prikazuju se Adaptiva podaci.

## Promjene

### 1. `src/components/documents/MemorandumFooter.tsx`
- Hardkodirani footer: `www.adaptivadesign.ba • info@adaptivadesign.ba` i `Adaptiva Design d.o.o.`
- Zamijeniti s dinamičkim podacima iz companySettings (treba dodati props), ili fallback na Akord podatke

### 2. `src/lib/pdfGenerator.tsx`
- `'www.adaptivadesign.ba'` → `'www.akord.hr'`
- `'info@adaptivadesign.ba'` → `'info@akord.hr'`
- `'Adaptiva Design d.o.o.'` → `'Akord d.o.o.'` (2 mjesta — replacePlaceholders i contract section)

### 3. `src/components/documents/ContractDocumentView.tsx`
- `'Adaptiva Design d.o.o.'` → `'Akord d.o.o.'` (2 mjesta — replacePlaceholders i seller display)

### 4. `src/pages/ContractLayoutEditor.tsx`
- Placeholder example: `'Adaptiva Design d.o.o.'` → `'Akord d.o.o.'`
- Fallback u preview rendereru: `'Adaptiva Design d.o.o.'` → `'Akord d.o.o.'`

### 5. `src/pages/Settings.tsx`
- Placeholder na company_name input: `"Adaptiva Design d.o.o."` → `"Akord d.o.o."`
- Placeholder website: `"www.adaptivadesign.ba"` → `"www.akord.hr"`
- Placeholder email: `"info@adaptivadesign.ba"` → `"info@akord.hr"`

### 6. `src/components/layout/Sidebar.tsx`
- Fallback company name: `'Adaptiva Design'` → `'Akord'`

## Datoteke za promjenu (6 datoteka)

| Datoteka | Broj zamjena |
|---|---|
| `src/lib/pdfGenerator.tsx` | 4 |
| `src/components/documents/ContractDocumentView.tsx` | 2 |
| `src/components/documents/MemorandumFooter.tsx` | 3 |
| `src/pages/ContractLayoutEditor.tsx` | 2 |
| `src/pages/Settings.tsx` | 3 |
| `src/components/layout/Sidebar.tsx` | 1 |

