
# Preporuke za poboljsanje programa

Nakon detaljnog pregleda aplikacije, evo 5 konkretnih prijedloga koji bi donijeli najvecu prakticnu korist za svakodnevni rad:

---

## 1. Brzi pregled klijenta (Quick Preview) bez napustanja stranice

**Problem:** Trenutno klik na ime klijenta navigira na drugu stranicu. Cesto korisnik samo zeli brzo pogledati telefon ili adresu klijenta.

**Rjesenje:** Dodati hover karticu (popover) na ime klijenta u tablici dokumenata koja prikazuje:
- Ime, OIB, adresa
- Telefon, email
- Broj dokumenata tog klijenta
- Gumb "Otvori detalje" za punu navigaciju

**Tehnicke promjene:**
- Koristiti `HoverCard` komponentu (vec instalirana: `@radix-ui/react-hover-card`)
- Izmjena u `DocumentList.tsx` -- wrap `clientName` linka u `HoverCard`
- Novi upit u bazi za dohvat klijenta po imenu (ili kesirano iz vec ucitanih podataka)

---

## 2. Tipkovnicke precice (Keyboard Shortcuts)

**Problem:** Za ceste radnje (novi dokument, pretraga, navigacija) korisnik mora klikati kroz menije.

**Rjesenje:** Dodati globalne tipkovnicke precice:
- `Ctrl+K` / `Cmd+K` -- otvori globalnu pretragu
- `Ctrl+N` / `Cmd+N` -- novi dokument (otvori dropdown za odabir tipa)
- `Ctrl+S` / `Cmd+S` -- spremi (na stranicama za uredivanje)
- `Escape` -- zatvori modal/vrati se nazad

**Tehnicke promjene:**
- Nova datoteka: `src/hooks/useKeyboardShortcuts.tsx`
- Integracija u `MainLayout.tsx`
- Mali indikator precica u tooltipu gumbova

---

## 3. Oznake/tagovi na dokumentima

**Problem:** Dokumenti se mogu filtrirati samo po tipu, statusu i klijentu. Nema mogucnosti grupiranja po projektu, lokaciji ili prilagodenom kriteriju.

**Rjesenje:** Dodati sustav tagova (oznaka) na dokumente:
- Korisnik moze dodati jedan ili vise tagova na dokument (npr. "Projekt Centar", "Hitno", "Zagreb")
- Filtriranje po tagovima u tablici dokumenata
- Automatsko predlaganje postojecih tagova pri unosu

**Tehnicke promjene:**
- Nova tablica `document_tags` u bazi (id, document_id, tag_name, user_id, created_at)
- RLS politike za pristup
- Novi hook `useDocumentTags.tsx`
- Chip komponenta za prikaz tagova u tablici i na detaljima dokumenta
- Tag filter u toolbar-u

---

## 4. Dupliciranje dokumenta s izmjenom klijenta

**Problem:** Kopiranje dokumenta trenutno kopira sve podatke ukljucujuci klijenta. Cesto korisnik zeli istu ponudu poslati drugom klijentu.

**Rjesenje:** Kod kopiranja dokumenta ponuditi opciju:
- "Kopiraj za istog klijenta" (kao sada)
- "Kopiraj za drugog klijenta" -- otvori dijalog za odabir/promjenu klijenta prije kopiranja

**Tehnicke promjene:**
- Izmjena u `DocumentList.tsx` i `DocumentDetail.tsx` -- novi dijalog s autocomplete za klijente
- Koristiti vec postojecu `ClientAutocomplete` komponentu
- Prosirivanje `useCopyDocument` hooka s opcionalnim override podacima

---

## 5. Statistika po klijentu na kartici klijenta

**Problem:** Na stranici Klijenti nema uvida u to koliko je dokumenata/prometa vezano za pojedinog klijenta.

**Rjesenje:** Prikazati uz svakog klijenta:
- Broj dokumenata (po tipu)
- Ukupni iznos svih ponuda/racuna
- Datum zadnjeg dokumenta
- Mini indikator aktivnosti (aktivan/neaktivan)

**Tehnicke promjene:**
- Agregacijski upit u bazi ili izracun na frontendu iz vec ucitanih dokumenata
- Prosiriti prikaz klijenta na `Clients.tsx` s dodatnim stupcima ili karticama
- Opcijski: klikabilni broj dokumenata koji vodi na filtrirani popis dokumenata tog klijenta

---

## Preporuceni redoslijed implementacije

| Prioritet | Funkcionalnost | Razlog |
|---|---|---|
| 1 | Brzi pregled klijenta (hover) | Odmah koristan, nema promjena u bazi |
| 2 | Dupliciranje s izmjenom klijenta | Cest use case, mala promjena |
| 3 | Statistika po klijentu | Daje uvid u poslovanje |
| 4 | Tagovi na dokumentima | Zahtijeva novu tablicu, ali jako koristan |
| 5 | Tipkovnicke precice | Poboljsava brzinu rada |

Odaberite koje od ovih zelite implementirati, ili mozemo kombinirati vise njih u jednom koraku.
