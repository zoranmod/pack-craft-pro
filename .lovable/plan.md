

# Plan: Lokalizacija na HR + PDF generiranje za apartmanske dokumente

## 1. Lokalizacija engleskih termina na hrvatski

Sljedeći engleski termini trebaju biti prevedeni u svim apartmanskim stranicama:

| Trenutno | Promjena |
|---|---|
| "Check-in" | "Dolazak" |
| "Check-out" | "Odlazak" |
| "Dashboard" | "Početna" |
| "Check-in danas" / "Check-out danas" | "Dolasci danas" / "Odlasci danas" |
| "Nema check-in-ova za danas" | "Nema dolazaka za danas" |
| "Nema check-out-ova za danas" | "Nema odlazaka za danas" |
| statusLabels "Check-in" / "Check-out" | "Prijavljen" / "Odjavljen" |

**Datoteke:**
- `src/pages/apartmani/ApartmentDashboard.tsx`
- `src/pages/apartmani/ApartmentReservations.tsx`
- `src/pages/apartmani/ApartmentDocuments.tsx`
- `src/components/apartmani/ApartmentLayout.tsx` (nav label "Dashboard" → "Početna")

## 2. PDF generiranje za apartmanske dokumente

Kreirati novi PDF generator za apartmane koristeći `@react-pdf/renderer` (isti pristup kao glavni Akord portal), baziran na izgledu iz Excel tablice (račun sa zaglavljem firme, stavkama, i napomenama).

### Nova datoteka: `src/lib/pdf/ApartmentDocumentPdf.tsx`

PDF layout prema Excel uzorku:
- **Zaglavlje**: Logo + "Apartmani Špoljar" s kompletnim poslovnim podacima (adresa, OIB, IBAN, žiro račun, telefon, email) iz `APARTMENT_COMPANY_INFO`
- **Naslov**: "PONUDA br. X" ili "RAČUN br. X"
- **Podaci o gostu**: Ime, adresa, OIB
- **Tablica stavki**: Smještajna jedinica, datumi dolaska/odlaska, broj noćenja, broj osoba, cijena po noći, ukupno
- **Napomene**: PDV napomena, boravišna pristojba napomena
- **Potpis blok**: Za ponude — rok važenja, predujam, potpis

### Nova datoteka: `src/pages/apartmani/ApartmentDocumentPdf.tsx`

Ruta `/apartmani/pdf/:id` — učitava dokument iz baze, generira PDF blob i prikazuje u iframe (isti pattern kao `/pdf/:id` na glavnom portalu).

### Izmjena: `src/pages/apartmani/ApartmentDocuments.tsx`

Dodati gumb "Otvori PDF" u tablici dokumenata i u dialog formi koji otvara `/apartmani/pdf/:id`.

### Izmjena: `src/App.tsx`

Dodati rutu `/apartmani/pdf/:id`.

## Sažetak datoteka

| Datoteka | Promjena |
|---|---|
| `src/pages/apartmani/ApartmentDashboard.tsx` | HR lokalizacija |
| `src/pages/apartmani/ApartmentReservations.tsx` | HR lokalizacija |
| `src/pages/apartmani/ApartmentDocuments.tsx` | HR lokalizacija + gumb "Otvori PDF" |
| `src/components/apartmani/ApartmentLayout.tsx` | "Dashboard" → "Početna" |
| `src/lib/pdf/ApartmentDocumentPdf.tsx` | **Nova** — PDF komponenta za apartmane |
| `src/pages/apartmani/ApartmentDocumentPdf.tsx` | **Nova** — ruta za prikaz PDF-a |
| `src/App.tsx` | Nova ruta |

