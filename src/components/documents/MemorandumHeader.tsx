import akordLogo from '@/assets/akord-logo.jpg';

interface MemorandumHeaderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  companySettings?: any;
}

export const MemorandumHeader = ({ companySettings }: MemorandumHeaderProps) => {
  const logoUrl = companySettings?.logo_url || akordLogo;
  
  return (
    <div className="mb-6">
      <div className="flex gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img 
            src={logoUrl} 
            alt="Logo tvrtke" 
            className="h-20 w-auto object-contain"
          />
        </div>
        
        {/* Company Info - exact layout from PDF */}
        <div className="flex-1 text-right text-xs leading-tight">
          <p className="font-bold text-sm">
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
          <p className="text-gray-700">
            IBAN {companySettings?.bank_name_1 || 'PBZ'}: {companySettings?.iban || 'HR7123400091110309063'}
            {companySettings?.swift_1 && `, BIC (SWIFT) = ${companySettings.swift_1}`}
          </p>
          {companySettings?.iban_2 && (
            <p className="text-gray-700">
              IBAN {companySettings?.bank_name_2 || 'ERSTE'}: {companySettings.iban_2}
              {companySettings?.swift_2 && `, BIC (SWIFT) = ${companySettings.swift_2}`}
            </p>
          )}
        </div>
      </div>
      
      {/* Separator line */}
      <div className="mt-3 border-t-2 border-gray-800" />
    </div>
  );
};
