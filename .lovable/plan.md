
# Plan: Popravak zaglavlja u PDF ponudama

## Utvrđeni problem

Slika zaglavlja (`memorandum-header.jpg`) se prikazuje ispravno u HTML pregledu dokumenta, ali ne u generiranom PDF-u.

### Tehnička analiza
- **Slika postoji**: 63KB, ispravan sadržaj (Akord logo + podaci tvrtke)
- **HTML radi**: `MemorandumHeader` komponenta prikazuje sliku ispravno
- **PDF generator koristi istu sliku**: `import headerImageSrc from '@/assets/memorandum-header.jpg'`
- **Nema JavaScript grešaka** pri generiranju PDF-a

### Uzrok problema
Kada Vite importira sliku, vraća **URL path** (npr. `/src/assets/memorandum-header.jpg`). @react-pdf/renderer ponekad ima problema s učitavanjem slika putem URL-a, posebno:
- CORS restrikcije tijekom renderiranja
- Async učitavanje koje se ne dovrši na vrijeme

---

## Rješenje

### Opcija A: Pretvorba slike u base64 (preporučeno)

Umjesto korištenja URL-a, slika će se učitati kao base64 data URL što garantira da je slika ugrađena u PDF bez potrebe za mrežnim zahtjevom.

**Promjena u `src/lib/pdfGenerator.tsx`:**

```typescript
// Umjesto:
import headerImageSrc from '@/assets/memorandum-header.jpg';

// Koristiti base64 pristup:
import headerImageSrc from '@/assets/memorandum-header.jpg?url';

// Ili konvertirati u base64 funkcijom:
const headerImageBase64 = await imageToBase64(headerImageSrc);
```

**Konkretna implementacija:**
1. Dodati helper funkciju za konverziju URL-a u base64
2. Promijeniti PDF komponente da koriste base64 verziju slike
3. Osigurati da se slika učita prije renderiranja PDF-a

### Opcija B: Koristiti sliku iz public foldera

Premjestiti sliku u `/public/` folder i koristiti apsolutni URL.

### Opcija C: Inline base64 slika

Konvertirati sliku u base64 string i direktno ga uključiti u kod.

---

## Preporučena implementacija (Opcija A)

### Korak 1: Dodati helper funkciju za konverziju slike

```typescript
// src/lib/imageUtils.ts
export async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

### Korak 2: Modificirati PDF generator

Promijeniti `generatePdfBlob` i `StandardDocumentPDF` da prvo učitaju sliku kao base64 prije renderiranja.

```typescript
// Učitaj sliku kao base64 prije generiranja PDF-a
const headerImageBase64 = await imageUrlToBase64(headerImageSrc);

// Proslijedi base64 verziju komponenti
<StandardDocumentPDF
  headerImage={headerImageBase64}
  ...
/>
```

### Korak 3: Ažurirati PDF komponente

```typescript
interface PDFDocumentComponentProps {
  headerImage: string; // base64 data URL
  // ... ostali propovi
}

const StandardDocumentPDF = ({ headerImage, ... }) => (
  <PDFDocument>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Image src={headerImage} style={styles.headerImage} />
      </View>
      ...
    </Page>
  </PDFDocument>
);
```

---

## Datoteke za izmjenu

| Datoteka | Promjena |
|----------|----------|
| `src/lib/imageUtils.ts` | Nova datoteka - helper za base64 konverziju |
| `src/lib/pdfGenerator.tsx` | Dodati učitavanje slike kao base64 prije generiranja PDF-a |
| `src/lib/leaveRequestPdfGenerator.tsx` | Ista promjena za dosljednost |

---

## Alternativno jednostavnije rješenje

Ako se pokaže da je problem samo u timing-u učitavanja, možemo pokušati:

1. **Preload slike** - osigurati da je slika učitana u cache prije generiranja PDF-a
2. **Koristiti `Image.prefetch`** - @react-pdf/renderer ima opciju za prefetch

---

## Očekivani rezultat

Nakon implementacije:
- Zaglavlje memoranduma (Akord logo + podaci) prikazuje se ispravno u PDF-u
- Konzistentnost između HTML pregleda i PDF ispisa
- Radi na svim tipovima dokumenata (ponuda, otpremnica, ugovor, nalog)

---

## Napomena

Ista promjena treba se primijeniti na sve PDF generatore u projektu koji koriste `memorandum-header.jpg`:
- `pdfGenerator.tsx` (standardni dokumenti + ugovori)
- `leaveRequestPdfGenerator.tsx` (zahtjevi za godišnji)
