import { useCompanySettings } from '@/hooks/useSettings';
import { CreateDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { documentTypeLabels, DocumentType } from '@/types/document';
import { MemorandumHeader } from '@/components/documents/MemorandumHeader';
import { MemorandumFooter } from '@/components/documents/MemorandumFooter';
import { formatDateHR } from '@/lib/utils';

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

  // Otpremnica i nalog za dostavu/montažu ne bi trebali prikazivati novčane iznose
  const hasPrices = ['ponuda', 'racun', 'ugovor'].includes(template.document_type as DocumentType);
  const tableColumns = template.table_columns || ['rbr', 'naziv', 'jmj', 'kolicina'];
  const visibleColumns = hasPrices
    ? tableColumns
    : tableColumns.filter(
        (col) => !['cijena', 'rabat', 'cijena_s_rabatom', 'pdv', 'pdv_iznos', 'ukupno'].includes(col)
      );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <div 
      className="bg-white text-black p-6 rounded border shadow-sm overflow-auto max-h-[700px] flex flex-col"
      style={{ 
        fontFamily: template.font_family, 
        fontSize: `${template.body_font_size}px`,
        minHeight: '297mm',
        width: '210mm'
      }}
    >
      {/* Flex wrapper for content */}
      <div className="flex-grow flex flex-col">
      {/* Memorandum Header - identical for all documents */}
      <MemorandumHeader />

      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wide" style={{ color: template.primary_color }}>
          {documentTypeLabels[template.document_type as DocumentType] || 'Dokument'}
        </h2>
        <p className="text-gray-600 mt-1">Broj: {template.document_type.toUpperCase().slice(0,3)}-2025-0001</p>
        <p className="text-gray-600">Datum: {formatDateHR(new Date())}</p>
      </div>

      {/* Client Info */}
      <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200">
        <p className="font-semibold text-sm mb-1">Kupac:</p>
        <p className="font-medium">Naziv kupca d.o.o.</p>
        <p className="text-gray-600 text-sm">Adresa kupca 123, 10000 Zagreb</p>
        <p className="text-gray-600 text-sm">OIB: 98765432109</p>
      </div>

      {/* Metadata */}
      <div className="mb-4 text-sm flex flex-wrap gap-x-6 gap-y-1">
        {template.show_payment_method && (
          <div>
            <span className="text-gray-600">Način plaćanja: </span>
            <span className="font-medium">{template.default_payment_method}</span>
          </div>
        )}
        {template.show_validity_days && (
          <div>
            <span className="text-gray-600">Rok valjanosti: </span>
            <span className="font-medium">{template.default_validity_days} dana</span>
          </div>
        )}
        {template.show_delivery_days && (
          <div>
            <span className="text-gray-600">Rok isporuke: </span>
            <span className="font-medium">{template.default_delivery_days} dana</span>
          </div>
        )}
      </div>

      {/* Table */}
      <table className="w-full mb-6 text-xs" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: template.primary_color, color: 'white' }}>
            {visibleColumns.map((col) => (
              <th key={col} className="p-2 text-left border border-gray-300 font-semibold">
                {columnLabels[col] || col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mockItems.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {visibleColumns.map((col) => (
                <td key={col} className="p-2 border border-gray-300">
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
      {hasPrices && (
        <div className="flex justify-end mb-6">
          <div className="w-56 text-sm">
            <div className="flex justify-between py-1.5 border-b border-gray-300">
              <span className="text-gray-600">Osnovica:</span>
              <span>{formatCurrency(380)}</span>
            </div>
            {template.show_pdv_breakdown && (
              <div className="flex justify-between py-1.5 border-b border-gray-300">
                <span className="text-gray-600">PDV (25%):</span>
                <span>{formatCurrency(95)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 font-bold text-base" style={{ color: template.primary_color }}>
              <span>UKUPNO:</span>
              <span>{formatCurrency(475)}</span>
            </div>
          </div>
        </div>
      )}

      {/* End of flex-grow wrapper */}
      </div>

      {/* Memorandum Footer - identical for all documents */}
      <MemorandumFooter />
    </div>
  );
};
