import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, Mail, Trash2, Copy, ChevronDown, FileText, Truck, ScrollText } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels, DocumentItem, DocumentStatus } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatDateHR, formatCurrency, round2 } from '@/lib/utils';
import { useRef, useState, useMemo } from 'react';
import { toast } from 'sonner';

import { ContractDocumentView } from './ContractDocumentView';
import { useCompanySettings } from '@/hooks/useSettings';
import { useDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { MemorandumHeader } from './MemorandumHeader';
import { MemorandumFooter } from './MemorandumFooter';
import { useArticles } from '@/hooks/useArticles';
import { useCopyDocument, useUpdateDocumentStatus, useConvertDocument } from '@/hooks/useDocuments';
import { DocumentType } from '@/types/document';
import { generateDocumentPdf, downloadPdf, printPdf } from '@/lib/pdfGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocumentBodyContent } from '@/pages/PrintDocument';

interface DocumentDetailProps {
  document: Document | null | undefined;
  error?: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  pending: 'bg-primary/10 text-primary',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export function DocumentDetail({ document, error }: DocumentDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { data: companySettings } = useCompanySettings();
  const { data: template } = useDocumentTemplate(document?.templateId);
  const { data: articlesData } = useArticles({ pageSize: 1000 });
  const copyDocument = useCopyDocument();
  const updateStatus = useUpdateDocumentStatus();
  const convertDocument = useConvertDocument();
  
  const handleConvertDocument = async (targetType: DocumentType) => {
    if (!document) return;
    try {
      const newDoc = await convertDocument.mutateAsync({
        sourceDocument: document,
        targetType,
      });
      if (newDoc?.id) {
        navigate(`/documents/${newDoc.id}/edit`);
      }
    } catch (error) {
      // Error is handled in the hook
    }
  };
  
  // All available statuses for the dropdown
  const allStatuses: DocumentStatus[] = ['draft', 'sent', 'accepted', 'completed', 'cancelled'];
  
  const handleStatusChange = (newStatus: DocumentStatus) => {
    if (!document) return;
    updateStatus.mutate({
      id: document.id,
      status: newStatus,
      number: document.number,
    });
  };
  const isContract = document?.type === 'ugovor';
  
  // Document types that should NOT show prices (otpremnica, nalog-dostava-montaza)
  const hasPrices = document?.type ? ['ponuda', 'racun', 'ugovor'].includes(document.type) : true;

  // Enrich items with codes from articles if not already present
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

  // Generate PDF using pdfmake
  const handleDownloadPdf = async () => {
    if (!document) return;
    
    setIsGeneratingPdf(true);
    toast.info('Generiram PDF...');
    
    try {
      const pdfBlob = await generateDocumentPdf({
        document,
        companySettings,
        template,
        enrichedItems,
      });
      
      downloadPdf(pdfBlob, `${document.number}.pdf`);
      toast.success('PDF uspješno generiran!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Greška pri generiranju PDF-a');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Print PDF using pdfmake (no HTML print route)
  const handlePrint = async () => {
    if (!document) return;
    
    setIsGeneratingPdf(true);
    toast.info('Pripremam ispis...');
    
    try {
      const pdfBlob = await generateDocumentPdf({
        document,
        companySettings,
        template,
        enrichedItems,
      });
      
      printPdf(pdfBlob);
      toast.success('Dokument poslan na ispis');
    } catch (err) {
      console.error('Print error:', err);
      toast.error('Greška pri ispisu');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{document.number}</h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors hover:opacity-80',
                    statusStyles[document.status]
                  )}>
                    {documentStatusLabels[document.status]}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg z-50 rounded-lg">
                  {allStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={cn(
                        'cursor-pointer rounded-md',
                        document.status === status && 'bg-accent'
                      )}
                    >
                      <span className={cn(
                        'w-2 h-2 rounded-full mr-2',
                        status === 'draft' && 'bg-muted-foreground',
                        status === 'sent' && 'bg-blue-500',
                        status === 'accepted' && 'bg-success',
                        status === 'completed' && 'bg-success',
                        status === 'cancelled' && 'bg-destructive'
                      )} />
                      {documentStatusLabels[status]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-muted-foreground mt-0.5">{documentTypeLabels[document.type]}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg"
            onClick={() => {
              copyDocument.mutateAsync(document).then((newDoc) => {
                if (newDoc?.id) navigate(`/documents/${newDoc.id}`);
              });
            }}
            disabled={copyDocument.isPending}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copyDocument.isPending ? 'Kopiram...' : 'Kopiraj'}
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Ispis
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
            <Download className="mr-2 h-4 w-4" />
            {isGeneratingPdf ? 'Generiram...' : 'PDF'}
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg">
            <Mail className="mr-2 h-4 w-4" />
            Pošalji
          </Button>
          <Link to={`/documents/${id}/edit`}>
            <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Edit className="mr-2 h-4 w-4" />
              Uredi
            </Button>
          </Link>
        </div>
      </div>

      {/* Responsive grid: stack on small screens, side-by-side on xl+ */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Document Preview - constrained width with horizontal scroll if needed */}
        <div className="w-full min-w-0 overflow-x-auto">
          {isContract ? (
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
              <ContractDocumentView 
                ref={printRef} 
                document={document} 
              />
            </div>
          ) : (
            <div 
              ref={printRef} 
              className="a4-page"
              style={{ 
                fontFamily: template?.font_family || 'Arial',
                fontSize: '11.5px',
                '--print-footer-bottom-mm': `${companySettings?.print_footer_bottom_mm ?? 14}mm`,
                '--print-footer-max-height-mm': `${companySettings?.print_footer_max_height_mm ?? 14}mm`,
                '--print-content-bottom-padding-mm': `${companySettings?.print_content_bottom_padding_mm ?? 42}mm`,
              } as React.CSSProperties}
            >
              <div className="doc-body">
                <MemorandumHeader />
                <DocumentBodyContent
                  document={document}
                  template={template}
                  companySettings={companySettings}
                  enrichedItems={enrichedItems}
                  hasPrices={hasPrices}
                />
              </div>

              <div className="doc-footer">
                <p className="legal-note">
                  Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
                </p>
                <MemorandumFooter />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - stacks below document on smaller screens, fixed width column on xl+ */}
        <div className="w-full xl:w-[320px] space-y-5 flex-shrink-0">
          {/* Document Info Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-5">Informacije</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={cn('text-xs rounded-md', statusStyles[document.status])}>
                  {documentStatusLabels[document.status]}
                </Badge>
              </div>
              <Separator />
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

          {/* Convert Document Panel */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-5">Pretvori u</h3>
            <div className="space-y-2">
              {document.type !== 'racun' && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30" 
                  onClick={() => handleConvertDocument('racun')}
                  disabled={convertDocument.isPending}
                >
                  <FileText className="mr-3 h-4 w-4 text-primary" />
                  {convertDocument.isPending ? 'Kreiram...' : 'Račun'}
                </Button>
              )}
              {document.type !== 'otpremnica' && document.type !== 'nalog-dostava-montaza' && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30" 
                  onClick={() => handleConvertDocument('otpremnica')}
                  disabled={convertDocument.isPending}
                >
                  <Truck className="mr-3 h-4 w-4 text-primary" />
                  {convertDocument.isPending ? 'Kreiram...' : 'Otpremnica'}
                </Button>
              )}
              {document.type !== 'ugovor' && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-lg hover:bg-primary/10 hover:text-primary hover:border-primary/30" 
                  onClick={() => handleConvertDocument('ugovor')}
                  disabled={convertDocument.isPending}
                >
                  <ScrollText className="mr-3 h-4 w-4 text-primary" />
                  {convertDocument.isPending ? 'Kreiram...' : 'Ugovor'}
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-5">Brze akcije</h3>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-lg" 
                onClick={() => {
                  copyDocument.mutateAsync(document).then((newDoc) => {
                    if (newDoc?.id) navigate(`/documents/${newDoc.id}`);
                  });
                }}
                disabled={copyDocument.isPending}
              >
                <Copy className="mr-3 h-4 w-4" />
                {copyDocument.isPending ? 'Kopiram...' : 'Kopiraj dokument'}
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-lg" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                <Download className="mr-3 h-4 w-4" />
                {isGeneratingPdf ? 'Generiram PDF...' : 'Preuzmi kao PDF'}
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-lg">
                <Mail className="mr-3 h-4 w-4" />
                Pošalji emailom
              </Button>
              <Separator className="my-3" />
              <Button variant="outline" className="w-full justify-start rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30">
                <Trash2 className="mr-3 h-4 w-4" />
                Obriši dokument
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
