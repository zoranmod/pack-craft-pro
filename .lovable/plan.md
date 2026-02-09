

# Popravak prikaza prvog slova stavki na PDF-u

## Problem
Prvo slovo naziva stavke na PDF ponudi prikazuje se cudno/iskrivljeno. Uzrok je nepotpuni (subsettirani) Roboto font koji se ucitava s CDN-a "ink" biblioteke (`cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/`). Taj font nema sve glifove, sto uzrokuje probleme pri renderiranju u @react-pdf/renderer.

## Rjesenje
Zamijeniti URL-ove fontova s potpunim Roboto fontovima s Google Fonts CDN-a (`fonts.gstatic.com`), koji sadrze punu podrsku za latinske znakove ukljucujuci hrvatske dijakriticke znakove.

## Tehnicke promjene

### Datoteka: `src/lib/pdfGenerator.tsx` (linije 21-27)

Zamijeniti trenutne URL-ove:
```text
Staro:
- roboto-regular-webfont.ttf  (ink CDN - nepotpun)
- roboto-bold-webfont.ttf     (ink CDN - nepotpun)

Novo:
- Roboto-Regular.ttf  (fonts.gstatic.com - potpun)
- Roboto-Bold.ttf     (fonts.gstatic.com - potpun)
```

Konkretno, zamjena registracije fontova na:
```
https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf  (regular)
https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf  (bold)
```

## Utjecaj
- Popravlja prikaz svih znakova na svim PDF dokumentima (ponude, otpremnice, nalozi, racuni, ugovori)
- Nema promjena u izgledu osim ispravnog renderiranja fontova
- Nema promjena u bazi podataka
