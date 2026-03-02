

# Plan: Import podataka iz Excel tablice

## Izvučeni podaci iz Excela

### 1. Cjenik apartmana (Page 5)
Potpuno strukturirani podaci — spreman za import u `apartment_price_list`:

| Tip | Osobe | Bez doručka | S doručkom |
|-----|-------|-------------|------------|
| Apartman | 1 | 50 € | 60 € |
| Apartman | 2 | 60 € | 80 € |
| Apartman | 3 | 80 € | 110 € |
| Apartman | 4 | 100 € | 140 € |
| Apartman | 5 | 120 € | 170 € |
| Apartman | 6 | 140 € | 200 € |
| Soba | 1 | 50 € | 60 € |
| Soba | 2 | 60 € | 80 € |
| Soba | 3 | 80 € | 110 € |

### 2. Evidencija računa (Page 6)
24 računa s načinom plaćanja, datumom i iznosom — import u `apartment_documents`.

### 3. Baza klijenata/dobavljača (Page 7+)
Cca 400+ zapisa s nazivom, šifrom, adresom, OIB-om i kontakt podacima. Ovo su **dobavljači glavnog ERP-a (Akord)**, ne apartmanski gosti. Import u `clients` tablicu ili `suppliers` tablicu u glavnom ERP-u.

## Što ću napraviti

1. **Kreirati stranicu za import** na apartmanskom portalu s gumbom koji pokreće batch insert
2. **Cjenik**: automatski upisati 9 redova u `apartment_price_list` tablicu koristeći SQL insert
3. **Evidencija računa**: upisati 24 dokumenta u `apartment_documents`
4. **Baza dobavljača**: upisati ~400 zapisa u `clients` tablicu glavnog ERP-a (jer su to Akord dobavljači, ne apartmanski gosti)

## Tehnički pristup

Umjesto Edge Function-a, napravit ću **seed skriptu** — React stranicu koja pri kliku pokreće batch insert pozive prema bazi. Korisnik klikne gumb, podaci se unesu, i stranica prikaže rezultat.

Alternativno, mogu koristiti SQL migraciju za statičke podatke (cjenik), a za klijente napraviti import komponentu.

### Datoteke

| Datoteka | Promjena |
|---|---|
| `src/pages/apartmani/ApartmentDataImport.tsx` | Nova stranica za import s 3 gumba (cjenik, računi, dobavljači) |
| `src/App.tsx` | Dodati rutu za import stranicu |
| SQL migration | Insert cjenika (9 redova) — ako je sigurnije preko migracije |

## Napomena

Baza dobavljača (~400 zapisa) iz Excela su **Akord dobavljači**, ne apartmanski gosti. Importirat ću ih u `clients` tablicu glavnog ERP-a. Ako želite i apartmanske goste importirati, trebat će mi posebna Excel lista s podacima o gostima.

