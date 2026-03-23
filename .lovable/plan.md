

# Plan: Popravak teme + Auto/System detekcija

## Analiza

Pregledao sam kod i CSS tokene — tema (boje, fontovi, layout) je **netaknuta** u `index.css` i `tailwind.config.ts`. Akord žuta paleta, Work Sans/Space Grotesk fontovi i warm off-white pozadina su na mjestu.

Problem je vjerojatno u tome da je aplikacija zapela na loading spinneru (vidio sam to na screenshotu), te da History revert nije uspio vratiti stanje. Trebamo:

1. Popraviti potencijalni build problem (App.css `.card` konflikt)
2. Dodati "Auto po sustavu" opciju teme kako ste tražili

## Promjene

| Datoteka | Promjena |
|---|---|
| `src/App.css` | Obrisati `.card` selektor (linija 36-38) koji konflikta s Tailwind card komponentom — dodaje `padding: 2em` svim cardovima |
| `src/hooks/useTheme.tsx` | Proširiti na 3 opcije: `light`, `dark`, `system` — system prati `prefers-color-scheme` |
| `src/components/layout/Header.tsx` | Ažurirati theme toggle gumb: ciklira `light` → `dark` → `system` s odgovarajućom ikonom (Sun/Moon/Monitor) |
| `src/index.css` | Bez promjena — CSS tokeni su ispravni |

### Detalji: useTheme proširenje

```typescript
type Theme = 'light' | 'dark' | 'system';

// Ako je 'system', pratiti window.matchMedia('(prefers-color-scheme: dark)')
// Dodati mediaQuery listener koji automatski mijenja klasu na <html>
```

### Detalji: App.css čišćenje

`App.css` sadrži Vite starter CSS koji je zastario i uzrokuje konflikte:
- `#root { max-width: 1280px; padding: 2rem; text-align: center; }` — ograničava širinu i centrira sadržaj
- `.card { padding: 2em; }` — dodaje padding svim elementima s klasom `card`

Oba pravila treba ukloniti jer su relikti iz Vite boilerplate-a i interferiraju s Tailwind komponentama.

