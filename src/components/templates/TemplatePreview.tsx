import { useCompanySettings } from '@/hooks/useSettings';
import { CreateDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { documentTypeLabels, DocumentType } from '@/types/document';

interface TemplatePreviewProps {
  template: CreateDocumentTemplate;
}

const columnLabels: Record<string, string> = {
  rbr: 'R.br.',
  sifra: 'Šifra',
  naziv: 'Naziv',
  jmj: 'Jmj',
  kolicina: 'Kol.',
  cijena: 'Cijena',
  rabat: 'Rabat %',
  cijena_s_rabatom: 'Cijena s rab.',
  pdv: 'PDV %',
  pdv_iznos: 'PDV',
  ukupno: 'Ukupno',
};

const mockItems = [
  { rbr: 1, sifra: 'ART-001', naziv: 'Primjer artikla 1', jmj: 'kom', kolicina: 2, cijena: 100, rabat: 10, cijena_s_rabatom: 90, pdv: 25, pdv_iznos: 45, ukupno: 225 },
  { rbr: 2, sifra: 'ART-002', naziv: 'Primjer artikla 2', jmj: 'kom', kolicina: 1, cijena: 200, rabat: 0, cijena_s_rabatom: 200, pdv: 25, pdv_iznos: 50, ukupno: 250 },
];

export const TemplatePreview = ({ template }: TemplatePreviewProps) => {
  const { data: companySettings } = useCompanySettings();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div 
      className="bg-white text-black p-4 rounded border shadow-sm overflow-auto max-h-[600px]"
      style={{ 
        fontFamily: template.font_family, 
        fontSize: `${template.body_font_size}px` 
      }}
    >
      {/* Header */}
      <div 
        className={`flex gap-4 mb-4 pb-3 border-b-2 ${
          template.header_layout === 'centered' ? 'flex-col items-center text-center' : 
          template.header_layout === 'logo-only' ? 'justify-center' : 'justify-between'
        }`}
        style={{ borderColor: template.primary_color }}
      >
        {template.show_logo && (
          <div className="flex-shrink-0">
            {companySettings?.logo_url ? (
              <img 
                src={companySettings.logo_url} 
                alt="Logo" 
                className="h-12 object-contain"
              />
            ) : (
              <div 
                className="h-12 w-24 flex items-center justify-center text-xs border-2 border-dashed rounded"
                style={{ borderColor: template.secondary_color }}
              >
                LOGO
              </div>
            )}
          </div>
        )}
        
        {template.show_company_info && template.header_layout !== 'logo-only' && (
          <div className={`text-right ${template.header_layout === 'centered' ? 'text-center' : ''}`} style={{ fontSize: `${template.header_font_size}px` }}>
            <p className="font-bold" style={{ color: template.primary_color }}>
              {companySettings?.company_name || 'Naziv tvrtke d.o.o.'}
            </p>
            <p className="text-gray-600">{companySettings?.address || 'Adresa tvrtke'}</p>
            <p className="text-gray-600">OIB: {companySettings?.oib || '12345678901'}</p>
            {template.show_iban_in_header && (
              <p className="text-gray-600">IBAN: {companySettings?.iban || 'HR1234567890123456789'}</p>
            )}
          </div>
        )}
      </div>

      {/* Document Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold" style={{ color: template.primary_color }}>
          {documentTypeLabels[template.document_type as DocumentType] || 'Dokument'}
        </h2>
        <p className="text-gray-600">Broj: {template.document_type.toUpperCase().slice(0,3)}-2025-0001</p>
        <p className="text-gray-600">Datum: {new Date().toLocaleDateString('hr-HR')}</p>
      </div>

      {/* Client Info */}
      <div className="mb-4 p-2 bg-gray-50 rounded">
        <p className="font-semibold">Kupac:</p>
        <p>Naziv kupca d.o.o.</p>
        <p className="text-gray-600">Adresa kupca 123, 10000 Zagreb</p>
        <p className="text-gray-600">OIB: 98765432109</p>
      </div>

      {/* Metadata */}
      <div className="mb-4 text-sm grid grid-cols-3 gap-2">
        {template.show_payment_method && (
          <div>
            <span className="text-gray-600">Način plaćanja: </span>
            <span>{template.default_payment_method}</span>
          </div>
        )}
        {template.show_validity_days && (
          <div>
            <span className="text-gray-600">Rok valjanosti: </span>
            <span>{template.default_validity_days} dana</span>
          </div>
        )}
        {template.show_delivery_days && (
          <div>
            <span className="text-gray-600">Rok isporuke: </span>
            <span>{template.default_delivery_days} dana</span>
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full mb-4 text-xs" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: template.primary_color, color: 'white' }}>
            {template.table_columns.map((col) => (
              <th key={col} className="p-1 text-left border border-gray-300">
                {columnLabels[col] || col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockItems.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              {template.table_columns.map((col) => (
                <td key={col} className="p-1 border border-gray-300">
                  {col === 'cijena' || col === 'cijena_s_rabatom' || col === 'pdv_iznos' || col === 'ukupno'
                    ? formatCurrency(item[col as keyof typeof item] as number)
                    : col === 'rabat' || col === 'pdv'
                    ? `${item[col as keyof typeof item]}%`
                    : item[col as keyof typeof item]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-4">
        <div className="w-48 text-sm">
          <div className="flex justify-between py-1 border-b">
            <span>Osnovica:</span>
            <span>{formatCurrency(380)}</span>
          </div>
          {template.show_pdv_breakdown && (
            <div className="flex justify-between py-1 border-b">
              <span>PDV (25%):</span>
              <span>{formatCurrency(95)}</span>
            </div>
          )}
          <div className="flex justify-between py-1 font-bold" style={{ color: template.primary_color }}>
            <span>UKUPNO:</span>
            <span>{formatCurrency(475)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t">
        {template.show_prepared_by && (
          <div className="flex justify-between mb-4">
            <div>
              <p className="text-gray-600">{template.prepared_by_label}</p>
              {template.show_signature_line && (
                <div className="mt-4 w-32 border-b border-gray-400" />
              )}
            </div>
            {template.show_director_signature && (
              <div className="text-right">
                <p className="text-gray-600">Direktor:</p>
                {template.show_signature_line && (
                  <div className="mt-4 w-32 border-b border-gray-400 ml-auto" />
                )}
                {template.show_stamp_placeholder && (
                  <div className="mt-2 w-16 h-16 border-2 border-dashed border-gray-300 rounded-full mx-auto flex items-center justify-center text-xs text-gray-400">
                    M.P.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {template.footer_note && (
          <p className="text-xs text-gray-500 text-center mt-4">
            {template.footer_note}
          </p>
        )}

        {template.show_footer_contacts && (
          <div className="text-xs text-center text-gray-500 mt-2 pt-2 border-t">
            Tel: {companySettings?.phone_main || '01/234-5678'} | 
            Email: {companySettings?.email_info || 'info@tvrtka.hr'} | 
            Web: {companySettings?.website || 'www.tvrtka.hr'}
          </div>
        )}
      </div>
    </div>
  );
};
