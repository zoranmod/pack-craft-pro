

# Plan: PDF prikaz unutar aplikacije (PWA kompatibilno)

## Problem
Aplikacija se koristi kao PWA (shortcut iz Chromea) — nema tabova. `window.open` otvara PDF ali korisnik se ne može vratiti.

## Rješenje
Umjesto otvaranja PDF-a u novom tabu, prikazati PDF **inline unutar aplikacije** koristeći `<iframe>` s blob URL-om, i dodati gumb "Natrag" na vrhu stranice.

## Promjene

| Datoteka | Promjena |
|---|---|
| `src/pages/apartmani/ApartmentPdfView.tsx` | Umjesto `window.open` — renderirati PDF u `<iframe>` na cijeloj stranici s gumbom "Natrag" na vrhu |

## Detalji
- Generirati PDF blob kao i do sada
- Umjesto `window.open(url, '_blank')` → postaviti blob URL u state
- Renderirati `<iframe src={blobUrl}>` koji zauzima cijeli ekran ispod gumba "Natrag"
- Gumb "Natrag" koristi `navigate(-1)` za povratak na listu dokumenata

