

# Plan: Dodaj polje "Adresa isporuke" na ponude

## Problem
Polje "Adresa isporuke" trenutno se prikazuje samo za otpremnice i naloge (`otpremnica` i `nalog-dostava-montaza`). Korisnik želi isto polje i na ponudama (`ponuda`).

## Promjena

| Datoteka | Promjena |
|---|---|
| `src/components/documents/DocumentForm.tsx` | Proširiti uvjet na liniji 726 da uključi `ponuda` tip |

Konkretno, uvjet:
```
formData.type === 'otpremnica' || formData.type === 'nalog-dostava-montaza'
```
postaje:
```
formData.type === 'otpremnica' || formData.type === 'nalog-dostava-montaza' || formData.type === 'ponuda'
```

PDF generator i baza već podržavaju `deliveryAddress` za sve tipove dokumenata — potrebna je samo ova jedna promjena u formi.

