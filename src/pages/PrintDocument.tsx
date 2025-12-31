import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useDocument } from '@/hooks/useDocuments';
import { useCompanySettings } from '@/hooks/useSettings';
import { useDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useArticles } from '@/hooks/useArticles';
import { Document, documentTypeLabels } from '@/types/document';
import { MemorandumHeader } from '@/components/documents/MemorandumHeader';
import { MemorandumFooter } from '@/components/documents/MemorandumFooter';
import { ContractDocumentView } from '@/components/documents/ContractDocumentView';
import { formatDateHR, formatCurrency, round2 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';

// Shared document content renderer - used by both Preview and Print
export function DocumentContent({ 
  document, 
  template, 
  companySettings,
  enrichedItems,
  hasPrices,
  forPrint = false 
}: { 
  document: Document;
  template?: any;
  companySettings?: any;
  enrichedItems: any[];
  hasPrices: boolean;
  forPrint?: boolean;
}) {
  const isContract = document.type === 'ugovor';

  if (isContract) {
    return (
      <ContractDocumentView 
        document={document}
        companySettings={companySettings}
      />
    );
  }

  return (
    <div 
      className="bg-white flex flex-col print-document" 
      style={{ 
        fontFamily: template?.font_family || 'Arial', 
        width: '210mm', 
        minHeight: '297mm', 
        margin: '0 auto', 
        fontSize: '11.5px', 
        color: '#000',
        padding: forPrint ? '0' : '20px',
        boxSizing: 'border-box'
      }}
    >
      {/* Flex wrapper for content - pushes footer to bottom */}
      <div className="flex-grow flex flex-col">
        {/* Memorandum Header */}
        <MemorandumHeader />

        {/* Document Title - Centered */}
        <div className="text-center mb-4">
          <h2 className="font-bold" style={{ color: '#000', fontSize: '16px' }}>
            {documentTypeLabels[document.type].toUpperCase()}
          </h2>
          <p className="font-semibold" style={{ color: '#000', fontSize: '13px' }}>
            {document.number}
          </p>
        </div>

        {/* Client Info & Document Details */}
        <div className="flex justify-between items-start mb-4" style={{ fontSize: '13px' }}>
          <div>
            <h3 className="font-medium mb-1" style={{ color: '#000' }}>KUPAC / NARUČITELJ</h3>
            <p className="font-semibold" style={{ color: '#000' }}>{document.clientName}</p>
            <p style={{ color: '#000' }}>{document.clientAddress}</p>
            {document.clientOib && <p style={{ color: '#000' }}>OIB: {document.clientOib}</p>}
            {document.clientPhone && <p style={{ color: '#000' }}>Tel: {document.clientPhone}</p>}
            {document.clientEmail && <p style={{ color: '#000' }}>Email: {document.clientEmail}</p>}
            {document.contactPerson && <p style={{ color: '#000' }}>Kontakt: {document.contactPerson}</p>}
            {document.deliveryAddress && (
              <div className="mt-1">
                <p className="font-medium" style={{ color: '#000' }}>Adresa isporuke:</p>
                <p style={{ color: '#000' }}>{document.deliveryAddress}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <p style={{ color: '#000' }}>Datum: {formatDateHR(document.date)}</p>
            {document.validityDays && template?.show_validity_days && (
              <p style={{ color: '#000' }}>Rok valjanosti: {document.validityDays} dana</p>
            )}
            {document.deliveryDays && template?.show_delivery_days && (
              <p style={{ color: '#000' }}>Rok isporuke: {document.deliveryDays} dana</p>
            )}
            {document.paymentMethod && (
              <p style={{ color: '#000' }}>Način plaćanja: {document.paymentMethod}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4 overflow-x-auto">
          <table className="w-full" style={{ fontSize: '11.5px' }}>
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-1 text-left font-semibold" style={{ color: '#000' }}>R.br.</th>
                <th className="py-1 text-left font-semibold" style={{ color: '#000' }}>Šifra</th>
                <th className="py-1 text-left font-semibold" style={{ color: '#000' }}>Naziv</th>
                <th className="py-1 text-center font-semibold" style={{ color: '#000' }}>Jed.</th>
                <th className="py-1 text-center font-semibold" style={{ color: '#000' }}>Kol.</th>
                {hasPrices && (
                  <>
                    <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>Cijena</th>
                    {template?.show_discount_column !== false && (
                      <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>Rabat</th>
                    )}
                    <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>PDV</th>
                    <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>Ukupno</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {enrichedItems.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-1" style={{ color: '#000' }}>{index + 1}.</td>
                  <td className="py-1" style={{ color: '#000' }}>{item.code || ''}</td>
                  <td className="py-1" style={{ color: '#000' }}>{item.name}</td>
                  <td className="py-1 text-center" style={{ color: '#000' }}>{item.unit}</td>
                  <td className="py-1 text-center" style={{ color: '#000' }}>{item.quantity}</td>
                  {hasPrices && (
                    <>
                      <td className="py-1 text-right" style={{ color: '#000' }}>{formatCurrency(item.price)} €</td>
                      {template?.show_discount_column !== false && (
                        <td className="py-1 text-right" style={{ color: '#000' }}>{item.discount > 0 ? `${round2(item.discount)}%` : ''}</td>
                      )}
                      <td className="py-1 text-right" style={{ color: '#000' }}>{round2(item.pdv)}%</td>
                      <td className="py-1 text-right font-medium" style={{ color: '#000' }}>{formatCurrency(item.total)} €</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals - only show for document types with prices */}
        {hasPrices && (
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-1" style={{ fontSize: '11.5px' }}>
              <div className="flex justify-between">
                <span style={{ color: '#000' }}>Osnovica:</span>
                <span style={{ color: '#000' }}>
                  {formatCurrency(document.items.reduce((sum, item) => sum + item.subtotal, 0))} €
                </span>
              </div>
              {document.items.some(item => item.discount > 0) && (
                <div className="flex justify-between">
                  <span style={{ color: '#000' }}>Rabat:</span>
                  <span style={{ color: '#000' }}>
                    -{formatCurrency(document.items.reduce((sum, item) => sum + round2(item.subtotal * item.discount / 100), 0))} €
                  </span>
                </div>
              )}
              {template?.show_pdv_breakdown !== false && (
                <div className="flex justify-between">
                  <span style={{ color: '#000' }}>PDV (25%):</span>
                  <span style={{ color: '#000' }}>
                    {formatCurrency(document.items.reduce((sum, item) => {
                      const afterDiscount = round2(item.subtotal - round2(item.subtotal * item.discount / 100));
                      return sum + round2(afterDiscount * item.pdv / 100);
                    }, 0))} €
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t-2 border-gray-800">
                <span className="font-bold" style={{ color: '#000' }}>UKUPNO:</span>
                <span className="font-bold" style={{ color: '#000' }}>
                  {formatCurrency(document.totalAmount)} €
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {document.notes && (
          <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded" style={{ fontSize: '11.5px' }}>
            <p className="font-medium mb-1" style={{ color: '#000' }}>Napomena</p>
            <p style={{ color: '#000' }}>{document.notes}</p>
          </div>
        )}

        {/* Stamp & Signature Section for Ponuda */}
        {document.type === 'ponuda' && (
          <div className="mt-6 pt-4 border-t border-gray-300">
            <div className="text-center mb-6">
              <p style={{ color: '#000', fontSize: '11.5px' }}>M.P.</p>
            </div>
            <div className="flex justify-end">
              <div className="text-center" style={{ minWidth: '200px' }}>
                {document.preparedBy && (
                  <div className="mb-4">
                    <p style={{ color: '#000', fontSize: '11.5px' }}>Ponudu izradio/la:</p>
                    <p className="font-medium" style={{ color: '#000', fontSize: '11.5px' }}>{document.preparedBy}</p>
                  </div>
                )}
                <div className="mt-6">
                  <div className="w-48 border-b border-gray-400 mx-auto mb-1"></div>
                  <p style={{ color: '#000', fontSize: '11.5px' }}>(Potpis)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Signature Section for Otpremnica/Nalog */}
        {(document.type === 'otpremnica' || document.type === 'nalog-dostava-montaza') && (
          <div className="mt-8 pt-6 border-t border-gray-300" style={{ fontSize: '11.5px' }}>
            <div className="flex items-end justify-between mb-6">
              <div className="flex items-end gap-2">
                <span style={{ color: '#000' }}>Robu preuzeo:</span>
                <div className="w-40 border-b border-gray-400"></div>
              </div>
              <div className="text-center px-4">
                <span style={{ color: '#000' }}>MP</span>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-gray-400 mb-1"></div>
                <span style={{ color: '#000', fontSize: '8px' }}>(potpis)</span>
              </div>
            </div>
            <div className="flex items-end justify-between mb-6">
              <div className="flex items-end gap-2">
                <span style={{ color: '#000' }}>Za tvrtku:</span>
                <div className="w-40 border-b border-gray-400"></div>
              </div>
              <div className="text-center px-4">
                <span style={{ color: '#000' }}>MP</span>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-gray-400 mb-1"></div>
                <span style={{ color: '#000', fontSize: '8px' }}>(potpis)</span>
              </div>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span style={{ color: '#000' }}>Robu izdao skladištar (puno ime i prezime):</span>
              <div className="flex-1 border-b border-gray-400 max-w-[200px]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Legal Notice */}
      <div className="mt-6 text-center">
        <p style={{ color: '#000', fontSize: '11.5px' }}>Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.</p>
      </div>

      {/* Memorandum Footer */}
      <MemorandumFooter />
    </div>
  );
}

const PrintDocument = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const hasPrinted = useRef(false);
  
  const { data: document, isLoading, error } = useDocument(id || '');
  const { data: companySettings } = useCompanySettings();
  const { data: template } = useDocumentTemplate(document?.templateId);
  const { data: articlesData } = useArticles({ pageSize: 1000 });

  // Document types that should NOT show prices
  const hasPrices = document?.type ? ['ponuda', 'racun', 'ugovor'].includes(document.type) : true;

  // Enrich items with codes from articles
  const enrichedItems = useMemo(() => {
    if (!document?.items) return [];
    if (!articlesData?.articles) return document.items;
    
    const articleCodeMap = new Map<string, string>();
    articlesData.articles.forEach(article => {
      if (article.code) {
        articleCodeMap.set(article.name.toLowerCase(), article.code);
      }
    });
    
    return document.items.map(item => ({
      ...item,
      code: item.code || articleCodeMap.get(item.name.toLowerCase()) || ''
    }));
  }, [document?.items, articlesData?.articles]);

  // Auto-print after content loads
  useEffect(() => {
    if (document && !isLoading && !hasPrinted.current) {
      // Small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        hasPrinted.current = true;
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [document, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white print:hidden">
        <p className="text-lg">Učitavanje dokumenta...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white print:hidden">
        <p className="text-lg text-red-600 mb-4">
          {error ? `Greška: ${error.message}` : 'Dokument nije pronađen'}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print-controls {
            display: none !important;
          }
          
          .print-document {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
        
        @media screen {
          body {
            background: #f0f0f0;
          }
        }
      `}</style>

      {/* Back button - hidden on print */}
      <div className="print-controls fixed top-4 left-4 z-50">
        <Button onClick={() => navigate(-1)} variant="outline" className="shadow-lg bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag
        </Button>
      </div>

      {/* Document content */}
      <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
        <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none print:max-w-none">
          <DocumentContent 
            document={document}
            template={template}
            companySettings={companySettings}
            enrichedItems={enrichedItems}
            hasPrices={hasPrices}
            forPrint={true}
          />
        </div>
      </div>
    </>
  );
};

export default PrintDocument;
