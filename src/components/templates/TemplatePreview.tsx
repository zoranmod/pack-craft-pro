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
      className="a4-page"
      style={{
        fontFamily: template.font_family,
        fontSize: `${template.body_font_size}px`,
      }}
    >
      <div className="doc-body">
        {/* Memorandum Header - identical for all documents */}
        <MemorandumHeader />

        {/* Document Title - centered */}
        <div className="text-center mb-4">
          <h2 className="font-bold uppercase tracking-wide" style={{ color: template.primary_color, fontSize: '19px', letterSpacing: '0.5px' }}>
            {documentTypeLabels[template.document_type as DocumentType] || 'Dokument'}
          </h2>
        </div>

        {/* 2-column layout: buyer left, metadata right, aligned at top */}
        <div className="grid grid-cols-2 gap-4 mb-5 items-start">
          {/* Left: Client Info */}
          <div className="p-3 rounded" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
            <p className="font-semibold text-sm mb-1" style={{ color: '#000' }}>Kupac:</p>
            <p className="font-medium" style={{ color: '#000' }}>Naziv kupca d.o.o.</p>
            <p className="text-sm" style={{ color: '#4b5563' }}>Adresa kupca 123, 10000 Zagreb</p>
            <p className="text-sm" style={{ color: '#4b5563' }}>OIB: 98765432109</p>
          </div>

          {/* Right: Document metadata */}
          <div className="text-right text-sm" style={{ color: '#000' }}>
            <p className="font-semibold" style={{ marginBottom: '2px' }}>
              {template.document_type.toUpperCase().slice(0,3)}-2025-0001
            </p>
            <p style={{ color: '#4b5563' }}>Datum: {formatDateHR(new Date())}</p>
            {template.show_validity_days && (
              <p style={{ color: '#4b5563' }}>Rok valjanosti: {template.default_validity_days} dana</p>
            )}
            {template.show_delivery_days && (
              <p style={{ color: '#4b5563' }}>Rok isporuke: {template.default_delivery_days} dana</p>
            )}
            {template.show_payment_method && (
              <p style={{ color: '#4b5563' }}>Način plaćanja: {template.default_payment_method}</p>
            )}
          </div>
        </div>
        {/* Table */}
        <table className="w-full mb-6 text-xs" style={{ borderCollapse: 'collapse', color: '#000' }}>
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
              <tr key={index} style={{ background: index % 2 === 0 ? '#f9fafb' : '#ffffff' }}>
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
              <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #d1d5db' }}>
                <span style={{ color: '#4b5563' }}>Osnovica:</span>
                <span style={{ color: '#000' }}>{formatCurrency(380)}</span>
              </div>
              {template.show_pdv_breakdown && (
                <div className="flex justify-between py-1.5" style={{ borderBottom: '1px solid #d1d5db' }}>
                  <span style={{ color: '#4b5563' }}>PDV (25%):</span>
                  <span style={{ color: '#000' }}>{formatCurrency(95)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-bold text-base" style={{ color: template.primary_color }}>
                <span>UKUPNO:</span>
                <span>{formatCurrency(475)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="doc-footer">
        <p className="legal-note">
          Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
        </p>
        <MemorandumFooter />
      </div>
    </div>
  );
};
