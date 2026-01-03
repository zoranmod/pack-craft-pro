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
import { format, addDays, isWeekend, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';

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
    paddingBottom: 65,
    paddingHorizontal: 40,
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
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
    letterSpacing: 1,
  },
  documentNumber: {
    fontSize: 9,
    textAlign: 'right',
    marginBottom: 10,
    color: '#666',
  },
  dateLocation: {
    fontSize: 9,
    textAlign: 'right',
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'center',
  },
  formLabel: {
    width: 180,
    fontSize: 10,
  },
  formValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 2,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formValueEmpty: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 12,
  },
  noteSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  noteText: {
    fontSize: 8,
    color: '#333',
    lineHeight: 1.4,
  },
  signatureSection: {
    marginTop: 30,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    width: 150,
    fontSize: 10,
  },
  signatureLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 16,
  },
  signatureHintContainer: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  signatureHintSpacer: {
    width: 150,
  },
  signatureHint: {
    flex: 1,
    fontSize: 7,
    textAlign: 'center',
    color: '#666',
    marginTop: 2,
  },
  approvalSection: {
    marginTop: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  approvalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  approvalOptions: {
    flexDirection: 'row',
    gap: 25,
  },
  approvalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#333',
  },
  optionText: {
    fontSize: 10,
  },
  directorSection: {
    marginTop: 25,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
  },
  footerLegal: {
    fontSize: 7,
    textAlign: 'center',
    marginBottom: 4,
    color: '#666',
  },
  footerContent: {
    fontSize: 7,
    textAlign: 'center',
    color: '#333',
  },
});

export interface ExcludedDateInfo {
  date: string;
  reason: string;
}

interface LeaveRequestData {
  id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: string;
  reason?: string | null;
  status: string;
  created_at: string;
  excluded_dates?: ExcludedDateInfo[];
}

interface EmployeeData {
  id: string;
  first_name: string;
  last_name: string;
  department?: string | null;
}

// Calculate return to work date (first working day after end_date)
const getReturnDate = (endDate: string): string => {
  let returnDate = addDays(new Date(endDate), 1);
  // Skip weekends
  while (isWeekend(returnDate)) {
    returnDate = addDays(returnDate, 1);
  }
  return format(returnDate, 'dd.MM.yyyy', { locale: hr });
};

// Generate document number based on year and request id
const generateDocNumber = (requestId: string, createdAt: string): string => {
  const year = new Date(createdAt).getFullYear().toString().slice(-2);
  const shortId = requestId.slice(-4).toUpperCase();
  return `ZG${year}${shortId}`;
};

// Generate automatic note from excluded dates
const generateAutomaticNote = (
  excludedDates: ExcludedDateInfo[],
  existingReason?: string | null
): string => {
  const parts: string[] = [];

  // Radne subote (working Saturdays - not excluded from count)
  const radneSubote = excludedDates
    .filter(d => d.reason === 'radna_subota')
    .map(d => format(parseISO(d.date), 'dd.MM.', { locale: hr }));
  if (radneSubote.length > 0) {
    parts.push(`Radne subote: ${radneSubote.join(', ')}`);
  }

  // Neradne subote (non-working Saturdays)
  const neradneSubote = excludedDates
    .filter(d => d.reason === 'neradna_subota')
    .map(d => format(parseISO(d.date), 'dd.MM.', { locale: hr }));
  if (neradneSubote.length > 0) {
    parts.push(`Neradne subote: ${neradneSubote.join(', ')}`);
  }

  // Neradni dani (holidays)
  const neradniDani = excludedDates
    .filter(d => ['neradni_dan', 'blagdan', 'praznik'].includes(d.reason))
    .map(d => format(parseISO(d.date), 'dd.MM.', { locale: hr }));
  if (neradniDani.length > 0) {
    parts.push(`Neradni dani: ${neradniDani.join(', ')}`);
  }

  // Add user's note if present
  if (existingReason && existingReason.trim()) {
    parts.push(existingReason.trim());
  }

  return parts.join(' | ');
};

// Leave Request PDF Component
const LeaveRequestPDF = ({
  leaveRequest,
  employee,
}: {
  leaveRequest: LeaveRequestData;
  employee: EmployeeData;
}) => {
  const fullName = `${employee.first_name} ${employee.last_name}`;
  const startDate = format(new Date(leaveRequest.start_date), 'dd.MM.yyyy', { locale: hr });
  const endDate = format(new Date(leaveRequest.end_date), 'dd.MM.yyyy', { locale: hr });
  const returnDate = getReturnDate(leaveRequest.end_date);
  const docNumber = generateDocNumber(leaveRequest.id, leaveRequest.created_at);
  const now = new Date();
  const dateTimeStr = format(now, "dd.MM.yyyy 'u' HH:mm", { locale: hr });
  const isApproved = leaveRequest.status === 'approved';
  const isRejected = leaveRequest.status === 'rejected';

  // Generate combined note
  const combinedNote = generateAutomaticNote(
    leaveRequest.excluded_dates || [],
    leaveRequest.reason
  );

  return (
    <PDFDocument>
      <Page size="A4" style={styles.page}>
        {/* Header Image */}
        <View style={styles.header}>
          <Image src={headerImageSrc} style={styles.headerImage} />
        </View>

        {/* Document Number */}
        <Text style={styles.documentNumber}>Dokument broj: {docNumber}</Text>

        {/* Title */}
        <Text style={styles.title}>ZAHTJEV ZA GODIŠNJI ODMOR</Text>

        {/* Date and Location */}
        <Text style={styles.dateLocation}>U Županji, {dateTimeStr}</Text>

        {/* Form Fields */}
        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Ime i prezime:</Text>
          <Text style={styles.formValue}>{fullName}</Text>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Trajanje godišnjeg odmora:</Text>
          <Text style={styles.formValue}>{leaveRequest.days_requested} radnih dana</Text>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Godišnji odmor počinje:</Text>
          <Text style={styles.formValue}>{startDate}</Text>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Godišnji odmor završava:</Text>
          <Text style={styles.formValue}>{endDate}</Text>
        </View>

        <View style={styles.formRow}>
          <Text style={styles.formLabel}>Na posao se vraćam:</Text>
          <Text style={styles.formValue}>{returnDate}</Text>
        </View>

        {/* Note section - always shown if there's content */}
        {combinedNote && (
          <View style={styles.noteSection}>
            <Text style={styles.noteLabel}>Napomena:</Text>
            <Text style={styles.noteText}>{combinedNote}</Text>
          </View>
        )}

        {/* Signature - Employee */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Podnositelj zahtjeva:</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureHintContainer}>
            <View style={styles.signatureHintSpacer} />
            <Text style={styles.signatureHint}>(potpis)</Text>
          </View>
        </View>

        {/* Approval Section */}
        <View style={styles.approvalSection}>
          <Text style={styles.approvalLabel}>Odobreno:</Text>
          <View style={styles.approvalOptions}>
            <View style={styles.approvalOption}>
              <View style={isApproved ? styles.checkboxChecked : styles.checkbox} />
              <Text style={styles.optionText}>DA</Text>
            </View>
            <View style={styles.approvalOption}>
              <View style={isRejected ? styles.checkboxChecked : styles.checkbox} />
              <Text style={styles.optionText}>NE</Text>
            </View>
          </View>
        </View>

        {/* Signature - Department Head */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Voditelj odjela:</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureHintContainer}>
            <View style={styles.signatureHintSpacer} />
            <Text style={styles.signatureHint}>(potpis)</Text>
          </View>
        </View>

        {/* Signature - Director */}
        <View style={styles.directorSection}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Direktor:</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureHintContainer}>
            <View style={styles.signatureHintSpacer} />
            <Text style={styles.signatureHint}>(potpis)</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLegal}>Dokument je pisan na računalu i pravovaljan je s potpisima.</Text>
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

// Generate filename
export const getLeaveRequestPdfFilename = (
  employee: EmployeeData,
  leaveRequest: LeaveRequestData
): string => {
  const startDate = format(new Date(leaveRequest.start_date), 'yyyy-MM-dd');
  const name = `${employee.first_name}_${employee.last_name}`.replace(/\s+/g, '_');
  return `Zahtjev_GO_${name}_${startDate}.pdf`;
};

// Main function to generate and download PDF
export const generateAndDownloadLeaveRequestPdf = async (
  leaveRequest: LeaveRequestData,
  employee: EmployeeData
): Promise<void> => {
  const blob = await pdf(
    <LeaveRequestPDF leaveRequest={leaveRequest} employee={employee} />
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getLeaveRequestPdfFilename(employee, leaveRequest);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
