
# Klik na ime klijenta u listi dokumenata

## Sto se radi
Omoguciti da klik na ime klijenta u tablici dokumenata otvori podatke tog klijenta. Posto ne postoji zasebna stranica za detalje klijenta, klik ce navigirati na stranicu **Klijenti** (`/clients`) s unaprijed popunjenim pretrazivanjem po imenu tog klijenta -- tako da korisnik odmah vidi podatke tog klijenta.

## Kako ce funkcionirati
1. Korisnik klikne na ime klijenta u tablici dokumenata (npr. "Davor Kadic")
2. Aplikacija otvara stranicu `/clients?search=Davor+Kadic`
3. Stranica Klijenti automatski filtrira prikaz na tog klijenta
4. Korisnik moze odmah vidjeti ili urediti podatke klijenta

## Tehnicke promjene

### 1. `src/components/documents/DocumentList.tsx`
- Ime klijenta u stupcu "Klijent" postaje klikabilni link
- Link vodi na `/clients?search={clientName}` (URL-encoded)
- Stilizacija: podvuceni tekst pri hoveru, kursor pointer
- Klik na link ne smije triggerati klik na red tablice

### 2. `src/pages/Clients.tsx`
- Procitati `search` query parametar iz URL-a pri ucitavanju stranice
- Ako postoji `search` parametar, inicijalizirati polje za pretrazivanje s tom vrijednoscu

## Datoteke koje se mijenjaju

| Datoteka | Akcija |
|---|---|
| `src/components/documents/DocumentList.tsx` | Izmjena -- klijent ime kao link |
| `src/pages/Clients.tsx` | Izmjena -- citanje search parametra iz URL-a |
