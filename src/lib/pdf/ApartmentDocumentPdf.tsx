import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import { APARTMENT_COMPANY_INFO } from '@/types/apartment';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { fontFamily: 'Roboto', fontSize: 10, padding: 40, color: '#1a1a1a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  headerLeft: { flex: 1 },
  headerRight: { flex: 1, alignItems: 'flex-end' },
  companyName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  companyDetail: { fontSize: 8, color: '#555', marginBottom: 1 },
  title: { fontSize: 14, fontWeight: 700, textAlign: 'center', marginVertical: 16 },
  section: { marginBottom: 10 },
  label: { fontSize: 8, color: '#777', marginBottom: 2 },
  value: { fontSize: 10, marginBottom: 4 },
  table: { marginTop: 10, borderWidth: 1, borderColor: '#ccc' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderColor: '#ccc', padding: 6 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee', padding: 6 },
  cellDesc: { flex: 3, fontSize: 9 },
  cellNum: { flex: 1, fontSize: 9, textAlign: 'right' },
  totalRow: { flexDirection: 'row', padding: 6, backgroundColor: '#f7f7f7' },
  totalLabel: { flex: 3, fontSize: 10, fontWeight: 700 },
  totalValue: { flex: 1, fontSize: 10, fontWeight: 700, textAlign: 'right' },
  notes: { marginTop: 16, fontSize: 8, color: '#555', lineHeight: 1.5 },
  signatureBlock: { marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' },
  signatureLine: { width: 180, borderTopWidth: 1, borderColor: '#999', paddingTop: 4, fontSize: 8, textAlign: 'center' },
  logoImage: { width: 120, height: 'auto', marginBottom: 8 },
});

export interface ApartmentPdfData {
  documentType: string;
  number: string;
  date: string;
  guestName: string;
  unitName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  breakfastIncluded: boolean;
  pricePerNight: number;
  totalAmount: number;
  paymentMethod: string;
  depositAmount?: number;
  validityDays?: number;
  notes?: string;
  logoBase64?: string | null;
}

const DOCUMENT_TITLES: Record<string, string> = {
  ponuda: 'PONUDA',
  racun: 'RAČUN',
  potvrda_rezervacije: 'POTVRDA REZERVACIJE',
  potvrda_uplate: 'POTVRDA UPLATE',
};

export function ApartmentDocumentPdf({ data }: { data: ApartmentPdfData }) {
  const info = APARTMENT_COMPANY_INFO;
  const title = `${DOCUMENT_TITLES[data.documentType] || data.documentType.toUpperCase()} br. ${data.number}`;
  const totalPersons = data.adults + data.children;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.logoBase64 && <Image src={data.logoBase64} style={styles.logoImage} />}
            <Text style={styles.companyName}>{info.name}</Text>
            <Text style={styles.companyDetail}>{info.fullName}</Text>
            <Text style={styles.companyDetail}>{info.owner}</Text>
            <Text style={styles.companyDetail}>{info.address}</Text>
            <Text style={styles.companyDetail}>OIB: {info.oib}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyDetail}>IBAN: {info.iban}</Text>
            <Text style={styles.companyDetail}>Žiro račun: {info.ziroRacun}</Text>
            <Text style={styles.companyDetail}>SWIFT: {info.swift}</Text>
            <Text style={styles.companyDetail}>Banka: {info.bankName}</Text>
            <Text style={styles.companyDetail}>Tel: {info.phone}</Text>
            <Text style={styles.companyDetail}>Email: {info.email}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>
        <Text style={{ fontSize: 9, textAlign: 'center', marginBottom: 16 }}>Datum: {data.date}</Text>

        {/* Guest info */}
        {data.guestName && (
          <View style={styles.section}>
            <Text style={styles.label}>Gost / Kupac:</Text>
            <Text style={styles.value}>{data.guestName}</Text>
          </View>
        )}

        {/* Items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.cellDesc}>Opis</Text>
            <Text style={styles.cellNum}>Količina</Text>
            <Text style={styles.cellNum}>Cijena (€)</Text>
            <Text style={styles.cellNum}>Ukupno (€)</Text>
          </View>

          {/* Accommodation row */}
          <View style={styles.tableRow}>
            <Text style={styles.cellDesc}>
              Smještaj: {data.unitName}{'\n'}
              Dolazak: {data.checkIn} — Odlazak: {data.checkOut}{'\n'}
              Osobe: {totalPersons} ({data.adults} odr.{data.children > 0 ? ` + ${data.children} dj.` : ''})
              {data.breakfastIncluded ? ' | Doručak uključen' : ''}
            </Text>
            <Text style={styles.cellNum}>{data.nights} noći</Text>
            <Text style={styles.cellNum}>{data.pricePerNight.toFixed(2)}</Text>
            <Text style={styles.cellNum}>{data.totalAmount.toFixed(2)}</Text>
          </View>

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>UKUPNO</Text>
            <Text style={styles.totalValue}>{data.totalAmount.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Deposit for ponuda */}
        {data.documentType === 'ponuda' && data.depositAmount != null && data.depositAmount > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 9 }}>Predujam: {data.depositAmount.toFixed(2)} €</Text>
            {data.validityDays && <Text style={{ fontSize: 9 }}>Rok važenja ponude: {data.validityDays} dana</Text>}
          </View>
        )}

        {/* Notes */}
        <View style={styles.notes}>
          <Text>{info.pdvNote}</Text>
          <Text>{info.taxNote}</Text>
          {data.notes && <Text style={{ marginTop: 4 }}>{data.notes}</Text>}
        </View>

        {/* Signature */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLine}>
            <Text>Gost / Kupac</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text>{info.owner}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
