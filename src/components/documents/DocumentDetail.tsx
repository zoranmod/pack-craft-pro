import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Trash2, Copy, ChevronDown, FileText, Truck, ScrollText, Loader2, FileCode } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels, DocumentItem, DocumentStatus } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn, formatDateHR, formatCurrency, round2 } from '@/lib/utils';
import { useRef, useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import { ContractDocumentView } from './ContractDocumentView';
import { DocumentWysiwygEditor } from './DocumentWysiwygEditor';
import { useCompanySettings } from '@/hooks/useSettings';
import { useActiveTemplate } from '@/hooks/useActiveTemplate';
import { MemorandumHeader } from './MemorandumHeader';
import { GlobalDocumentHeader } from './GlobalDocumentHeader';
import { GlobalDocumentFooter } from './GlobalDocumentFooter';
import { TemplateDebugIndicator } from './TemplateDebugIndicator';
import { LayoutEditor } from './LayoutEditor';
import { useArticles } from '@/hooks/useArticles';
import { useCopyDocument, useUpdateDocumentStatus, useConvertDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { DocumentType } from '@/types/document';
import { generateAndDownloadPdf } from '@/lib/pdfGenerator';
import { useDocumentHeaderSettings, useDocumentFooterSettings } from '@/hooks/useDocumentSettings';
import { usePonudaLayoutSettings, useSavePonudaLayoutSettings, defaultPonudaLayoutSettings } from '@/hooks/usePonudaLayoutSettings';
import { useDocumentChain } from '@/hooks/useDocumentChain';
import { DocumentChain } from './DocumentChain';
import { DocumentHistory } from './DocumentHistory';
import { MosquitoNetDocumentView } from './MosquitoNetDocumentView';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  const { data: companySettings } = useCompanySettings();
  
  // Use active template hook - resolves document template, default template, or fallback
  const { template, isLoading: isLoadingTemplate, templateSource } = useActiveTemplate(
    document?.templateId,
    document?.type || 'ponuda'
  );
  
  const { data: articlesData } = useArticles({ pageSize: 1000 });
  const { data: headerSettings } = useDocumentHeaderSettings();
  const { data: footerSettings } = useDocumentFooterSettings();
  const { data: ponudaLayoutSettings } = usePonudaLayoutSettings();
  const saveLayoutSettings = useSavePonudaLayoutSettings();
  const copyDocument = useCopyDocument();
  const updateStatus = useUpdateDocumentStatus();
  const convertDocument = useConvertDocument();
  const deleteDocument = useDeleteDocument();
  const { data: documentChain, isLoading: isLoadingChain } = useDocumentChain(document?.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const [isWysiwygEditing, setIsWysiwygEditing] = useState(false);
  const [draftMpYMm, setDraftMpYMm] = useState(0);
  const didInitMpYMm = useRef(false);
  
  // Initialize draft from saved settings once per document load (avoid overwriting user edits)
  useEffect(() => {
    didInitMpYMm.current = false;
  }, [document?.id]);

  useEffect(() => {
    if (!ponudaLayoutSettings) return;
    if (didInitMpYMm.current) return;

    setDraftMpYMm(ponudaLayoutSettings.mp.yMm);
    didInitMpYMm.current = true;
  }, [ponudaLayoutSettings]);
  
  // Use draft for both preview and PDF to ensure consistency
  const mpYMm = draftMpYMm;
  
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
  // Visible statuses for the dropdown - excludes 'rejected' and 'pending'
  const allStatuses: DocumentStatus[] = ['draft', 'sent', 'accepted', 'completed', 'cancelled'];

  const handleDeleteDocument = async () => {
    if (!document) return;
    try {
      await deleteDocument.mutateAsync({ id: document.id, number: document.number });
      navigate('/documents');
    } catch (error) {
      // Error toast is handled in hook
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleStatusChange = (newStatus: DocumentStatus) => {
    if (!document) return;
    updateStatus.mutate({
      id: document.id,
      status: newStatus,
      number: document.number,
    });
  };
  const isContract = document?.type === 'ugovor';
  const isMosquitoNetQuote = document?.type === 'ponuda-komarnici';
  
  // Document types that should NOT show prices (otpremnica, nalog-dostava-montaza)
  const hasPrices = document?.type ? ['ponuda', 'racun', 'ugovor', 'ponuda-komarnici'].includes(document.type) : true;

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

  // Handle PDF generation and download
  const handleSavePdf = async () => {
    if (!document || isPdfGenerating) return;
    
    setIsPdfGenerating(true);
    try {
      // Use draftMpYMm directly - it's always in sync with saved settings or current edits
      await generateAndDownloadPdf(document, template, companySettings, enrichedItems, draftMpYMm);
      toast.success('PDF uspješno spremljen');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Greška pri generiranju PDF-a');
    } finally {
      setIsPdfGenerating(false);
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
            {/* Template debug indicator - admin only */}
            <TemplateDebugIndicator 
              template={template} 
              templateSource={templateSource}
              isLoading={isLoadingTemplate}
              className="mt-1"
            />
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
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-lg"
            onClick={handleSavePdf}
            disabled={isPdfGenerating}
          >
            {isPdfGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isPdfGenerating ? 'Generiram...' : 'Spremi PDF'}
          </Button>
          <Link to={
            isContract 
              ? `/documents/${id}/edit-contract` 
              : isMosquitoNetQuote 
                ? `/ponuda-komarnici/${id}/edit`
                : `/documents/${id}/edit`
          }>
            <Button size="sm" className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Edit className="mr-2 h-4 w-4" />
              Uredi
            </Button>
          </Link>
          <Button 
            variant={isWysiwygEditing ? "default" : "outline"}
            size="sm" 
            className="rounded-lg"
            onClick={() => setIsWysiwygEditing(!isWysiwygEditing)}
          >
            <FileCode className="mr-2 h-4 w-4" />
            {isWysiwygEditing ? 'Zatvori editor' : 'WYSIWYG'}
          </Button>
          {document.type === 'ponuda' && (
            <LayoutEditor
              isEditing={isLayoutEditing}
              onToggleEdit={() => {
                if (!isLayoutEditing) {
                  setDraftMpYMm(ponudaLayoutSettings?.mp.yMm ?? 0);
                }
                setIsLayoutEditing(!isLayoutEditing);
              }}
              documentType={document.type}
              draftMpYMm={draftMpYMm}
              onDraftChange={setDraftMpYMm}
              onSave={() => {
                saveLayoutSettings.mutate({ mp: { yMm: draftMpYMm } });
                setIsLayoutEditing(false);
              }}
              onReset={() => setDraftMpYMm(0)}
              isSaving={saveLayoutSettings.isPending}
            />
          )}
        </div>
      </div>

      {/* WYSIWYG Editor - shown when active */}
      {isWysiwygEditing && (
        <DocumentWysiwygEditor
          document={document}
          companySettings={companySettings}
          onClose={() => setIsWysiwygEditing(false)}
        />
      )}

      {/* Responsive grid: stack on small screens, side-by-side on xl+ */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Document Preview - constrained width with horizontal scroll if needed */}
        <div className="w-full min-w-0 overflow-x-auto">
          {isContract ? (
            <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-visible">
              <ContractDocumentView 
                ref={printRef} 
                document={document} 
              />
            </div>
          ) : isMosquitoNetQuote ? (
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
                <GlobalDocumentHeader settings={headerSettings} />
                <MemorandumHeader />
                <MosquitoNetDocumentView 
                  document={document} 
                  companySettings={companySettings} 
                />
              </div>
              <div className="doc-footer">
                <GlobalDocumentFooter settings={footerSettings} />
              </div>
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
                <GlobalDocumentHeader settings={headerSettings} />
                <MemorandumHeader />
                <DocumentBodyContent
                  document={document}
                  template={template}
                  companySettings={companySettings}
                  enrichedItems={enrichedItems}
                  hasPrices={hasPrices}
                  mpYMm={mpYMm}
                />
              </div>
              <div className="doc-footer">
                <GlobalDocumentFooter settings={footerSettings} />
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

          {/* Document Chain */}
          <DocumentChain 
            chain={documentChain} 
            isLoading={isLoadingChain} 
            currentDocumentId={document.id} 
          />

          {/* Document History */}
          <DocumentHistory documentId={document.id} />

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
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-lg" 
                onClick={handleSavePdf}
                disabled={isPdfGenerating}
              >
                {isPdfGenerating ? (
                  <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-3 h-4 w-4" />
                )}
                {isPdfGenerating ? 'Generiram PDF...' : 'Spremi PDF'}
              </Button>
              <Separator className="my-3" />
              <Button 
                variant="outline" 
                className="w-full justify-start rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-3 h-4 w-4" />
                Obriši dokument
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite obrisati dokument {document.number}? 
              Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
