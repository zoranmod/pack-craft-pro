import { forwardRef } from 'react';
import DOMPurify from 'dompurify';
import { Document } from '@/types/document';
import { Separator } from '@/components/ui/separator';
import { MemorandumHeader } from './MemorandumHeader';
import { MemorandumFooter } from './MemorandumFooter';
import { formatDateHR } from '@/lib/utils';
interface ContractDocumentViewProps {
  document: Document;
  companySettings?: {
    company_name?: string | null;
    address?: string | null;
    oib?: string | null;
    iban?: string | null;
    logo_url?: string | null;
    print_footer_bottom_mm?: number | null;
    print_footer_max_height_mm?: number | null;
    print_content_bottom_padding_mm?: number | null;
  } | null;
}

// Replace placeholders in content with actual values
const replacePlaceholders = (content: string, document: Document, companySettings?: ContractDocumentViewProps['companySettings']): string => {
  const predujam = document.totalAmount * 0.3; // Default 30% predujam
  const ostatak = document.totalAmount - predujam;
  const replacements: Record<string, string> = {
    '{ukupna_cijena}': `${document.totalAmount.toLocaleString('hr-HR', {
      minimumFractionDigits: 2
    })} €`,
    '{predujam}': `${predujam.toLocaleString('hr-HR', {
      minimumFractionDigits: 2
    })} €`,
    '{ostatak}': `${ostatak.toLocaleString('hr-HR', {
      minimumFractionDigits: 2
    })} €`,
    '{adresa_kupca}': document.clientAddress || '',
    '{ime_kupca}': document.clientName || '',
    '{oib_kupca}': document.clientOib || '',
    '{jamstveni_rok}': '24 mjeseca',
    '{naziv_prodavatelja}': companySettings?.company_name || 'Akord d.o.o.',
    '{adresa_prodavatelja}': companySettings?.address || '',
    '{oib_prodavatelja}': companySettings?.oib || ''
  };
  let result = content;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  return result;
};
export const ContractDocumentView = forwardRef<HTMLDivElement, ContractDocumentViewProps>(({
  document,
  companySettings
}, ref) => {
  const sortedArticles = [...(document.contractArticles || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  // Get print settings from companySettings or use defaults
  const footerBottomMm = companySettings?.print_footer_bottom_mm ?? 14;
  const footerMaxHeightMm = companySettings?.print_footer_max_height_mm ?? 14;
  const contentBottomPaddingMm = companySettings?.print_content_bottom_padding_mm ?? 42;

  // Apply CSS variables for print layout
  const printStyles = {
    '--print-footer-bottom-mm': `${footerBottomMm}mm`,
    '--print-footer-max-height-mm': `${footerMaxHeightMm}mm`,
    '--print-content-bottom-padding-mm': `${contentBottomPaddingMm}mm`
  } as React.CSSProperties;
  return <div ref={ref} className="a4-page-multipage font-serif" style={printStyles}>
        <div className="doc-body">
          {/* Memorandum Header - identical for all documents */}
          <MemorandumHeader />

          {/* Contract Header - Title centered, then 2-column layout */}
          <div className="text-center mb-4">
            <h1 className="font-bold uppercase tracking-wide" style={{
          fontSize: '19px'
        }}>UGOVOR O IZRADI NAMJEŠTAJA PO MJERI</h1>
          </div>

          {/* 2-column layout: seller/buyer left, metadata right */}
          <div className="grid grid-cols-2 gap-4 mb-4 items-start">
            {/* Left: placeholder - intro text goes below */}
            <div></div>

            {/* Right: Document number + date */}
            <div className="text-right text-sm">
              <p className="font-semibold" style={{
            marginBottom: '2px'
          }}>
                {document.number}
              </p>
              <p>Datum: {formatDateHR(document.date)}</p>
            </div>
          </div>

          {/* Intro */}
          <div className="mb-5 text-sm leading-relaxed">
            <p>
              U Zagrebu, dana {formatDateHR(document.date)} godine, sklapaju:
            </p>
          </div>

          {/* Parties */}
          <div className="mb-6 space-y-4">
            {/* Seller */}
            <div className="text-sm">
              <p className="font-bold mb-1">1. PRODAVATELJ:</p>
              <div className="ml-4 space-y-0.5">
                <p className="font-semibold">{companySettings?.company_name || 'Akord d.o.o.'}</p>
                {companySettings?.address && <p>{companySettings.address}</p>}
                {companySettings?.oib && <p>OIB: {companySettings.oib}</p>}
                {companySettings?.iban && <p>IBAN: {companySettings.iban}</p>}
              </div>
            </div>

            {/* Buyer */}
            <div className="text-sm">
              <p className="font-bold mb-1">2. KUPAC:</p>
              <div className="ml-4 space-y-0.5">
                <p className="font-semibold">{document.clientName}</p>
                {document.clientAddress && <p>{document.clientAddress}</p>}
                {document.clientOib && <p>OIB: {document.clientOib}</p>}
                {document.clientPhone && <p>Tel: {document.clientPhone}</p>}
                {document.clientEmail && <p>Email: {document.clientEmail}</p>}
              </div>
            </div>
          </div>

          <Separator className="my-4 bg-black/20" />

          {/* Contract Articles */}
          <div className="space-y-4">
            {sortedArticles.map(article => <div key={article.id} className="text-sm">
                <p className="font-bold mb-1">
                  Članak {article.articleNumber}.
                </p>
                {article.title}
                <div className="leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(replacePlaceholders(article.content, document, companySettings).replace(/\n/g, '<br />'), {
              ALLOWED_TAGS: ['br', 'p', 'strong', 'em', 'b', 'i', 'u', 'span'],
              ALLOWED_ATTR: []
            })
          }} />
              </div>)}
          </div>

          {/* Items Table (if any) */}
          {document.items && document.items.length > 0 && <div className="my-6">
              <p className="font-bold mb-3 text-sm">Popis stavki:</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-1.5 text-left">R.br.</th>
                    <th className="py-1.5 text-left">Naziv</th>
                    <th className="py-1.5 text-center">Kol.</th>
                    <th className="py-1.5 text-center">Jed.</th>
                    <th className="py-1.5 text-right">Cijena</th>
                    <th className="py-1.5 text-right">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item, index) => <tr key={item.id} className="border-b border-black/20">
                      <td className="py-1.5">{index + 1}.</td>
                      <td className="py-1.5">{item.name}</td>
                      <td className="py-1.5 text-center">{item.quantity}</td>
                      <td className="py-1.5 text-center">{item.unit}</td>
                      <td className="py-1.5 text-right">
                        {item.price.toLocaleString('hr-HR', {
                  minimumFractionDigits: 2
                })} €
                      </td>
                      <td className="py-1.5 text-right">
                        {item.total.toLocaleString('hr-HR', {
                  minimumFractionDigits: 2
                })} €
                      </td>
                    </tr>)}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-black font-bold">
                    <td colSpan={5} className="py-1.5 text-right">UKUPNO:</td>
                    <td className="py-1.5 text-right">
                      {document.totalAmount.toLocaleString('hr-HR', {
                  minimumFractionDigits: 2
                })} €
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>}

          {/* Signatures */}
          <div className="mt-10 pt-6">
            <div className="flex justify-between text-sm">
              <div className="text-center w-1/3">
                <p className="mb-12">ZA PRODAVATELJA:</p>
                <div className="border-t border-black pt-1">
                  <p>{companySettings?.company_name || 'Akord d.o.o.'}</p>
                </div>
              </div>
              <div className="text-center w-1/3">
                <p className="mb-12">ZA KUPCA:</p>
                <div className="border-t border-black pt-1">
                  <p>{document.clientName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {document.notes && <div className="mt-6 pt-3 border-t border-black/20">
              <p className="font-bold text-sm mb-1">Napomene:</p>
              <p className="text-sm">{document.notes}</p>
            </div>}
        </div>

        <div className="doc-footer">
          <p className="legal-note">
            Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
          </p>
          <MemorandumFooter />
        </div>
      </div>;
});
ContractDocumentView.displayName = 'ContractDocumentView';