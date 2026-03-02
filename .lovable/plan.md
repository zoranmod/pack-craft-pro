

# Apartmanski modul -- Prošireni zahtjevi

## Pregled

Apartmanski portal sa podrškom za pravna/fizička lica, 6 smještajnih jedinica (3 apartmana + 3 sobe), cijene po osobi/noćenju, i opcionalnu Booking.com integraciju.

---

## Baza podataka (nove tablice)

### `apartment_users`
Korisnici koji pristupaju apartmanskom portalu (poseban login).
- `id`, `auth_user_id` (ref auth.users), `owner_user_id` (glavni korisnik ERP-a), `name`, `role` (admin/receptionist)

### `apartment_units`
Smještajne jedinice -- 3 apartmana + 3 sobe.
- `id`, `owner_user_id`, `name` (npr. "Apartman 1"), `unit_type` (apartment/room), `capacity` (max osoba), `price_per_person` (cijena po osobi/noćenju), `description`, `is_active`

### `apartment_guests`
Evidencija gostiju sa podrškom za pravna i fizička lica.
- `id`, `owner_user_id`, `guest_type` (fizicko_lice / pravno_lice)
- Fizička lica: `first_name`, `last_name`, `id_number` (broj lične karte/pasoša), `nationality`, `date_of_birth`
- Pravna lica: `company_name`, `jib`, `pdv_number`, `contact_person`
- Zajednička: `phone`, `email`, `address`, `country`

### `apartment_reservations`
Rezervacije sa automatskim obračunom.
- `id`, `unit_id`, `guest_id`, `check_in`, `check_out`, `adults`, `children`, `price_per_person`, `breakfast_included`, `breakfast_price_per_person`, `tourist_tax_per_person`, `total_amount`, `status` (reserved/checked_in/checked_out/cancelled), `source` (manual/booking_com), `booking_reference`, `notes`

### `apartment_documents`
Ponude i računi za apartmane.
- `id`, `reservation_id`, `document_type` (ponuda/racun), `number`, `date`, `total_amount`, `status`, `pdf_data`

---

## Booking.com integracija

Booking.com nudi **Connectivity Partner API** ali zahtijeva partnerski ugovor. Realnija opcija:

### Opcija A: iCal sync (preporučeno za početak)
- Booking.com eksportuje iCal feed za svaki apartman
- Backend funkcija periodično čita iCal URL-ove i kreira rezervacije sa `source = 'booking_com'`
- Jednostavno, bez partnerskog ugovora

### Opcija B: Ručni unos
- Korisnik ručno unosi rezervacije sa Booking.com-a
- Označava izvor kao "Booking.com" i upisuje referentni broj

### Opcija C: Email parsing (napredno)
- Booking.com šalje email za svaku rezervaciju
- Edge funkcija parsira dolazne emailove i automatski kreira rezervacije

**Preporuka:** Krenuti sa Opcijom B (ručni unos sa označenim izvorom), pa naknadno dodati iCal sync.

---

## Stranice i rute

| Ruta | Opis |
|---|---|
| `/apartmani/login` | Poseban login za apartmanski portal |
| `/apartmani` | Dashboard -- zauzetost, danas check-in/out |
| `/apartmani/jedinice` | Pregled 6 jedinica, cijene po osobi |
| `/apartmani/rezervacije` | Lista svih rezervacija |
| `/apartmani/rezervacije/nova` | Nova rezervacija (odabir jedinice, gost, datumi) |
| `/apartmani/gosti` | Evidencija gostiju (pravna + fizička lica) |
| `/apartmani/dokumenti` | Ponude i računi |

---

## Obračun (automatski)

```text
Noćenje:    cijena_po_osobi × broj_osoba × broj_noći
Doručak:    cijena_doručka × broj_osoba × broj_dana
Bor. taksa: taksa_po_osobi × broj_osoba × broj_noći
─────────────────────────────────────────────────────
UKUPNO:     Noćenje + Doručak + Bor. taksa
PDV 17%:    automatski obračunat
```

---

## Implementacija -- redoslijed

1. **Baza** -- kreiranje 5 tablica sa RLS politikama
2. **Auth** -- apartmanski login i `ApartmentProtectedRoute`
3. **Layout** -- sidebar i navigacija za apartmanski portal
4. **Jedinice** -- stranica za upravljanje sobama/apartmanima i cijenama
5. **Gosti** -- CRUD za fizička i pravna lica
6. **Rezervacije** -- kreiranje, kalendar zauzetosti, automatski obračun
7. **Dokumenti** -- generisanje ponuda i računa
8. **Booking sync** -- iCal ili ručni unos (faza 2)

---

## Datoteke koje se kreiraju

- `src/pages/apartmani/` -- Login, Dashboard, Units, Reservations, Guests, Documents (7 stranica)
- `src/components/apartmani/` -- forme, liste, kalendar zauzetosti
- `src/hooks/useApartment*.tsx` -- hookovi za CRUD operacije
- `src/types/apartment.ts` -- TypeScript tipovi
- Migracija za 5 novih tablica

