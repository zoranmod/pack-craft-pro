import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, Mail, Trash2 } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatDateHR, formatCurrency, round2 } from '@/lib/utils';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';
import { ContractDocumentView } from './ContractDocumentView';
import { useCompanySettings } from '@/hooks/useSettings';
import { useDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { MemorandumHeader } from './MemorandumHeader';
import { MemorandumFooter } from './MemorandumFooter';

interface DocumentDetailProps {
  document: Document | null | undefined;
  error?: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function DocumentDetail({ document, error }: DocumentDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { data: companySettings } = useCompanySettings();
  const { data: template } = useDocumentTemplate(document?.templateId);
  
  const isContract = document?.type === 'ugovor';

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Blokirani skočni prozori. Molimo omogućite ih za ispis.');
      return;
    }
    
    // Sanitize innerHTML to prevent XSS attacks
    const sanitizedContent = DOMPurify.sanitize(printContent.innerHTML, {
      ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'br', 'hr', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['class', 'style', 'src', 'alt', 'colspan', 'rowspan'],
    });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${DOMPurify.sanitize(document?.number || 'Dokument')}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              color: #333; 
              margin: 0;
              padding: 0;
              width: 210mm;
              min-height: 297mm;
            }
            .print-container {
              width: 100%;
              padding: 0;
            }
            img { max-width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11px; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { font-weight: 600; color: #666; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-sm { font-size: 11px; }
            .text-xs { font-size: 10px; }
            .text-xl { font-size: 18px; }
            .text-base { font-size: 13px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-4 { margin-bottom: 16px; }
            .mb-6 { margin-bottom: 24px; }
            .mb-8 { margin-bottom: 32px; }
            .mt-2 { margin-top: 8px; }
            .mt-4 { margin-top: 16px; }
            .mt-8 { margin-top: 32px; }
            .pt-2 { padding-top: 8px; }
            .pt-6 { padding-top: 24px; }
            .pt-8 { padding-top: 32px; }
            .py-1 { padding-top: 4px; padding-bottom: 4px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .p-3 { padding: 12px; }
            .border-t { border-top: 1px solid #ddd; }
            .border-b { border-bottom: 1px solid #ddd; }
            .border-t-2 { border-top: 2px solid #333; }
            .border-b-2 { border-bottom: 2px solid #333; }
            .rounded { border-radius: 4px; }
            .bg-gray-50 { background-color: #f9fafb; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-900 { color: #111827; }
            .space-y-1 > * + * { margin-top: 4px; }
            .w-72 { width: 288px; }
            .w-48 { width: 192px; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-end { justify-content: flex-end; }
            .items-start { align-items: flex-start; }
            @media print { 
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${sanitizedContent}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 250);
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !document) return;
    
    setIsGeneratingPdf(true);
    toast.info('Generiram PDF...');
    
    try {
      // A4 dimensions in mm: 210 x 297
      const a4WidthMm = 210;
      const a4HeightMm = 297;
      const marginMm = 10;
      const contentWidthMm = a4WidthMm - (marginMm * 2);
      
      // Use a fixed scale for consistent quality
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      // Calculate dimensions to fit content width to A4 width
      const imgWidthMm = contentWidthMm;
      const imgHeightMm = (canvas.height / canvas.width) * imgWidthMm;
      const imgX = marginMm;
      const imgY = marginMm;
      
      // Handle multi-page if content is longer than A4
      const pageContentHeight = a4HeightMm - (marginMm * 2);
      
      if (imgHeightMm <= pageContentHeight) {
        // Single page - center vertically if there's space
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidthMm, imgHeightMm);
      } else {
        // Multi-page
        let remainingHeight = imgHeightMm;
        let sourceY = 0;
        let pageNum = 0;
        
        while (remainingHeight > 0) {
          if (pageNum > 0) {
            pdf.addPage();
          }
          
          const sliceHeight = Math.min(pageContentHeight, remainingHeight);
          const sliceRatio = sliceHeight / imgHeightMm;
          const sourceHeight = canvas.height * sliceRatio;
          
          // Create a canvas slice for this page
          const sliceCanvas = window.document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sourceHeight;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
            const sliceData = sliceCanvas.toDataURL('image/png', 1.0);
            pdf.addImage(sliceData, 'PNG', imgX, imgY, imgWidthMm, sliceHeight);
          }
          
          sourceY += sourceHeight;
          remainingHeight -= sliceHeight;
          pageNum++;
        }
      }
      
      pdf.save(`${document.number}.pdf`);
      
      toast.success('PDF uspješno generiran!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Greška pri generiranju PDF-a');
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-destructive">Greška: {error}</p>
        <Button variant="ghost" onClick={() => navigate('/documents')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag na listu
        </Button>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-foreground">Dokument nije pronađen</p>
        <Button variant="ghost" onClick={() => navigate('/documents')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag na listu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{document.number}</h1>
              <Badge variant="outline" className={cn(statusStyles[document.status])}>
                {documentStatusLabels[document.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{documentTypeLabels[document.type]}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Ispis
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? 'Generiram...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Pošalji
          </Button>
          <Link to={`/documents/${id}/edit`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Uredi
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          {isContract ? (
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
              <ContractDocumentView 
                ref={printRef} 
                document={document} 
              />
            </div>
          ) : (
            <div ref={printRef} className="bg-white rounded-xl shadow-card border border-border/50 p-6" style={{ fontFamily: template?.font_family || 'Arial', maxWidth: '210mm', margin: '0 auto', fontSize: '10px', color: '#000' }}>
              {/* Memorandum Header - identical for all documents */}
              <MemorandumHeader />

              {/* Document Title - Centered */}
              <div className="text-center mb-4">
                <h2 className="text-base font-bold" style={{ color: '#000' }}>{documentTypeLabels[document.type].toUpperCase()}</h2>
                <p className="text-sm font-semibold" style={{ color: '#000' }}>{document.number}</p>
              </div>

              {/* Client Info & Document Details */}
              <div className="flex justify-between items-start mb-4" style={{ fontSize: '10px' }}>
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
                <table className="w-full" style={{ fontSize: '10px' }}>
                  <thead>
                    <tr className="border-b-2 border-gray-800">
                      <th className="py-1 text-left font-semibold" style={{ color: '#000' }}>R.br.</th>
                      <th className="py-1 text-left font-semibold" style={{ color: '#000' }}>Šifra</th>
                      <th className="py-1 text-left font-semibold" style={{ color: '#000' }}>Naziv</th>
                      <th className="py-1 text-center font-semibold" style={{ color: '#000' }}>Jed.</th>
                      <th className="py-1 text-center font-semibold" style={{ color: '#000' }}>Kol.</th>
                      <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>Cijena</th>
                      {template?.show_discount_column !== false && (
                        <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>Rabat</th>
                      )}
                      <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>PDV</th>
                      <th className="py-1 text-right font-semibold" style={{ color: '#000' }}>Ukupno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-300">
                        <td className="py-1" style={{ color: '#000' }}>{index + 1}.</td>
                        <td className="py-1" style={{ color: '#000' }}>{(item as any).code || ''}</td>
                        <td className="py-1" style={{ color: '#000' }}>{item.name}</td>
                        <td className="py-1 text-center" style={{ color: '#000' }}>{item.unit}</td>
                        <td className="py-1 text-center" style={{ color: '#000' }}>{item.quantity}</td>
                        <td className="py-1 text-right" style={{ color: '#000' }}>{formatCurrency(item.price)} €</td>
                        {template?.show_discount_column !== false && (
                          <td className="py-1 text-right" style={{ color: '#000' }}>{item.discount > 0 ? `${round2(item.discount)}%` : ''}</td>
                        )}
                        <td className="py-1 text-right" style={{ color: '#000' }}>{round2(item.pdv)}%</td>
                        <td className="py-1 text-right font-medium" style={{ color: '#000' }}>{formatCurrency(item.total)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-1" style={{ fontSize: '10px' }}>
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

              {/* Notes */}
              {document.notes && (
                <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded" style={{ fontSize: '10px' }}>
                  <p className="font-medium mb-1" style={{ color: '#000' }}>Napomene:</p>
                  <p style={{ color: '#000' }}>{document.notes}</p>
                </div>
              )}

              {/* Stamp & Signature Section for Ponuda */}
              {document.type === 'ponuda' && (
                <div className="mt-6 pt-4 border-t border-gray-300">
                  {/* Centered Stamp */}
                  <div className="text-center mb-6">
                    <p style={{ color: '#000', fontSize: '10px' }}>M.P.</p>
                  </div>
                  
                  {/* Right-aligned Prepared By & Signature */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      {document.preparedBy && (
                        <div className="mb-6">
                          <p style={{ color: '#000', fontSize: '10px' }}>Ponudu izradio/la:</p>
                          <p className="font-medium" style={{ color: '#000', fontSize: '10px' }}>{document.preparedBy}</p>
                        </div>
                      )}
                      <div className="mt-8 text-center">
                        <div className="w-40 border-b border-gray-400 mx-auto mb-1"></div>
                        <p style={{ color: '#000', fontSize: '10px' }}>(Potpis)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Legal Notice */}
              <div className="mt-6 text-center">
                <p style={{ color: '#dc2626', fontSize: '10px' }}>Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.</p>
              </div>

              {/* Memorandum Footer - identical for all documents */}
              <MemorandumFooter />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4">Status dokumenta</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={cn(statusStyles[document.status])}>
                  {documentStatusLabels[document.status]}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kreirano</span>
                <span className="text-foreground">{formatDateHR(document.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ažurirano</span>
                <span className="text-foreground">{formatDateHR(document.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4">Brze akcije</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPdf ? 'Generiram PDF...' : 'Preuzmi kao PDF'}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Pošalji emailom
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Obriši dokument
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
