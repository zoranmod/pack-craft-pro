import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, Mail, Trash2 } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatDateHR } from '@/lib/utils';
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
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { font-weight: 600; color: #666; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .total-section { text-align: right; margin-top: 20px; }
            .notes { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 30px; }
            @media print { body { print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${sanitizedContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current || !document) return;
    
    setIsGeneratingPdf(true);
    toast.info('Generiram PDF...');
    
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
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
            <div ref={printRef} className="bg-white rounded-xl shadow-card border border-border/50 p-8" style={{ fontFamily: template?.font_family || 'Arial' }}>
              {/* Memorandum Header - identical for all documents */}
              <MemorandumHeader />

              {/* Document Title - Centered */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">{documentTypeLabels[document.type].toUpperCase()}</h2>
                <p className="text-base font-semibold text-gray-700">{document.number}</p>
              </div>

              {/* Client Info & Document Details */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">KUPAC / NARUČITELJ</h3>
                  <p className="text-sm font-semibold text-gray-900">{document.clientName}</p>
                  <p className="text-sm text-gray-700">{document.clientAddress}</p>
                  {document.clientOib && <p className="text-sm text-gray-700">OIB: {document.clientOib}</p>}
                  {document.clientPhone && <p className="text-sm text-gray-700">Tel: {document.clientPhone}</p>}
                  {document.clientEmail && <p className="text-sm text-gray-700">Email: {document.clientEmail}</p>}
                  {document.contactPerson && <p className="text-sm text-gray-700">Kontakt: {document.contactPerson}</p>}
                  {document.deliveryAddress && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500">Adresa isporuke:</p>
                      <p className="text-sm text-gray-700">{document.deliveryAddress}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Datum: {formatDateHR(document.date)}</p>
                  {document.validityDays && template?.show_validity_days && (
                    <p className="text-sm text-gray-600">Rok valjanosti: {document.validityDays} dana</p>
                  )}
                  {document.deliveryDays && template?.show_delivery_days && (
                    <p className="text-sm text-gray-600">Rok isporuke: {document.deliveryDays} dana</p>
                  )}
                  {document.paymentMethod && (
                    <p className="text-sm text-gray-600">Način plaćanja: {document.paymentMethod}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-800">
                      <th className="py-2 text-left font-semibold text-gray-700">R.br.</th>
                      <th className="py-2 text-left font-semibold text-gray-700">Naziv</th>
                      <th className="py-2 text-center font-semibold text-gray-700">Jed.</th>
                      <th className="py-2 text-center font-semibold text-gray-700">Kol.</th>
                      <th className="py-2 text-right font-semibold text-gray-700">Cijena</th>
                      {template?.show_discount_column !== false && (
                        <th className="py-2 text-right font-semibold text-gray-700">Rabat</th>
                      )}
                      <th className="py-2 text-right font-semibold text-gray-700">PDV</th>
                      <th className="py-2 text-right font-semibold text-gray-700">Ukupno</th>
                    </tr>
                  </thead>
                  <tbody>
                    {document.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-300">
                        <td className="py-2 text-gray-700">{index + 1}.</td>
                        <td className="py-2 text-gray-900">{item.name}</td>
                        <td className="py-2 text-center text-gray-700">{item.unit}</td>
                        <td className="py-2 text-center text-gray-900">{item.quantity}</td>
                        <td className="py-2 text-right text-gray-900">{item.price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €</td>
                        {template?.show_discount_column !== false && (
                          <td className="py-2 text-right text-gray-700">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                        )}
                        <td className="py-2 text-right text-gray-700">{item.pdv}%</td>
                        <td className="py-2 text-right font-medium text-gray-900">{item.total.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-72 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Osnovica:</span>
                    <span className="text-gray-900">
                      {document.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                  {document.items.some(item => item.discount > 0) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rabat:</span>
                      <span className="text-green-600">
                        -{document.items.reduce((sum, item) => sum + (item.subtotal * item.discount / 100), 0).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  )}
                  {template?.show_pdv_breakdown !== false && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">PDV (25%):</span>
                      <span className="text-gray-900">
                        {document.items.reduce((sum, item) => {
                          const afterDiscount = item.subtotal - (item.subtotal * item.discount / 100);
                          return sum + (afterDiscount * item.pdv / 100);
                        }, 0).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t-2 border-gray-800">
                    <span className="font-bold text-gray-900">UKUPNO:</span>
                    <span className="font-bold text-gray-900">
                      {document.totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {document.notes && (
                <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                  <p className="font-medium text-gray-700 mb-1">Napomene:</p>
                  <p className="text-gray-600">{document.notes}</p>
                </div>
              )}

              {/* Stamp & Signature Section for Ponuda */}
              {document.type === 'ponuda' && (
                <div className="mt-8 pt-6 border-t border-gray-300">
                  {/* Centered Stamp */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-gray-500">M.P.</p>
                  </div>
                  
                  {/* Right-aligned Prepared By & Signature */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      {document.preparedBy && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600">Ponudu izradio/la:</p>
                          <p className="text-sm font-medium text-gray-900">{document.preparedBy}</p>
                        </div>
                      )}
                      <div className="mt-4">
                        <div className="w-48 border-b border-gray-400 mb-1"></div>
                        <p className="text-sm text-gray-500">(Potpis)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
