
# Verzioniranje dokumenata

## Sto se radi
Automatsko spremanje snapshota dokumenta prije svake izmjene, tako da korisnik moze pregledati sve prethodne verzije i po potrebi vratiti dokument na stariju verziju.

## Kako funkcionira

Svaki put kad se dokument azurira (spremi promjene), sustav automatski sprema snapshot trenutnog stanja u tablicu `document_versions` -- prije nego sto se primijene nove promjene. Korisnik moze:
- Vidjeti listu svih verzija u sidebaru dokumenta (Verzija 1, Verzija 2, ...)
- Otvoriti bilo koju verziju i vidjeti njene podatke (klijent, stavke, iznos, napomene)
- Vratiti dokument na odabranu verziju jednim klikom

## Tehnicke promjene

### 1. Nova tablica u bazi: `document_versions`

```sql
CREATE TABLE public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  user_id UUID NOT NULL,
  snapshot JSONB NOT NULL,        -- kompletni podaci dokumenta u tom trenutku
  items_snapshot JSONB NOT NULL,  -- stavke dokumenta u tom trenutku
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT                       -- opcionalna biljeska o promjeni
);
CREATE INDEX idx_document_versions_doc ON public.document_versions(document_id, version_number);
```

RLS politike: vlasnik dokumenta i admin zaposlenici mogu vidjeti/kreirati verzije za svoje dokumente.

### 2. Izmjena hooka `useDocuments.tsx` -- `useUpdateDocument`

Prije nego sto se izvrsi UPDATE na `documents` tablicu, dohvatiti trenutno stanje dokumenta i njegovih stavki, te ih spremiti kao novi redak u `document_versions`:

```text
1. Dohvati trenutni dokument iz baze (SELECT)
2. Dohvati trenutne stavke (SELECT document_items)
3. Odredi version_number (MAX verzija + 1, ili 1 ako nema)
4. INSERT u document_versions (snapshot + items_snapshot)
5. Tek onda izvrsi UPDATE na documents i zamjenu stavki (postojeca logika)
```

### 3. Novi hook: `useDocumentVersions.tsx`

- `useDocumentVersions(documentId)` -- dohvaca listu verzija (id, version_number, created_at, snapshot summary)
- `useRestoreDocumentVersion()` -- mutacija koja ucitava snapshot i azurira dokument na tu verziju

### 4. Nova komponenta: `DocumentVersions.tsx`

Prikazuje se u sidebaru dokumenta (ispod DocumentHistory), sadrzi:
- Naslov "Verzije dokumenta" s brojem verzija
- Lista verzija s rednim brojem, datumom i ukupnim iznosom
- Klik na verziju otvara dialog s detaljima (klijent, stavke, iznos)
- Gumb "Vrati ovu verziju" u dialogu

### 5. Izmjena `DocumentDetail.tsx`

Dodati `<DocumentVersions documentId={document.id} />` u sidebar, ispod komponente DocumentHistory.

## Datoteke koje se mijenjaju/kreiraju

| Datoteka | Akcija |
|---|---|
| Migracija (nova tablica + RLS) | Nova |
| `src/hooks/useDocumentVersions.tsx` | Nova |
| `src/components/documents/DocumentVersions.tsx` | Nova |
| `src/hooks/useDocuments.tsx` | Izmjena (useUpdateDocument) |
| `src/components/documents/DocumentDetail.tsx` | Izmjena (dodavanje komponente) |

## Napomene
- Verzije se kreiraju automatski -- korisnik ne mora nista dodatno raditi
- Postojeci dokumenti nece imati prijasnje verzije (jer sustav do sad nije snimao), ali od sad ce svaka promjena biti sacuvana
- Snapshot se sprema kao JSON sto znaci da je fleksibilan i ne zahtijeva promjene u strukturi ako se dodaju nova polja
