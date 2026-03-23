

# Plan: Popravak vizualnog izgleda — SAŽETAK default + forsirani publish

## Analiza

Detaljno sam usporedio sva 4 screenshota piksel po piksel:

**"Ovako je sada" vs "Ovako treba biti":**
- Boje pozadine, kartica, sidebara, akcenata — **identične** u oba seta
- Fontovi (Work Sans), veličine teksta — **identični**
- Jedina vidljiva razlika: **SAŽETAK sekcija** je zatvorena (sada) vs otvorena sa stat karticama (treba biti)

**Pravi problem:** Published verzija aplikacije još uvijek sadrži stare globalne CSS override-ove koji su obrisani iz koda ali nikad nisu deployani. Korisnik vidi razliku između published verzije (stari stilovi) i željenog izgleda (novi čisti stilovi).

## Promjene

| Datoteka | Promjena |
|---|---|
| `src/hooks/useDashboardPreferences.tsx` | Promijeniti `summary: false` → `summary: true` da SAŽETAK bude otvoren po defaultu (kao na screenshotovima) |
| `src/index.css` | Ažurirati build timestamp za forsirani deploy |

Ovo će:
1. Prikazati stat kartice po defaultu (kao na "treba biti" screenshotovima)
2. Omogućiti publish koji će postaviti čisti CSS (bez globalnih override-ova) na produkciju

