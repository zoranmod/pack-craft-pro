import { CompanySettings } from '@/types/companySettings';
import akordLogo from '@/assets/akord-logo.jpg';

interface ProfessionalDocumentHeaderProps {
  companySettings?: CompanySettings | null;
  showLogo?: boolean;
  showIbanInHeader?: boolean;
  showSecondIban?: boolean;
}

export const ProfessionalDocumentHeader = ({
  companySettings,
  showLogo = true,
  showIbanInHeader = true,
  showSecondIban = true,
}: ProfessionalDocumentHeaderProps) => {
  const logoUrl = companySettings?.logo_url || akordLogo;
  
  return (
    <div className="mb-6">
      <div className="flex gap-6">
        {/* Logo */}
        {showLogo && (
          <div className="flex-shrink-0">
            <img 
              src={logoUrl} 
              alt="Logo tvrtke" 
              className="h-24 w-auto object-contain"
            />
          </div>
        )}
        
        {/* Company Info */}
        <div className="flex-1 text-right text-sm leading-relaxed">
          <p className="font-bold text-base">
            {companySettings?.company_name || 'Akord d.o.o. za Proizvodnju, Trgovinu i Usluge,'}
          </p>
          <p className="text-gray-700">Proizvodnja namještaja</p>
          <p className="text-gray-700">
            {companySettings?.address || '32270 Županja, Veliki kraj 131, Hrvatska'}
          </p>
          <p className="text-gray-700">
            OIB: {companySettings?.oib || '97777678206'}
            {companySettings?.pdv_id && `, PDV ID: ${companySettings.pdv_id}`}
          </p>
          
          {showIbanInHeader && (
            <>
              <p className="text-gray-700">
                IBAN {companySettings?.bank_name_1 || 'PBZ'}: {companySettings?.iban || 'HR7123400091110309063'}
                {companySettings?.swift_1 && `, BIC (SWIFT) = ${companySettings.swift_1}`}
              </p>
              {showSecondIban && companySettings?.iban_2 && (
                <p className="text-gray-700">
                  IBAN {companySettings?.bank_name_2 || 'ERSTE'}: {companySettings.iban_2}
                  {companySettings?.swift_2 && `, BIC (SWIFT) = ${companySettings.swift_2}`}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Separator line */}
      <div className="mt-4 border-t-2 border-gray-800" />
    </div>
  );
};
