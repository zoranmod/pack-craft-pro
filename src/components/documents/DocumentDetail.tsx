import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, Mail, Trash2 } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

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
          <div ref={printRef} className="bg-card rounded-xl shadow-card border border-border/50 p-8">
            {/* Document Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-foreground gradient-primary bg-clip-text text-transparent">
                  Akord
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Vaša tvrtka d.o.o.</p>
                <p className="text-sm text-muted-foreground">Ulica 123, 10000 Zagreb</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{document.number}</p>
                <p className="text-sm text-muted-foreground">{documentTypeLabels[document.type]}</p>
                <p className="text-sm text-muted-foreground mt-2">Datum: {document.date}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Client Info */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">KLIJENT</h3>
              <p className="font-semibold text-foreground">{document.clientName}</p>
              <p className="text-muted-foreground">{document.clientAddress}</p>
              {document.clientPhone && (
                <p className="text-muted-foreground">Tel: {document.clientPhone}</p>
              )}
              {document.clientEmail && (
                <p className="text-muted-foreground">Email: {document.clientEmail}</p>
              )}
            </div>

            {/* Items Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 text-left text-sm font-medium text-muted-foreground">Stavka</th>
                    <th className="py-3 text-center text-sm font-medium text-muted-foreground">Kol.</th>
                    <th className="py-3 text-center text-sm font-medium text-muted-foreground">Jed.</th>
                    <th className="py-3 text-right text-sm font-medium text-muted-foreground">Cijena</th>
                    <th className="py-3 text-right text-sm font-medium text-muted-foreground">Rabat</th>
                    <th className="py-3 text-right text-sm font-medium text-muted-foreground">PDV</th>
                    <th className="py-3 text-right text-sm font-medium text-muted-foreground">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-4 text-foreground">{item.name}</td>
                      <td className="py-4 text-center text-foreground">{item.quantity}</td>
                      <td className="py-4 text-center text-muted-foreground">{item.unit}</td>
                      <td className="py-4 text-right text-foreground">{item.price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €</td>
                      <td className="py-4 text-right text-foreground">{item.discount > 0 ? `${item.discount}%` : '-'}</td>
                      <td className="py-4 text-right text-foreground">{item.pdv}%</td>
                      <td className="py-4 text-right font-medium text-foreground">{item.total.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Osnovica</span>
                  <span className="text-foreground">
                    {document.items.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                {document.items.some(item => item.discount > 0) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rabat</span>
                    <span className="text-success">
                      -{document.items.reduce((sum, item) => sum + (item.subtotal * item.discount / 100), 0).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PDV</span>
                  <span className="text-foreground">
                    {document.items.reduce((sum, item) => {
                      const afterDiscount = item.subtotal - (item.subtotal * item.discount / 100);
                      return sum + (afterDiscount * item.pdv / 100);
                    }, 0).toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">UKUPNO</span>
                  <span className="text-xl font-bold text-primary">
                    {document.totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {document.notes && (
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">NAPOMENE</h3>
                <p className="text-foreground">{document.notes}</p>
              </div>
            )}
          </div>
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
                <span className="text-foreground">
                  {new Date(document.createdAt).toLocaleDateString('hr-HR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ažurirano</span>
                <span className="text-foreground">
                  {new Date(document.updatedAt).toLocaleDateString('hr-HR')}
                </span>
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
