

# Plan: Prilagodba za hrvatsko tržište (HR)

Aplikacija je trenutno konfigurirana za BiH tržište. Potrebno je promijeniti sve reference na HR standard.

## Što se mijenja

| Stavka | Sada (BiH) | Novo (HR) |
|---|---|---|
| **Identifikator tvrtke** | JIB (13 znamenki) | OIB (11 znamenki) |
| **Valuta** | KM (Konvertibilna marka) | EUR (€) |
| **PDV stopa** | 17% | 25% |
| **Bankovni račun** | Transakcijski račun | IBAN |
| **Registracija** | Općinski sud u Sarajevu | Trgovački sud |
| **Telefon primjer** | +387 | +385 |
| **Adresa primjer** | Sarajevo, BiH | Zagreb, Hrvatska |

## Datoteke za promjenu

### 1. `src/lib/validation.ts` — OIB validacija
- Promijeniti iz 13-znamenkastog JIB-a u 11-znamenkasti OIB
- Ažurirati komentare i poruke grešaka

### 2. `src/lib/pdfGenerator.tsx` — PDF dokumenti
- `JIB:` → `OIB:`
- `KM` → `EUR` (svi iznosi)
- `PDV (17%)` → dinamički postotak (ne hardkodirani)
- `Transakcijski račun:` → `IBAN:`

### 3. `src/components/documents/DocumentForm.tsx`
- Default PDV: `17` → `25`
- Label `JIB` → `OIB`

### 4. `src/pages/Settings.tsx`
- Label `JIB` → `OIB`
- `Transakcijski račun` → `IBAN`
- Placeholder `Sarajevo, Bosna i Hercegovina` → `Zagreb, Hrvatska`
- Placeholder `Općinski sud u Sarajevu` → `Trgovački sud u Zagrebu`
- Placeholder `2.000,00 KM` → `2.000,00 EUR`
- Bankarski podaci opis: `Transakcijski računi` → `IBAN računi`

### 5. `src/pages/Articles.tsx`
- `KM` → `EUR` u cijenama i labelama

### 6. `src/components/documents/ContractDocumentView.tsx`
- `JIB:` → `OIB:`
- `Transakcijski račun:` → `IBAN:`

### 7. `src/components/documents/DocumentWysiwygEditor.tsx`
- `JIB:` → `OIB:`

### 8. `src/pages/ContractLayoutEditor.tsx`
- Primjeri i labele: JIB → OIB, Transakcijski račun → IBAN
- Primjeri adresa/telefona: HR format (+385, Zagreb)
- Primjeri cijena: KM → EUR

### 9. `src/pages/admin/AdminSettings.tsx`
- Default payment method: `Transakcijski račun` → `Virman`

### 10. `src/hooks/useDocumentTemplates.tsx`
- Default payment method: `Transakcijski račun` → `Virman`

### 11. `src/data/contractTemplates.ts`
- "Općinski sud u Županji" → "Trgovački sud" (generičko)

### 12. `src/components/documents/MosquitoNetQuoteForm.tsx` (ako sadrži KM/JIB)
- Isto ažuriranje valute/identifikatora

## Što se NE mijenja
- Apartmanski modul (već koristi EUR i OIB — zasebna logika)
- Struktura baze podataka (kolone ostaju iste, samo se labele mijenjaju)
- Tipovi (`types/document.ts`, `types/companySettings.ts`) — interno polje `oib` ostaje isto

