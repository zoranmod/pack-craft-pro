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
import { format, addDays, isWeekend, isSaturday } from 'date-fns';
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
    fontSize: 11,
    paddingTop: 10,
    paddingBottom: 80,
    paddingHorizontal: 40,
    color: '#000',
  },
  header: {
    marginBottom: 15,
  },
  headerImage: {
    width: '100%',
    height: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    letterSpacing: 1,
  },
  documentNumber: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 15,
    color: '#666',
  },
  dateLocation: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 30,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'center',
  },
  formLabel: {
    width: 200,
    fontSize: 11,
  },
  formValue: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 2,
    fontSize: 11,
    fontWeight: 'bold',
  },
  formValueEmpty: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 14,
  },
  signatureSection: {
    marginTop: 50,
  },
  signatureRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  signatureLabel: {
    width: 180,
    fontSize: 11,
  },
  signatureLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    minHeight: 20,
  },
  signatureHint: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
    marginTop: 2,
  },
  approvalSection: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 40,
  },
  approvalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  approvalOptions: {
    flexDirection: 'row',
    gap: 30,
  },
  approvalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#333',
  },
  optionText: {
    fontSize: 11,
  },
  directorSection: {
    marginTop: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
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

interface LeaveRequestData {
  id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: string;
  reason?: string | null;
  status: string;
  created_at: string;
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

        {/* Reason if present */}
        {leaveRequest.reason && (
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Napomena:</Text>
            <Text style={styles.formValue}>{leaveRequest.reason}</Text>
          </View>
        )}

        {/* Signature - Employee */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Podnositelj zahtjeva:</Text>
            <View style={styles.signatureLine} />
          </View>
          <Text style={styles.signatureHint}>(potpis)</Text>
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
        <View style={[styles.signatureSection, { marginTop: 30 }]}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Voditelj odjela:</Text>
            <View style={styles.signatureLine} />
          </View>
          <Text style={styles.signatureHint}>(potpis)</Text>
        </View>

        {/* Signature - Director */}
        <View style={styles.directorSection}>
          <View style={styles.signatureRow}>
            <Text style={styles.signatureLabel}>Direktor:</Text>
            <View style={styles.signatureLine} />
          </View>
          <Text style={styles.signatureHint}>(potpis)</Text>
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
