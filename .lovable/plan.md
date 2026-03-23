

# Plan: Forsirani publish — tema je ispravna

## Analiza

Detaljno sam usporedio oba screenshota s trenutnim kodom:

| Element | Screenshot | Kod | Status |
|---|---|---|---|
| Pozadina (light) | Topla off-white | `40 10% 96%` | Odgovara |
| Pozadina (dark) | Tamni charcoal | `30 8% 8%` | Odgovara |
| Kartice (light) | Bijela | `40 10% 98%` | Odgovara |
| Kartice (dark) | Tamno siva | `30 8% 12%` | Odgovara |
| Akord žuta | Amber akcent | `38 80% 55%` | Odgovara |
| Font | Work Sans | `font-family: 'Work Sans'` | Odgovara |
| Sidebar nav font | ~13px | `text-[13px]` | Odgovara |
| Greeting font | ~24px bold | `text-2xl font-bold` | Odgovara |
| Stat card values | ~20px bold | `text-xl font-bold` | Odgovara |
| Granice (light) | Topla siva | `35 8% 86%` | Odgovara |
| Granice (dark) | Tamna | `30 6% 22%` | Odgovara |

**Zaključak: Kod u potpunosti odgovara screenshotovima. Tema je ispravna.**

## Problem
Published verzija nije ažurirana jer sustav smatra da nema novih promjena.

## Rješenje
Napraviti malu ali stvarnu promjenu koja će omogućiti novi publish — dodati CSS komentar s timestampom u `src/index.css` (na samom vrhu, prije `@tailwind` direktiva).

| Datoteka | Promjena |
|---|---|
| `src/index.css` | Dodati komentar `/* build: 2026-03-23 */` na vrh datoteke |

Nakon toga korisnik može kliknuti "Publish" i published verzija će odgovarati screenshotovima.

