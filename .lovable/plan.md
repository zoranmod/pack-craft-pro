

# Plan: Fiksni "Natrag" header na PDF stranicama

## Problem
U PWA modu, iframe s blob PDF-om koristi Chrome-ov ugrađeni PDF viewer koji preuzima cijeli viewport. Header s gumbom "Natrag" nestaje ili je prekriven.

## Rješenje
Koristiti `fixed` pozicioniranje za header traku s visokim `z-index`-om, i dodati `padding-top` na iframe kontejner da se header ne preklapa s PDF sadržajem.

## Promjene

| Datoteka | Promjena |
|---|---|
| `src/pages/OpenPdf.tsx` | Header `fixed` + `z-50`, iframe s `pt-12` offset |
| `src/pages/apartmani/ApartmentPdfView.tsx` | Ista promjena za apartmanski PDF viewer |

## Detalji
- Header: `fixed top-0 left-0 right-0 z-50 h-12 bg-background border-b` s gumbom "Natrag"
- Sadržaj ispod: `pt-12` da iframe počne ispod headera
- iframe ostaje `flex-1` ali sada ne može prekriti header

