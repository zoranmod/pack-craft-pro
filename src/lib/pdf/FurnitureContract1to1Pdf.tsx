import { Document as PDFDocument, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Document } from '@/types/document';

export type FurnitureContractBgSlot = 'p1' | 'p2' | 'p3';

export interface FurnitureContract1to1PdfProps {
  document: Document;
  values: Record<string, string>;
  bgUrls: Record<FurnitureContractBgSlot, string>;
}

const mmToPt = (mm: number) => mm * 2.83465;

const styles = StyleSheet.create({
  page: {
    position: 'relative',
    fontSize: 10,
  },
  bg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});

function Field({
  xMm,
  yMm,
  text,
  fontSize = 10,
  widthMm,
}: {
  xMm: number;
  yMm: number;
  text: string | null;
  fontSize?: number;
  widthMm?: number;
}) {
  if (!text) return null;
  return (
    <Text
      style={{
        position: 'absolute',
        left: mmToPt(xMm),
        top: mmToPt(yMm),
        fontSize,
        ...(widthMm ? { width: mmToPt(widthMm) } : null),
      }}
    >
      {text}
    </Text>
  );
}

/**
 * 1:1 PDF ugovor (namještaj) s pozadinom (3 stranice).
 * Koordinate su inicijalne i namijenjene za iterativno fino podešavanje.
 */
export function FurnitureContract1to1Pdf({ document, values, bgUrls }: FurnitureContract1to1PdfProps) {
  const broj = values.broj_dokumenta || document.number;
  const datum = values.datum_sklapanja || document.date;

  const kupacNaziv = values.kupac_naziv || document.clientName;
  const kupacAdresa = values.kupac_adresa || document.clientAddress;
  const kupacOib = values.kupac_oib || document.clientOib || '';
  const kupacKontakt = values.kupac_kontakt || document.clientPhone || '';

  const cijena = values.cijena || '';
  const predujam = values.predujam || '';
  const rokIsporuke = values.rok_isporuke || '';
  const specifikacija = values.specifikacija || '';

  return (
    <PDFDocument>
      {/* Page 1 */}
      <Page size="A4" style={styles.page}>
        <Image src={bgUrls.p1} style={styles.bg} />

        {/* Zaglavlje / osnovno */}
        <Field xMm={145} yMm={25} text={broj || null} fontSize={10} widthMm={55} />
        <Field xMm={145} yMm={31} text={datum || null} fontSize={10} widthMm={55} />

        {/* Kupac */}
        <Field xMm={20} yMm={55} text={kupacNaziv || null} fontSize={10} widthMm={120} />
        <Field xMm={20} yMm={61} text={kupacAdresa || null} fontSize={10} widthMm={120} />
        <Field xMm={20} yMm={67} text={kupacOib ? `OIB: ${kupacOib}` : null} fontSize={10} widthMm={120} />
        <Field xMm={20} yMm={73} text={kupacKontakt ? `Kontakt: ${kupacKontakt}` : null} fontSize={10} widthMm={120} />

        {/* Financije */}
        <Field xMm={20} yMm={120} text={cijena ? `Cijena: ${cijena}` : null} fontSize={10} widthMm={170} />
        <Field xMm={20} yMm={126} text={predujam ? `Predujam: ${predujam}` : null} fontSize={10} widthMm={170} />
        <Field xMm={20} yMm={132} text={rokIsporuke ? `Rok isporuke: ${rokIsporuke}` : null} fontSize={10} widthMm={170} />

        {/* Specifikacija */}
        <View style={{ position: 'absolute', left: mmToPt(20), top: mmToPt(150), width: mmToPt(170) }}>
          <Text style={{ fontSize: 10 }}>{specifikacija || ''}</Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={styles.page}>
        <Image src={bgUrls.p2} style={styles.bg} />
        {/* (polja za stranicu 2 – dodajemo nakon prvog testa koordinata) */}
      </Page>

      {/* Page 3 */}
      <Page size="A4" style={styles.page}>
        <Image src={bgUrls.p3} style={styles.bg} />
        {/* (polja za stranicu 3 – dodajemo nakon prvog testa koordinata) */}
      </Page>
    </PDFDocument>
  );
}
