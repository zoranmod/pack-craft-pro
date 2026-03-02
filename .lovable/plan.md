

# Plan: Apartmani Špoljar -- pristup portalu, branding i prilagodbe

## 1. Kreiranje korisnika za apartmanski portal

Trenutno, apartmanski portal koristi isti auth sustav kao i glavni ERP. Da biste pristupili, trebate:
- Prijaviti se sa **istim emailom i lozinkom** kojim se prijavljujete u glavni ERP
- Zatim u tablici `apartment_users` treba postojati zapis koji povezuje vaš auth korisnički ID sa apartmanskim portalom

**Što ću napraviti:**
- Dodati opciju na login stranicu da se vlasnik (owner) može prijaviti direktno bez zapisa u `apartment_users` tablici (jer je on vlasnik svih podataka)
- Alternativno, kreirati SQL migraciju koja će automatski dodati vašeg korisnika u `apartment_users` tablicu kao admina

## 2. Preimenovanje u "Apartmani Špoljar"

Promjene na 3 mjesta:
- **Login stranica**: naslov "Apartmanski portal" → "Apartmani Špoljar"
- **Sidebar layout**: "Apartmani" → "Apartmani Špoljar"
- **Browser tab / title**: prilagoditi

## 3. Logo

Nažalost, iz Excel datoteke nije bilo moguće izvući logo (slike se ne mogu ekstrahirati iz .xlsm formata na ovaj način). 

**Trebam od vas:** Uploadajte logo "Apartmani Špoljar" kao sliku (PNG ili JPG) u chat, pa ću ga ugraditi u login stranicu i sidebar.

## 4. Prilagodbe iz Excel tablice (već implementirano)

Iz analize Excela potvrđujem da su sljedeći elementi već pokriveni u prethodnim implementacijama:
- 4 tipa dokumenata (Ponuda, Račun, Potvrda rezervacije, Potvrda uplate)
- Cjenik po broju osoba (apartman i soba, sa/bez doručka)
- Evidencija računa (registar) s načinom plaćanja
- IBAN podaci (HR82... i HR28...) -- ovo ćemo ugraditi u dokumente kad budemo radili PDF generiranje
- Napomene o PDV-u i boravišnoj pristojbi -- isto za PDF fazu

## Datoteke koje se mijenjaju

| Datoteka | Promjena |
|---|---|
| `src/pages/apartmani/ApartmentLogin.tsx` | Branding "Apartmani Špoljar", prilagodba auth logike za ownera |
| `src/components/apartmani/ApartmentLayout.tsx` | Naslov sidebara → "Apartmani Špoljar" |
| `src/components/apartmani/ApartmentProtectedRoute.tsx` | Dozvoliti pristup owner korisniku i bez zapisa u apartment_users |
| `src/hooks/useApartmentAuth.tsx` | Prilagodba da owner može pristupiti bez apartment_users zapisa |

