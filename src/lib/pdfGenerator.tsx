import {
  Document as PDFDocument,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import { Document, documentTypeLabels, DocumentItem } from '@/types/document';
import { formatDateHR, formatCurrency, round2 } from '@/lib/utils';

// Import header image as base64 for PDF embedding
import headerImageSrc from '@/assets/memorandum-header.jpg';

// Register fonts for better Croatian character support
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' },
  ],
});

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    paddingTop: 10,
    paddingBottom: 60,
    paddingHorizontal: 20,
    color: '#000',
  },
  header: {
    marginBottom: 10,
  },
  headerImage: {
    width: '100%',
    height: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftColumn: {
    width: '55%',
  },
  rightColumn: {
    width: '40%',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  table: {
    marginTop: 8,
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
    paddingVertical: 3,
  },
  tableCell: {
    fontSize: 9,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  totalsSection: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 180,
    marginBottom: 2,
  },
  totalsFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 180,
    borderTopWidth: 2,
    borderTopColor: '#000',
    paddingTop: 4,
    marginTop: 2,
  },
  notesSection: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  signatureSection: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  signatureBlock: {
    width: 200,
    alignItems: 'center',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    width: '100%',
    marginTop: 25,
  },
  signatureLabel: {
    fontSize: 8,
    marginTop: 2,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  footerLegal: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 6,
    color: '#666',
  },
  footerContent: {
    fontSize: 7,
    textAlign: 'center',
    color: '#333',
  },
});

// Column widths for table (with prices)
const colWidthsWithPrices = {
  num: '5%',
  code: '10%',
  name: '35%',
  unit: '8%',
  qty: '8%',
  price: '10%',
  discount: '8%',
  pdv: '6%',
  total: '10%',
};

// Column widths for table (without prices)
const colWidthsNoPrices = {
  num: '6%',
  code: '12%',
  name: '54%',
  unit: '14%',
  qty: '14%',
};

interface PDFDocumentComponentProps {
  document: Document;
  template?: any;
  companySettings?: any;
  enrichedItems: (DocumentItem & { code?: string })[];
  hasPrices: boolean;
  mpYMm?: number;
}

// Standard Document PDF Component
const StandardDocumentPDF = ({
  document: doc,
  template,
  companySettings,
  enrichedItems,
  hasPrices,
  mpYMm = 0,
}: PDFDocumentComponentProps) => {
  const isOtpremnica = doc.type === 'otpremnica' || doc.type === 'nalog-dostava-montaza';
  const unitLabel = isOtpremnica ? 'Jedinica' : 'Jed.';
  const qtyLabel = isOtpremnica ? 'Količina' : 'Kol.';
  const showDiscount = template?.show_discount_column !== false;

  // Calculate totals
  const subtotal = doc.items?.reduce((sum, item) => sum + item.subtotal, 0) || 0;
  const totalDiscount = doc.items?.reduce((sum, item) => sum + round2(item.subtotal * item.discount / 100), 0) || 0;
  const totalPdv = doc.items?.reduce((sum, item) => {
    const afterDiscount = round2(item.subtotal - round2(item.subtotal * item.discount / 100));
    return sum + round2(afterDiscount * item.pdv / 100);
  }, 0) || 0;

  return (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        {/* Header Image */}
        <View style={styles.header}>
          <Image src={headerImageSrc} style={styles.headerImage} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{documentTypeLabels[doc.type].toUpperCase()}</Text>

        {/* Two Column Layout */}
        <View style={styles.twoColumnRow}>
          {/* Left: Client Info */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>KUPAC / NARUČITELJ</Text>
            <Text style={styles.textBold}>{doc.clientName}</Text>
            <Text style={styles.text}>{doc.clientAddress}</Text>
            {doc.clientOib && <Text style={styles.text}>OIB: {doc.clientOib}</Text>}
            {doc.clientPhone && <Text style={styles.text}>Tel: {doc.clientPhone}</Text>}
            {doc.clientEmail && <Text style={styles.text}>Email: {doc.clientEmail}</Text>}
            {doc.contactPerson && <Text style={styles.text}>Kontakt: {doc.contactPerson}</Text>}
            {doc.deliveryAddress && (
              <>
                <Text style={[styles.text, { marginTop: 4, fontWeight: 'bold' }]}>Adresa isporuke:</Text>
                <Text style={styles.text}>{doc.deliveryAddress}</Text>
              </>
            )}
          </View>

          {/* Right: Document metadata */}
          <View style={styles.rightColumn}>
            <Text style={styles.textBold}>{doc.number}</Text>
            <Text style={styles.text}>Datum: {formatDateHR(doc.date)}</Text>
            {doc.validityDays && template?.show_validity_days && (
              <Text style={styles.text}>Rok valjanosti: {doc.validityDays} dana</Text>
            )}
            {doc.deliveryDays && template?.show_delivery_days && (
              <Text style={styles.text}>Rok isporuke: {doc.deliveryDays} dana</Text>
            )}
            {doc.paymentMethod && (
              <Text style={styles.text}>Način plaćanja: {doc.paymentMethod}</Text>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { width: hasPrices ? colWidthsWithPrices.num : colWidthsNoPrices.num }]}>R.br.</Text>
            <Text style={[styles.tableCellHeader, { width: hasPrices ? colWidthsWithPrices.code : colWidthsNoPrices.code }]}>Šifra</Text>
            <Text style={[styles.tableCellHeader, { width: hasPrices ? colWidthsWithPrices.name : colWidthsNoPrices.name }]}>Naziv</Text>
            <Text style={[styles.tableCellHeader, { width: hasPrices ? colWidthsWithPrices.unit : colWidthsNoPrices.unit, textAlign: 'center' }]}>{unitLabel}</Text>
            <Text style={[styles.tableCellHeader, { width: hasPrices ? colWidthsWithPrices.qty : colWidthsNoPrices.qty, textAlign: 'center' }]}>{qtyLabel}</Text>
            {hasPrices && (
              <>
                <Text style={[styles.tableCellHeader, { width: colWidthsWithPrices.price, textAlign: 'right' }]}>Cijena</Text>
                {showDiscount && (
                  <Text style={[styles.tableCellHeader, { width: colWidthsWithPrices.discount, textAlign: 'right' }]}>Rabat</Text>
                )}
                <Text style={[styles.tableCellHeader, { width: colWidthsWithPrices.pdv, textAlign: 'right' }]}>PDV</Text>
                <Text style={[styles.tableCellHeader, { width: colWidthsWithPrices.total, textAlign: 'right' }]}>Ukupno</Text>
              </>
            )}
          </View>

          {/* Table Rows */}
          {enrichedItems.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: hasPrices ? colWidthsWithPrices.num : colWidthsNoPrices.num }]}>{index + 1}.</Text>
              <Text style={[styles.tableCell, { width: hasPrices ? colWidthsWithPrices.code : colWidthsNoPrices.code }]}>{item.code || ''}</Text>
              <Text style={[styles.tableCell, { width: hasPrices ? colWidthsWithPrices.name : colWidthsNoPrices.name }]}>{item.name}</Text>
              <Text style={[styles.tableCell, { width: hasPrices ? colWidthsWithPrices.unit : colWidthsNoPrices.unit, textAlign: 'center' }]}>{item.unit}</Text>
              <Text style={[styles.tableCell, { width: hasPrices ? colWidthsWithPrices.qty : colWidthsNoPrices.qty, textAlign: 'center' }]}>{item.quantity}</Text>
              {hasPrices && (
                <>
                  <Text style={[styles.tableCell, { width: colWidthsWithPrices.price, textAlign: 'right' }]}>{formatCurrency(item.price)} €</Text>
                  {showDiscount && (
                    <Text style={[styles.tableCell, { width: colWidthsWithPrices.discount, textAlign: 'right' }]}>
                      {item.discount > 0 ? `${round2(item.discount)}%` : ''}
                    </Text>
                  )}
                  <Text style={[styles.tableCell, { width: colWidthsWithPrices.pdv, textAlign: 'right' }]}>{round2(item.pdv)}%</Text>
                  <Text style={[styles.tableCell, { width: colWidthsWithPrices.total, textAlign: 'right', fontWeight: 'bold' }]}>{formatCurrency(item.total)} €</Text>
                </>
              )}
            </View>
          ))}
        </View>

        {/* Totals */}
        {hasPrices && (
          <View style={styles.totalsSection}>
            <View style={styles.totalsRow}>
              <Text style={styles.text}>Osnovica:</Text>
              <Text style={styles.text}>{formatCurrency(subtotal)} €</Text>
            </View>
            {totalDiscount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.text}>Rabat:</Text>
                <Text style={styles.text}>-{formatCurrency(totalDiscount)} €</Text>
              </View>
            )}
            {template?.show_pdv_breakdown !== false && (
              <View style={styles.totalsRow}>
                <Text style={styles.text}>PDV (25%):</Text>
                <Text style={styles.text}>{formatCurrency(totalPdv)} €</Text>
              </View>
            )}
            <View style={styles.totalsFinal}>
              <Text style={styles.textBold}>UKUPNO:</Text>
              <Text style={styles.textBold}>{formatCurrency(doc.totalAmount)} €</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {doc.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.textBold}>Napomena</Text>
            <Text style={styles.text}>{doc.notes}</Text>
          </View>
        )}

        {/* Signature Section for Ponuda */}
        {doc.type === 'ponuda' && (
          <View style={styles.signatureSection}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', position: 'relative' }}>
              {/* M.P. centered horizontally with configurable vertical offset */}
              <View style={{ 
                position: 'absolute', 
                left: 0, 
                right: 0, 
                bottom: (3 + mpYMm) * 2.83465, // 3mm base + offset (mm -> pt)
                alignItems: 'center' 
              }}>
                <Text style={styles.text}>M.P.</Text>
              </View>
              {/* Signature block */}
              <View style={{ flex: 1 }} />
              <View style={[styles.signatureBlock, { width: 200 }]}>
                <Text style={styles.text}>Ponudu izradio/la:</Text>
                <View style={[styles.signatureLine, { marginTop: 25 }]} />
                <Text style={styles.signatureLabel}>(Potpis)</Text>
                {doc.preparedBy && <Text style={[styles.text, { fontWeight: 600, marginTop: 3 }]}>{doc.preparedBy}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Signature Section for Otpremnica */}
        {doc.type === 'otpremnica' && (
          <View style={styles.signatureSection}>
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Text style={[styles.text, { width: 80 }]}>Robu preuzeo:</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0 }]} />
              <Text style={[styles.text, { width: 40, textAlign: 'center' }]}>MP</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0 }]} />
            </View>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Text style={[styles.text, { width: 80 }]}>Za tvrtku:</Text>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {doc.preparedBy && <Text style={styles.text}>{doc.preparedBy}</Text>}
                <View style={[styles.signatureLine, { width: '100%', marginTop: 0 }]} />
              </View>
              <Text style={[styles.text, { width: 40, textAlign: 'center' }]}>MP</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0 }]} />
            </View>
            <View style={{ marginTop: 15, flexDirection: 'row' }}>
              <Text style={styles.text}>Robu izdao skladištar (puno ime i prezime):</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0, marginLeft: 5 }]} />
            </View>
          </View>
        )}

        {/* Signature Section for Nalog dostava + montaža */}
        {doc.type === 'nalog-dostava-montaza' && (
          <View style={styles.signatureSection}>
            {/* Row 1: Robu preuzeo */}
            <View style={{ flexDirection: 'row', marginTop: 10 }}>
              <Text style={[styles.text, { width: 80 }]}>Robu preuzeo:</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0 }]} />
              <Text style={[styles.text, { width: 40, textAlign: 'center' }]}>MP</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0 }]} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 80 }} />
              <View style={{ flex: 1 }} />
              <View style={{ width: 40 }} />
              <View style={{ flex: 1, alignItems: 'center', marginTop: 2 }}>
                <Text style={[styles.signatureLabel, { fontSize: 7 }] }>(potpis)</Text>
              </View>
            </View>

            {/* Row 2: Za tvrtku */}
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Text style={[styles.text, { width: 80 }]}>Za tvrtku:</Text>
              <View style={{ flex: 1, alignItems: 'center' }}>
                {doc.preparedBy && <Text style={styles.text}>{doc.preparedBy}</Text>}
                <View style={[styles.signatureLine, { width: '100%', marginTop: 0 }]} />
              </View>
              <Text style={[styles.text, { width: 40, textAlign: 'center' }]}>MP</Text>
              <View style={[styles.signatureLine, { flex: 1, marginTop: 0 }]} />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 80 }} />
              <View style={{ flex: 1 }} />
              <View style={{ width: 40 }} />
              <View style={{ flex: 1, alignItems: 'center', marginTop: 2 }}>
                <Text style={[styles.signatureLabel, { fontSize: 7 }] }>(potpis)</Text>
              </View>
            </View>

            {/* Monter 1 - left aligned like preview */}
            <View style={{ marginTop: 20, flexDirection: 'row', paddingLeft: 60 }}>
              <View style={{ width: 200, alignItems: 'center' }}>
                {doc.monter1 && <Text style={styles.text}>{doc.monter1}</Text>}
                <View style={[styles.signatureLine, { width: '100%', marginTop: 0 }]} />
              </View>
            </View>

            {/* Monter 2 - left aligned like preview */}
            <View style={{ marginTop: 12, flexDirection: 'row', paddingLeft: 60 }}>
              <View style={{ width: 200, alignItems: 'center' }}>
                {doc.monter2 && <Text style={styles.text}>{doc.monter2}</Text>}
                <View style={[styles.signatureLine, { width: '100%', marginTop: 0 }]} />
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLegal}>Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.</Text>
          <Text style={styles.footerContent}>
            www.akord-zupanja.hr • info@akord-zupanja.hr • Besplatan info tel: 0800 9455
          </Text>
          <Text style={styles.footerContent}>
            Maloprodaja +385 32 830 345 • Veleprodaja +385 32 830 346 • Projektiranje namještaja +385 32 638 776 • Računovodstvo +385 32 638 900
          </Text>
        </View>
      </Page>
    </PDFDocument>
  );
};

// Contract Document PDF Component
const ContractDocumentPDF = ({
  document: doc,
  companySettings,
}: {
  document: Document;
  companySettings?: any;
}) => {
  const sortedArticles = [...(doc.contractArticles || [])].sort((a, b) => a.sortOrder - b.sortOrder);
  
  // Replace placeholders in content
  const replacePlaceholders = (content: string): string => {
    const predujam = doc.totalAmount * 0.3;
    const ostatak = doc.totalAmount - predujam;
    const replacements: Record<string, string> = {
      '{ukupna_cijena}': `${doc.totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
      '{predujam}': `${predujam.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
      '{ostatak}': `${ostatak.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
      '{adresa_kupca}': doc.clientAddress || '',
      '{ime_kupca}': doc.clientName || '',
      '{oib_kupca}': doc.clientOib || '',
      '{jamstveni_rok}': '24 mjeseca',
      '{naziv_prodavatelja}': companySettings?.company_name || 'Akord d.o.o.',
      '{adresa_prodavatelja}': companySettings?.address || '',
      '{oib_prodavatelja}': companySettings?.oib || '',
    };
    let result = content;
    Object.entries(replacements).forEach(([placeholder, value]) => {
      result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    return result;
  };

  return (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        {/* Header Image */}
        <View style={styles.header}>
          <Image src={headerImageSrc} style={styles.headerImage} />
        </View>

        {/* Title */}
        <Text style={styles.title}>UGOVOR O IZRADI NAMJEŠTAJA PO MJERI</Text>

        {/* Document Number */}
        <View style={{ alignItems: 'flex-end', marginBottom: 8 }}>
          <Text style={styles.textBold}>{doc.number}</Text>
          <Text style={styles.text}>Datum: {formatDateHR(doc.date)}</Text>
        </View>

        {/* Intro */}
        <Text style={[styles.text, { marginBottom: 10 }]}>
          U Zagrebu, dana {formatDateHR(doc.date)} godine, sklapaju:
        </Text>

        {/* Seller */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.textBold}>1. PRODAVATELJ:</Text>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.textBold}>{companySettings?.company_name || 'Akord d.o.o.'}</Text>
            {companySettings?.address && <Text style={styles.text}>{companySettings.address}</Text>}
            {companySettings?.oib && <Text style={styles.text}>OIB: {companySettings.oib}</Text>}
            {companySettings?.iban && <Text style={styles.text}>IBAN: {companySettings.iban}</Text>}
          </View>
        </View>

        {/* Buyer */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.textBold}>2. KUPAC:</Text>
          <View style={{ marginLeft: 15 }}>
            <Text style={styles.textBold}>{doc.clientName}</Text>
            {doc.clientAddress && <Text style={styles.text}>{doc.clientAddress}</Text>}
            {doc.clientOib && <Text style={styles.text}>OIB: {doc.clientOib}</Text>}
            {doc.clientPhone && <Text style={styles.text}>Tel: {doc.clientPhone}</Text>}
            {doc.clientEmail && <Text style={styles.text}>Email: {doc.clientEmail}</Text>}
          </View>
        </View>

        {/* Separator */}
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#ccc', marginVertical: 10 }} />

        {/* Contract Articles */}
        {sortedArticles.map((article) => (
          <View key={article.id} style={{ marginBottom: 10 }}>
            <Text style={styles.textBold}>Članak {article.articleNumber}.</Text>
            {article.title && (
              <Text style={[styles.textBold, { textAlign: 'center', textTransform: 'uppercase', marginBottom: 4 }]}>
                {article.title}
              </Text>
            )}
            <Text style={[styles.text, { lineHeight: 1.4 }]}>
              {replacePlaceholders(article.content)}
            </Text>
          </View>
        ))}

        {/* Items Table (if any) */}
        {doc.items && doc.items.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={[styles.textBold, { marginBottom: 8 }]}>Popis stavki:</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCellHeader, { width: '8%' }]}>R.br.</Text>
              <Text style={[styles.tableCellHeader, { width: '40%' }]}>Naziv</Text>
              <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'center' }]}>Kol.</Text>
              <Text style={[styles.tableCellHeader, { width: '12%', textAlign: 'center' }]}>Jed.</Text>
              <Text style={[styles.tableCellHeader, { width: '14%', textAlign: 'right' }]}>Cijena</Text>
              <Text style={[styles.tableCellHeader, { width: '14%', textAlign: 'right' }]}>Ukupno</Text>
            </View>
            {doc.items.map((item, index) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '8%' }]}>{index + 1}.</Text>
                <Text style={[styles.tableCell, { width: '40%' }]}>{item.name}</Text>
                <Text style={[styles.tableCell, { width: '12%', textAlign: 'center' }]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, { width: '12%', textAlign: 'center' }]}>{item.unit}</Text>
                <Text style={[styles.tableCell, { width: '14%', textAlign: 'right' }]}>{formatCurrency(item.price)} €</Text>
                <Text style={[styles.tableCell, { width: '14%', textAlign: 'right' }]}>{formatCurrency(item.total)} €</Text>
              </View>
            ))}
            <View style={[styles.tableRow, { borderTopWidth: 2, borderTopColor: '#000' }]}>
              <Text style={[styles.tableCellHeader, { width: '86%', textAlign: 'right' }]}>UKUPNO:</Text>
              <Text style={[styles.tableCellHeader, { width: '14%', textAlign: 'right' }]}>{formatCurrency(doc.totalAmount)} €</Text>
            </View>
          </View>
        )}

        {/* Signatures */}
        <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '40%', alignItems: 'center' }}>
            <Text style={styles.text}>ZA PRODAVATELJA:</Text>
            <View style={[styles.signatureLine, { marginTop: 40 }]} />
            <Text style={[styles.text, { marginTop: 4 }]}>{companySettings?.company_name || 'Akord d.o.o.'}</Text>
          </View>
          <View style={{ width: '40%', alignItems: 'center' }}>
            <Text style={styles.text}>ZA KUPCA:</Text>
            <View style={[styles.signatureLine, { marginTop: 40 }]} />
            <Text style={[styles.text, { marginTop: 4 }]}>{doc.clientName}</Text>
          </View>
        </View>

        {/* Notes */}
        {doc.notes && (
          <View style={[styles.notesSection, { marginTop: 15 }]}>
            <Text style={styles.textBold}>Napomene:</Text>
            <Text style={styles.text}>{doc.notes}</Text>
          </View>
        )}

        {/* Footer (only on last page) */}
        <View style={styles.footer} fixed>
          <Text
            style={styles.footerLegal}
            render={({ pageNumber, totalPages }) =>
              pageNumber === totalPages
                ? 'Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.'
                : ''
            }
          />
          <Text
            style={styles.footerContent}
            render={({ pageNumber, totalPages }) =>
              pageNumber === totalPages
                ? 'www.akord-zupanja.hr • info@akord-zupanja.hr • Besplatan info tel: 0800 9455'
                : ''
            }
          />
          <Text
            style={styles.footerContent}
            render={({ pageNumber, totalPages }) =>
              pageNumber === totalPages
                ? 'Maloprodaja +385 32 830 345 • Veleprodaja +385 32 830 346 • Projektiranje namještaja +385 32 638 776 • Računovodstvo +385 32 638 900'
                : ''
            }
          />
        </View>
      </Page>
    </PDFDocument>
  );
};

// Generate PDF filename
export const getPdfFilename = (doc: Document): string => {
  const typePrefix: Record<string, string> = {
    ponuda: 'PON',
    ugovor: 'UGO',
    otpremnica: 'OTP',
    'nalog-dostava-montaza': 'NAL',
    racun: 'RAC',
  };
  const prefix = typePrefix[doc.type] || 'DOC';
  const numberPart = doc.number.replace(/^[A-Z]+-/, '');
  return `${prefix}-${numberPart}.pdf`;
};

// Main function to generate and download PDF
export const generateAndDownloadPdf = async (
  document: Document,
  template?: any,
  companySettings?: any,
  enrichedItems?: (DocumentItem & { code?: string })[],
  mpYMm?: number
): Promise<void> => {
  const isContract = document.type === 'ugovor';
  const hasPrices = ['ponuda', 'racun', 'ugovor'].includes(document.type);
  const items = enrichedItems || document.items?.map((item) => ({ ...item, code: '' })) || [];

  let pdfBlob: Blob;

  if (isContract) {
    pdfBlob = await pdf(
      <ContractDocumentPDF document={document} companySettings={companySettings} />
    ).toBlob();
  } else {
    pdfBlob = await pdf(
      <StandardDocumentPDF
        document={document}
        template={template}
        companySettings={companySettings}
        enrichedItems={items}
        hasPrices={hasPrices}
        mpYMm={mpYMm}
      />
    ).toBlob();
  }

  // Create download link and trigger download
  const url = URL.createObjectURL(pdfBlob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = getPdfFilename(document);
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
