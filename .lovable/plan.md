
# Dodavanje jedinice mjere "kpl" (komplet)

## Problem
U aplikaciji nedostaje opcija "kpl" (komplet) kao jedinica mjere za stavke dokumenata i artikle.

## Promjene

Dodati `kpl` opciju u sve Select padajuce izbornike za jedinicu mjere, na ukupno 4 mjesta:

### 1. DocumentForm (ponude, otpremnice, nalozi, racuni)
**Datoteka:** `src/components/documents/DocumentForm.tsx` (linija 846-851)
- Dodati: `<SelectItem value="kpl">kpl</SelectItem>`

### 2. Articles (sifrarnik artikala)
**Datoteka:** `src/pages/Articles.tsx` (linija 364-372)
- Dodati: `<SelectItem value="kpl">kpl</SelectItem>`

### 3. ReklamacijaForm (reklamacijski zapisnik)
**Datoteka:** `src/components/documents/ReklamacijaForm.tsx` (linija 386-391)
- Dodati: `<SelectItem value="kpl">kpl</SelectItem>`

### 4. ContractEditor i ContractEditorEdit (ugovori)
**Datoteke:** `src/pages/ContractEditor.tsx` i `src/pages/ContractEditorEdit.tsx`
- Ove forme koriste obican Input za jedinicu (slobodan unos teksta), pa vec podrzavaju "kpl" rucnim unosom -- nema promjene potrebne.

## Rezultat
- "kpl" ce biti dostupna kao opcija u svim padajucim izbornicima za jedinicu mjere
- Postojece stavke s drugim jedinicama ostaju nepromijenjene
- Nema promjena u bazi podataka (polje `unit` je tekstualno)
