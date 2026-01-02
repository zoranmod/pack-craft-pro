import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, MoreHorizontal, Eye, Edit, Trash2, Download, ArrowRight, Copy, Loader2 } from 'lucide-react';
import { Document, DocumentType, documentTypeLabels, getNextDocumentType, getNextDocumentLabel } from '@/types/document';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { cn, formatDateHR } from '@/lib/utils';
import { useConvertDocument, useCopyDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { toast } from 'sonner';
import { getDocumentTypeStyle } from '@/lib/documentTypeStyles';
import { generateAndDownloadPdf } from '@/lib/pdfGenerator';
import { useCompanySettings } from '@/hooks/useSettings';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface DocumentListProps {
  documents: Document[];
  filter?: DocumentType | 'all';
}

export function DocumentList({ documents, filter = 'all' }: DocumentListProps) {
  const navigate = useNavigate();
  const convertDocument = useConvertDocument();
  const copyDocument = useCopyDocument();
  const deleteDocument = useDeleteDocument();
  const { data: companySettings } = useCompanySettings();
  const { data: templates } = useDocumentTemplates();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);
  
  const filteredDocs = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filter);

  // Handle PDF generation for a specific document
  const handleSavePdf = async (doc: Document) => {
    if (pdfGeneratingId) return;
    
    setPdfGeneratingId(doc.id);
    try {
      const template = templates?.find(t => t.id === doc.templateId);
      await generateAndDownloadPdf(doc, template, companySettings);
      toast.success('PDF uspješno spremljen');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Greška pri generiranju PDF-a');
    } finally {
      setPdfGeneratingId(null);
    }
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument.mutateAsync({ id: documentToDelete.id, number: documentToDelete.number });
      toast.success(`Dokument ${documentToDelete.number} je obrisan.`);
    } catch (error) {
      // Error toast is handled in hook
    } finally {
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleConvert = async (doc: Document) => {
    const nextType = getNextDocumentType(doc.type);
    if (!nextType) return;
    
    const result = await convertDocument.mutateAsync({
      sourceDocument: doc,
      targetType: nextType,
    });
    
    if (result?.id) {
      navigate(`/documents/${result.id}`);
    }
  };

  const handleCopy = async (doc: Document) => {
    const result = await copyDocument.mutateAsync(doc);
    if (result?.id) {
      navigate(`/documents/${result.id}`);
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Dokument
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Klijent
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Iznos
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredDocs.map((doc, index) => {
              const typeStyle = getDocumentTypeStyle(doc.type);
              const TypeIcon = typeStyle.icon;
              return (
                <tr 
                  key={doc.id} 
                  className={cn(
                    "hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors duration-150 animate-fade-in cursor-pointer group/row border-l-4",
                    typeStyle.borderColor
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <Link to={`/documents/${doc.id}`} className="flex items-center gap-3 group">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        typeStyle.iconBg
                      )}>
                        <TypeIcon className={cn("h-5 w-5", typeStyle.iconFg)} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors duration-150">
                          {doc.number}
                        </p>
                        <p className={cn("text-sm font-medium", typeStyle.badgeFg)}>
                          {documentTypeLabels[doc.type]}
                        </p>
                      </div>
                    </Link>
                  </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{doc.clientName}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {doc.clientAddress}
                  </p>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {formatDateHR(doc.date)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={doc.status} />
                </td>
                <td className="px-6 py-4 text-right font-medium text-foreground">
                  {doc.totalAmount.toLocaleString('hr-HR')} €
                </td>
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Opcije dokumenta">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/documents/${doc.id}`}>
                          <Eye className="mr-2 h-4 w-4" /> Pregledaj
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/documents/${doc.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Uredi
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSavePdf(doc)}
                        disabled={pdfGeneratingId === doc.id}
                      >
                        {pdfGeneratingId === doc.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        {pdfGeneratingId === doc.id ? 'Generiram...' : 'Spremi PDF'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleCopy(doc)}
                        disabled={copyDocument.isPending}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Kopiraj dokument
                      </DropdownMenuItem>
                      {getNextDocumentType(doc.type) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleConvert(doc)}
                            disabled={convertDocument.isPending}
                            className="text-primary"
                          >
                            <ArrowRight className="mr-2 h-4 w-4" /> 
                            {getNextDocumentLabel(doc.type)}
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(doc)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Obriši
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {filteredDocs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-foreground">Nema dokumenata</p>
          <p className="text-sm text-muted-foreground">Kreirajte prvi dokument klikom na jednu od brzih akcija</p>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati dokument?</AlertDialogTitle>
            <AlertDialogDescription>
              Jeste li sigurni da želite obrisati dokument {documentToDelete?.number}? 
              Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
