

## Plan: Ugradnja loga i poslovnih podataka iz PDF-a

### Izvučeni podaci

**Logo:** Uspješno izvučen iz PDF-a -- sadrži stiliziran tekst "Apartmani Špoljar" s kućicom i 4 zvjezdice.

**Poslovni podaci:**
- Naziv: Apartmani Špoljar - Ugostiteljske usluge u domaćinstvu
- Vlasnik: Mario Špoljar
- Adresa: Veliki kraj 133, 32270 Županja
- OIB: 93483491514
- IBAN: HR2123400093206330292
- Žiro račun: HR2823400093102324341
- Tel: 098 217 427
- Email: apartmani.spoljar@gmail.com

**Iz računa (korisno za buduće PDF generiranje):**
- Napomena o PDV-u: "Pdv nije uračunat u cijenu temeljem čl 90. st. 2. Zakona o PDV-u"
- Napomena o boravišnoj pristojbi: "Boravišna pristojba je uračunata u cijenu apartmana"
- SWIFT/BIC: PBZGHR2X (Privredna banka Zagreb)

### Što ću napraviti

1. **Kopirati logo** u `src/assets/apartmani-spoljar-logo.jpg`
2. **Login stranica** -- zamijeniti Building2 ikonu s pravim logom
3. **Sidebar** -- dodati logo umjesto Building2 ikone
4. **Spremiti poslovne podatke** kao konstantu za buduće PDF generiranje (IBAN, OIB, adresa, napomene)

### Datoteke

| Datoteka | Promjena |
|---|---|
| `src/assets/apartmani-spoljar-logo.jpg` | Nova datoteka -- logo |
| `src/pages/apartmani/ApartmentLogin.tsx` | Logo umjesto ikone |
| `src/components/apartmani/ApartmentLayout.tsx` | Logo u sidebaru |
| `src/types/apartment.ts` | Dodati konstantu s poslovnim podacima |

