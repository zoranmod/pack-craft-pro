

# Plan: Popravak boja i fontova — čista bijela + deblji fontovi

## Problem

Trenutni CSS tokeni koriste **toplu/žućkastu** pozadinu (`hsl(40, 10%, 96%)`) umjesto čiste bijele, i fontovi su pretanki.

## Promjene

### 1. `src/index.css` — Light mode tokeni

| Token | Sada | Novo |
|---|---|---|
| `--background` | `40 10% 96%` (topla off-white) | `0 0% 100%` (čista bijela) |
| `--foreground` | `30 8% 12%` (topla smeđa) | `0 0% 9%` (neutralno crna) |
| `--card` | `40 10% 98%` | `0 0% 100%` (bijela) |
| `--card-foreground` | `30 8% 12%` | `0 0% 9%` |
| `--popover` | `40 10% 98%` | `0 0% 100%` |
| `--popover-foreground` | `30 8% 12%` | `0 0% 9%` |
| `--secondary` | `35 6% 91%` | `0 0% 96%` (neutralna siva) |
| `--secondary-foreground` | `30 8% 12%` | `0 0% 9%` |
| `--muted` | `35 6% 91%` | `0 0% 96%` |
| `--muted-foreground` | `30 5% 45%` | `0 0% 45%` |
| `--border` | `35 8% 86%` | `0 0% 90%` (neutralna granica) |
| `--input` | `35 8% 86%` | `0 0% 90%` |
| `--sidebar-background` | `40 10% 98%` | `0 0% 100%` |
| `--sidebar-foreground` | `30 8% 12%` | `0 0% 9%` |
| `--sidebar-accent` | `35 6% 91%` | `0 0% 96%` |
| `--sidebar-accent-foreground` | `30 8% 12%` | `0 0% 9%` |
| `--sidebar-border` | `35 8% 86%` | `0 0% 90%` |

Primary/accent/ring ostaju nepromijenjeni (Akord žuta `38 80% 55%`).

### 2. `src/index.css` — Dark mode tokeni

| Token | Sada | Novo |
|---|---|---|
| `--background` | `30 8% 8%` | `0 0% 7%` (neutralni crni) |
| `--foreground` | `35 10% 96%` | `0 0% 95%` |
| `--card` | `30 8% 12%` | `0 0% 11%` |
| `--card-foreground` | `35 10% 96%` | `0 0% 95%` |
| `--popover` | `30 8% 12%` | `0 0% 11%` |
| `--popover-foreground` | `35 10% 96%` | `0 0% 95%` |
| `--secondary` | `30 6% 16%` | `0 0% 15%` |
| `--secondary-foreground` | `35 10% 96%` | `0 0% 95%` |
| `--muted` | `30 6% 16%` | `0 0% 15%` |
| `--muted-foreground` | `35 5% 72%` | `0 0% 65%` |
| `--border` | `30 6% 22%` | `0 0% 20%` |
| `--input` | `30 6% 22%` | `0 0% 20%` |
| `--sidebar-background` | `30 8% 8%` | `0 0% 7%` |
| `--sidebar-foreground` | `35 10% 96%` | `0 0% 95%` |
| `--sidebar-accent` | `30 6% 16%` | `0 0% 15%` |
| `--sidebar-accent-foreground` | `35 10% 96%` | `0 0% 95%` |
| `--sidebar-border` | `30 6% 22%` | `0 0% 20%` |
| `--badge-neutral` | `30 6% 24%` | `0 0% 22%` |

### 3. `src/index.css` — Deblji fontovi

U `@layer base` sekciji:
- Body: dodati `font-weight: 500` (medium umjesto regular 400)
- Headings: promijeniti `font-semibold` u `font-bold`

### 4. `src/components/ui/page-header.tsx` — Deblji greeting

- `text-2xl font-bold` → `text-2xl font-extrabold` za veći kontrast naslova

### 5. `src/components/dashboard/StatCard.tsx` — Deblji stat brojevi

- Stat value: `text-xl font-bold` → `text-xl font-extrabold`

## Datoteke za promjenu

| Datoteka | Promjena |
|---|---|
| `src/index.css` | Neutralni HSL tokeni (0 hue, 0 saturation) + deblji fontovi |
| `src/components/ui/page-header.tsx` | font-extrabold na naslovu |
| `src/components/dashboard/StatCard.tsx` | font-extrabold na vrijednostima |

