import { forwardRef } from 'react';
import DOMPurify from 'dompurify';
import { Document } from '@/types/document';
import { Separator } from '@/components/ui/separator';
import { MemorandumHeader } from './MemorandumHeader';
import { MemorandumFooter } from './MemorandumFooter';

interface ContractDocumentViewProps {
  document: Document;
  companySettings?: {
    company_name?: string | null;
    address?: string | null;
    oib?: string | null;
    iban?: string | null;
    logo_url?: string | null;
  } | null;
}

// Replace placeholders in content with actual values
const replacePlaceholders = (
  content: string, 
  document: Document,
  companySettings?: ContractDocumentViewProps['companySettings']
): string => {
  const predujam = document.totalAmount * 0.3; // Default 30% predujam
  const ostatak = document.totalAmount - predujam;
  
  const replacements: Record<string, string> = {
    '{ukupna_cijena}': `${document.totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
    '{predujam}': `${predujam.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
    '{ostatak}': `${ostatak.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €`,
    '{adresa_kupca}': document.clientAddress || '',
    '{ime_kupca}': document.clientName || '',
    '{oib_kupca}': document.clientOib || '',
    '{jamstveni_rok}': '24 mjeseca',
    '{naziv_prodavatelja}': companySettings?.company_name || 'Akord d.o.o.',
    '{adresa_prodavatelja}': companySettings?.address || '',
    '{oib_prodavatelja}': companySettings?.oib || '',
  };

  let result = content;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return result;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
};

export const ContractDocumentView = forwardRef<HTMLDivElement, ContractDocumentViewProps>(
  ({ document, companySettings }, ref) => {
    const sortedArticles = [...(document.contractArticles || [])].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    return (
      <div ref={ref} className="bg-white text-black p-8 min-h-[297mm] font-serif" style={{ width: '210mm' }}>
        {/* Memorandum Header - identical for all documents */}
        <MemorandumHeader companySettings={companySettings} />

        {/* Contract Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold uppercase tracking-wide mb-4">
            Ugovor o kupoprodaji
          </h1>
          <p className="text-sm">
            Broj ugovora: <span className="font-semibold">{document.number}</span>
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8 text-sm leading-relaxed">
          <p className="mb-4">
            U Zagrebu, dana {formatDate(document.date)} godine, sklapaju:
          </p>
        </div>

        {/* Parties */}
        <div className="mb-8 space-y-6">
          {/* Seller */}
          <div className="text-sm">
            <p className="font-bold mb-2">1. PRODAVATELJ:</p>
            <div className="ml-4 space-y-1">
              <p className="font-semibold">{companySettings?.company_name || 'Akord d.o.o.'}</p>
              {companySettings?.address && <p>{companySettings.address}</p>}
              {companySettings?.oib && <p>OIB: {companySettings.oib}</p>}
              {companySettings?.iban && <p>IBAN: {companySettings.iban}</p>}
            </div>
          </div>

          {/* Buyer */}
          <div className="text-sm">
            <p className="font-bold mb-2">2. KUPAC:</p>
            <div className="ml-4 space-y-1">
              <p className="font-semibold">{document.clientName}</p>
              {document.clientAddress && <p>{document.clientAddress}</p>}
              {document.clientOib && <p>OIB: {document.clientOib}</p>}
              {document.clientPhone && <p>Tel: {document.clientPhone}</p>}
              {document.clientEmail && <p>Email: {document.clientEmail}</p>}
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-black/20" />

        {/* Contract Articles */}
        <div className="space-y-6">
          {sortedArticles.map((article) => (
            <div key={article.id} className="text-sm">
              <p className="font-bold mb-2">
                Članak {article.articleNumber}.
              </p>
              {article.title && (
                <p className="font-semibold uppercase mb-2 text-center">
                  {article.title}
                </p>
              )}
              <div 
                className="leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(
                    replacePlaceholders(article.content, document, companySettings)
                      .replace(/\n/g, '<br />'),
                    {
                      ALLOWED_TAGS: ['br', 'p', 'strong', 'em', 'b', 'i', 'u', 'span'],
                      ALLOWED_ATTR: []
                    }
                  )
                }}
              />
            </div>
          ))}
        </div>

        {/* Items Table (if any) */}
        {document.items && document.items.length > 0 && (
          <div className="my-8">
            <p className="font-bold mb-4 text-sm">Popis stavki:</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 text-left">R.br.</th>
                  <th className="py-2 text-left">Naziv</th>
                  <th className="py-2 text-center">Kol.</th>
                  <th className="py-2 text-center">Jed.</th>
                  <th className="py-2 text-right">Cijena</th>
                  <th className="py-2 text-right">Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {document.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-black/20">
                    <td className="py-2">{index + 1}.</td>
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-center">{item.quantity}</td>
                    <td className="py-2 text-center">{item.unit}</td>
                    <td className="py-2 text-right">
                      {item.price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </td>
                    <td className="py-2 text-right">
                      {item.total.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-black font-bold">
                  <td colSpan={5} className="py-2 text-right">UKUPNO:</td>
                  <td className="py-2 text-right">
                    {document.totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-16 pt-8">
          <div className="flex justify-between text-sm">
            <div className="text-center w-1/3">
              <p className="mb-16">ZA PRODAVATELJA:</p>
              <div className="border-t border-black pt-2">
                <p>{companySettings?.company_name || 'Akord d.o.o.'}</p>
              </div>
            </div>
            <div className="text-center w-1/3">
              <p className="mb-16">ZA KUPCA:</p>
              <div className="border-t border-black pt-2">
                <p>{document.clientName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {document.notes && (
          <div className="mt-8 pt-4 border-t border-black/20">
            <p className="font-bold text-sm mb-2">Napomene:</p>
            <p className="text-sm">{document.notes}</p>
          </div>
        )}

        {/* Memorandum Footer - identical for all documents */}
        <MemorandumFooter companySettings={companySettings} />
      </div>
    );
  }
);

ContractDocumentView.displayName = 'ContractDocumentView';
