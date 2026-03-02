

## Plan: Pamćenje sortiranja u DocumentList

**Problem:** Sortiranje se resetira na default svaki put kad se promijeni stranica ili osvježi pregled.

**Rješenje:** Koristiti `localStorage` za čuvanje `sortField` i `sortDirection` po korisniku.

### Promjene

**`src/components/documents/DocumentList.tsx`**
- Inicijalizirati `sortField` i `sortDirection` iz `localStorage` umjesto hardkodiranih defaultova (`null` / `'asc'`)
- U `handleSort` funkciji, nakon svake promjene sortiranja, spremiti novo stanje u `localStorage`
- Ključ u localStorage: `doc_list_sort` (sadrži JSON objekt `{ field, direction }`)

Jedna datoteka, minimalna promjena (~10 linija).

