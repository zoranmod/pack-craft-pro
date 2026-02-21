
# Sortiranje dokumenata u tablici

## Sto se radi
Dodavanje mogucnosti sortiranja dokumenata klikom na zaglavlja stupaca tablice. Korisnik moze sortirati po: klijentu, datumu, statusu, iznosu i datumu izmjene.

## Kako funkcionira
- Klik na zaglavlje stupca sortira po tom stupcu uzlazno (A-Z, najstariji prvo, najmanji iznos)
- Drugi klik na isto zaglavlje sortira silazno (Z-A, najnoviji prvo, najveci iznos)
- Treci klik vraca na defaultno (bez sortiranja)
- Aktivni stupac prikazuje strelicu gore/dolje

## Tehnicke promjene

### 1. Datoteka: `src/components/documents/DocumentList.tsx`

Dodati state za sortiranje i logiku:

```text
- Novi state: sortField (null | 'clientName' | 'date' | 'status' | 'totalAmount' | 'updatedAt')
- Novi state: sortDirection ('asc' | 'desc')
- Funkcija handleSort(field) koja togglea smjer ili resetira
- sortedDocs = useMemo koji sortira filteredDocs prema aktivnom polju
```

Zamijeniti staticke `<th>` elemente s klikabilnim zaglavljima koja prikazuju strelicu sortiranja (koristeci `ArrowUpDown`, `ArrowUp`, `ArrowDown` ikone iz lucide-react).

Dodati novi stupac "Izmijenjeno" (`updatedAt`) u tablicu -- izmedu "Datum" i "Status", ili na kraj prije "Akcije".

### 2. Datoteke koje se mijenjaju

| Datoteka | Akcija |
|---|---|
| `src/components/documents/DocumentList.tsx` | Izmjena -- dodavanje sortiranja i stupca "Izmijenjeno" |

Nema promjena u bazi podataka niti novih datoteka. Sortiranje se radi iskljucivo na frontend strani nad vec dohvacenim podacima.
