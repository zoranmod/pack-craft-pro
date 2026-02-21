

# Bosanska verzija programa -- Adaptiva Design ERP

## Pregled

Kreiranje zasebnog programa za bosansko trziste (BiH) kao remix ovog projekta, sa tri kljucne prilagodbe:

1. **Bosanski jezik** -- svi tekstovi prevedeni na bosanski
2. **BiH PDV 17%** -- umjesto hrvatskog 25%
3. **Adaptiva Design dizajn** -- boje, fontovi i stil preuzeti sa adaptivadesign.lovable.app

---

## Korak 1: Remix projekta

Korisnik treba napraviti remix ovog projekta:
- Ici na **Settings** (ikona zupcanika) u gornjem lijevom kutu
- Kliknuti **"Remix this project"**
- Nazvati novi projekt npr. "Adaptiva Design ERP" ili "Adaptiva BiH"

Nakon remixa, sve daljnje izmjene rade se iskljucivo u novom projektu.

---

## Korak 2: Promjena dizajna (tema i fontovi)

Preuzimamo vizualni identitet sa Adaptiva Design stranice:

### Boje (CSS varijable u `index.css`)
- **Primary/Accent:** Toplo zlatna `40 55% 45%` (light) / `42 60% 50%` (dark)
- **Background:** Topla bjelkasta `40 10% 96%` umjesto ciste bijele
- **Card:** `40 10% 98%`
- **Border:** `35 8% 86%`
- **Muted:** `35 6% 91%`
- Dark mode: tamno-smeda osnova `30 8% 8%`

### Fontovi
- **Naslovi:** Space Grotesk (bold, geometric)
- **Tekst:** Work Sans (clean, readable)
- Dodati Google Fonts import i konfiguraciju u `tailwind.config.ts`

### Radius
- `0.5rem` umjesto `10px` -- blaze zaobljeni rubovi

---

## Korak 3: Lokalizacija na bosanski jezik

Prijevod svih hardkodiranih tekstova u aplikaciji:

| Hrvatski | Bosanski |
|---|---|
| Ponude | Ponude |
| Otpremnice | Otpremnice |
| Nalozi | Nalozi |
| Računi | Računi |
| Klijenti | Klijenti |
| Dokumenti | Dokumenti |
| Postavke | Postavke |
| Novi dokument | Novi dokument |
| Spremi | Spasi / Sačuvaj |
| Obriši | Obriši |
| Uredi | Uredi |
| Pretraži | Pretraži |
| Godišnji odmori | Godišnji odmori |
| Bolovanja | Bolovanja |
| Zaposlenici | Zaposlenici |
| OIB | JIB |
| IBAN | Transakcijski račun |

Napomena: vecina poslovnih termina je ista ili vrlo slicna na bosanskom i hrvatskom. Glavne razlike su u terminologiji za porezne identifikatore (JIB umjesto OIB) i nekim glagolskim oblicima.

---

## Korak 4: Porezne i pravne prilagodbe

### PDV
- Default stopa: **17%** (umjesto 25%)
- BiH ima jednu stopu PDV-a (nema snizene stope)

### Identifikatori tvrtke
- **JIB** (Jedinstveni identifikacioni broj) umjesto OIB
- **PDV broj** -- format drugaciji od hrvatskog
- Registracija kod opcijskog suda umjesto trgovackog

### Valuta
- **KM (Konvertibilna marka)** umjesto EUR
- Format: `1.234,56 KM`

### Promjene u kodu
- `companySettings.ts` -- polja `oib` preimenovati label u "JIB", dodati polje za PDV broj BiH formata
- `DocumentForm` i svi PDF generatori -- KM umjesto EUR, 17% PDV
- Default postavke u `defaultCompanySettings`

---

## Korak 5: Logo i branding

- Zamijeniti Akord logo sa Adaptiva Design logom
- Azurirati nazive u headeru, sidebar-u i memorandumu
- Korisnik ce trebati uploadati svoj logo i memorandum header/footer

---

## Datoteke koje se mijenjaju (u remixanom projektu)

| Datoteka | Promjena |
|---|---|
| `src/index.css` | Nove boje i font import iz Adaptiva teme |
| `tailwind.config.ts` | Space Grotesk + Work Sans fontovi, novi radius |
| `src/components/layout/Sidebar.tsx` | Bosanski nazivi navigacije |
| `src/components/layout/Header.tsx` | Bosanski tekst |
| `src/pages/*.tsx` | Prijevod svih page titlova i labela |
| `src/components/documents/DocumentForm.tsx` | JIB, KM, 17% PDV |
| `src/types/companySettings.ts` | JIB umjesto OIB, KM default |
| `src/lib/pdfGenerator.tsx` | KM valuta, BiH format |
| `src/hooks/useSettings.tsx` | Default 17% PDV |
| `src/config/documentStatus.ts` | Bosanski nazivi statusa |
| Svi form/dialog komponenti | Prevedeni labeli i placeholder tekst |

---

## Sljedeci korak

**Korisnik treba napraviti remix projekta** -- nakon toga cu u novom projektu implementirati sve gore navedene promjene. Remix se pravi u Settings -> "Remix this project".

