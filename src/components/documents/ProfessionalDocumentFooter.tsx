import { CompanySettings } from '@/types/companySettings';
import iso9001 from '@/assets/certificates/iso-9001.png';
import iso14001 from '@/assets/certificates/iso-14001.png';
import hrvatskaKvaliteta from '@/assets/certificates/hrvatska-kvaliteta.jpg';

interface ProfessionalDocumentFooterProps {
  companySettings?: CompanySettings | null;
  showCertificates?: boolean;
  showFooterContacts?: boolean;
  showRegistrationInfo?: boolean;
  footerNote?: string;
  preparedByLabel?: string;
  showPreparedBy?: boolean;
  showSignatureLine?: boolean;
  showStampPlaceholder?: boolean;
  showDirectorSignature?: boolean;
}

export const ProfessionalDocumentFooter = ({
  companySettings,
  showCertificates = true,
  showFooterContacts = true,
  showRegistrationInfo = true,
  footerNote = 'Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.',
  preparedByLabel = 'Ponudu izradio/la:',
  showPreparedBy = true,
  showSignatureLine = true,
  showStampPlaceholder = true,
  showDirectorSignature = false,
}: ProfessionalDocumentFooterProps) => {
  return (
    <div className="mt-8 pt-4 border-t border-gray-300">
      {/* Signature Section */}
      {showPreparedBy && (
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-6">{preparedByLabel}</p>
            {showSignatureLine && (
              <div className="w-40 border-b border-gray-400" />
            )}
          </div>
          
          <div className="flex items-end gap-8">
            {showStampPlaceholder && (
              <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-500">M.P.</span>
              </div>
            )}
            
            {showDirectorSignature && (
              <div className="text-right">
                <div className="w-40 border-b border-gray-400 mb-2" />
                <p className="text-sm text-gray-600">(potpis)</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Footer Note */}
      {footerNote && (
        <p className="text-xs text-gray-500 text-center mb-4 italic">
          {footerNote}
        </p>
      )}
      
      {/* Certificates */}
      {showCertificates && (
        <div className="flex justify-center gap-4 mb-4">
          <img src={iso9001} alt="ISO 9001" className="h-12 object-contain" />
          <img src={iso14001} alt="ISO 14001" className="h-12 object-contain" />
          <img src={hrvatskaKvaliteta} alt="Hrvatska kvaliteta" className="h-12 object-contain" />
        </div>
      )}
      
      {/* Contact Info */}
      {showFooterContacts && (
        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>
            {companySettings?.website || 'www.akord-zupanja.hr'} ⸰{' '}
            {companySettings?.email_info || 'info@akord-zupanja.hr'} ⸰{' '}
            Besplatan info tel: {companySettings?.phone_main || '0800 9455'}
          </p>
          <p>
            Maloprodaja {companySettings?.phone_sales || '+385 32 830 345'} ⸰{' '}
            Veleprodaja +385 32 830 346 ⸰{' '}
            Projektiranje namještaja +385 32 638 776 ⸰{' '}
            Računovodstvo {companySettings?.phone_accounting || '+385 32 638 900'}
          </p>
        </div>
      )}
      
      {/* Registration Info */}
      {showRegistrationInfo && (
        <div className="text-center text-xs text-gray-500 mt-3 space-y-0.5">
          <p>
            Društvo je upisano u sudski registar trgovačkog suda u Osijeku:{' '}
            {companySettings?.registration_number || 'Tt-15/3264-2 MBS 030094758'}.
          </p>
          <p>
            Temeljni kapital iznosi {companySettings?.capital_amount || '1.160.000,00 kn'} i uplaćen je u cijelosti.
          </p>
          <p>
            Uprava: {companySettings?.director_name || 'Mario Špoljar'}
          </p>
        </div>
      )}
    </div>
  );
};
