

# Plan: Ukloniti globalne CSS override-ove koji kvare izgled

## Problem

U `src/index.css` (linije 440-625) postoji blok nazvan "GLOBAL APP STYLE UPGRADE" koji globalnim CSS selektorima pregažuje Tailwind/shadcn komponente:

- `button { border-radius: 10px; }` — mijenja oblik SVIH gumba
- `button:hover { opacity: 0.9; transform: translateY(-1px); }` — dodaje hover efekt svim gumbima
- `input, select, textarea { padding: 10px 14px; border-radius: 8px; }` — mijenja padding i oblik svih input polja
- `.card { background; border; box-shadow; transition }` — pregažuje Tailwind `.card` klasu
- `.badge { border-radius: 30px; font-size: 13px; }` — pregažuje shadcn Badge komponentu
- `.card:hover { box-shadow }` — dodaje neželjeni hover efekt na kartice

Ovi globalni stilovi su dodani naknadno i uzrokuju razlike u fontovima, veličinama i bojama u odnosu na originalni dizajn sa screenshotova.

## Rješenje

Obrisati cijeli "GLOBAL APP STYLE UPGRADE" blok (linije 440-625) iz `src/index.css`. Zadržati sve ispred njega (CSS tokene, print stilove, A4 layout, scrollbar stilove, dark mode card/table stilove).

| Datoteka | Promjena |
|---|---|
| `src/index.css` | Obrisati linije 440-625 (globalni CSS override-ovi za button, input, card, badge, table) |

## Što se briše

```text
- Legacy CSS varijable aliases (--bg-light, --accent, itd.)
- Globalni html/body font-smooth
- .card/.panel/.box override (i hover)
- button/btn/action globalni stilovi
- button.primary/.btn-primary
- .stat-card override
- .badge globalni stilovi
- .row-item / .activity-item stilovi
- input/select/textarea globalni stilovi
- table globalni stilovi
- Dark mode badge override-ovi
```

## Što ostaje netaknuto

- CSS tokeni (:root i .dark varijable) — linije 1-130
- Tailwind layer base/utilities/components — linije 130-262
- Print stilovi — linije 264-327
- A4 document primitives — linije 329-435
- Sve ostale datoteke bez promjena

