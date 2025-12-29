import iso9001 from '@/assets/certificates/iso-9001.png';
import iso14001 from '@/assets/certificates/iso-14001.png';
import hrvatskaKvaliteta from '@/assets/certificates/hrvatska-kvaliteta.jpg';

interface MemorandumFooterProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  companySettings?: any;
  showPreparedBy?: boolean;
  preparedByLabel?: string;
  preparedByName?: string;
}

export const MemorandumFooter = ({
  companySettings,
  showPreparedBy = false,
  preparedByLabel = 'Ponudu izradio/la:',
  preparedByName,
}: MemorandumFooterProps) => {
  return (
    <div className="mt-8">
      {/* Prepared By Section */}
      {showPreparedBy && preparedByName && (
        <div className="mb-6">
          <p className="text-xs text-gray-600">{preparedByLabel}</p>
          <p className="text-sm font-medium text-gray-900">{preparedByName}</p>
        </div>
      )}

      {/* Footer Note */}
      <p className="text-xs text-gray-500 text-center mb-4 italic">
        Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
      </p>
      
      {/* Certificates */}
      <div className="flex justify-center gap-4 mb-4">
        <img src={iso9001} alt="ISO 9001" className="h-10 object-contain" />
        <img src={iso14001} alt="ISO 14001" className="h-10 object-contain" />
        <img src={hrvatskaKvaliteta} alt="Hrvatska kvaliteta" className="h-10 object-contain" />
      </div>
      
      {/* Contact Info */}
      <div className="text-center text-xs text-gray-600 space-y-0.5">
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
      
      {/* Registration Info */}
      <div className="text-center text-xs text-gray-500 mt-2 space-y-0.5">
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
    </div>
  );
};
