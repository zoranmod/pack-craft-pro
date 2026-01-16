import { Document, DocumentStatus, DocumentType, documentStatusLabels, getStatusFlowForType, getNextQuoteStatus, getConversionTargets, documentTypeLabels } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Send, ThumbsUp, ThumbsDown, ChevronRight, Clock, Package, FileText, Receipt, ArrowRight, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateDocumentStatus, useConvertDocument } from '@/hooks/useDocuments';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StatusWorkflowProps {
  document: Document;
}

const statusIcons: Record<DocumentStatus, React.ReactNode> = {
  draft: <FileText className="h-3 w-3" />,
  sent: <Send className="h-3 w-3" />,
  accepted: <ThumbsUp className="h-3 w-3" />,
  rejected: <ThumbsDown className="h-3 w-3" />,
  completed: <Check className="h-3 w-3" />,
  cancelled: null,
};

const statusColors: Record<DocumentStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-muted',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const conversionIcons: Record<DocumentType, React.ReactNode> = {
  ponuda: <FileText className="h-4 w-4" />,
  ugovor: <FileCheck className="h-4 w-4" />,
  otpremnica: <Package className="h-4 w-4" />,
  racun: <Receipt className="h-4 w-4" />,
  'nalog-dostava-montaza': <Package className="h-4 w-4" />,
  'ponuda-komarnici': <FileText className="h-4 w-4" />,
  'reklamacija': <FileText className="h-4 w-4" />,
};

export function StatusWorkflow({ document }: StatusWorkflowProps) {
  const navigate = useNavigate();
  const updateStatus = useUpdateDocumentStatus();
  const convertDocument = useConvertDocument();
  const statusFlow = getStatusFlowForType(document.type);
  const conversionTargets = getConversionTargets(document.type, document.status);
  
  const handleStatusChange = (newStatus: DocumentStatus) => {
    updateStatus.mutate({
      id: document.id,
      status: newStatus,
      number: document.number,
    });
  };

  const handleConvert = async (targetType: DocumentType) => {
    const newDoc = await convertDocument.mutateAsync({
      sourceDocument: document,
      targetType,
    });
    if (newDoc?.id) {
      navigate(`/documents/${newDoc.id}`);
    }
  };

  const currentIndex = statusFlow.indexOf(document.status);
  const isRejected = document.status === 'rejected';
  const isCancelled = document.status === 'cancelled';

  // Get next status based on document type and current status
  const getNextStatus = (): DocumentStatus | null => {
    if (isRejected || isCancelled) return null;
    const nextIndex = currentIndex + 1;
    if (nextIndex >= statusFlow.length) return null;
    return statusFlow[nextIndex];
  };

  const nextStatus = getNextStatus();

  // Get status action label
  const getStatusActionLabel = (status: DocumentStatus): string => {
    const labels: Record<DocumentStatus, string> = {
      draft: 'Označi kao u pripremi',
      sent: 'Označi kao poslano',
      accepted: 'Označi kao prihvaćeno',
      rejected: 'Označi kao odbijeno',
      completed: 'Označi kao završeno',
      cancelled: 'Otkaži',
    };
    return labels[status];
  };

  return (
    <div className="space-y-4">
      {/* Visual stepper */}
      <div className="flex items-center justify-between">
        {statusFlow.map((status, index) => {
          const isCompleted = currentIndex >= index || (isRejected && index === 0);
          const isCurrent = document.status === status;
          
          return (
            <div key={status} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all',
                    isCompleted || isCurrent
                      ? statusColors[status]
                      : 'bg-muted/50 text-muted-foreground border-muted'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    statusIcons[status] || (index + 1)
                  )}
                </div>
                <span className={cn(
                  'text-xs mt-1 text-center max-w-[60px]',
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}>
                  {documentStatusLabels[status]}
                </span>
              </div>
              {index < statusFlow.length - 1 && (
                <ChevronRight className={cn(
                  'h-4 w-4 mx-1',
                  currentIndex > index ? 'text-primary' : 'text-muted-foreground/30'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Rejected status indicator */}
      {isRejected && (
        <Badge variant="outline" className={cn('w-full justify-center', statusColors.rejected)}>
          <ThumbsDown className="h-3 w-3 mr-1" />
          {documentStatusLabels.rejected}
        </Badge>
      )}

      {/* Cancelled status indicator */}
      {isCancelled && (
        <Badge variant="outline" className={cn('w-full justify-center', statusColors.cancelled)}>
          {documentStatusLabels.cancelled}
        </Badge>
      )}

      {/* Action buttons based on document type */}
      <div className="space-y-2 pt-2">
        {/* Quote (Ponuda) specific actions */}
        {document.type === 'ponuda' && document.status === 'draft' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Označi kao poslano
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Označiti ponudu kao poslanu?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ova akcija će promijeniti status ponude u "Poslano".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Odustani</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusChange('sent')}>
                  Potvrdi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {document.type === 'ponuda' && document.status === 'sent' && (
          <div className="grid grid-cols-2 gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Prihvaćeno
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ponuda prihvaćena?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će promijeniti status ponude u "Prihvaćeno".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleStatusChange('accepted')}>
                    Potvrdi
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" size="sm">
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Odbijeno
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ponuda odbijena?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će promijeniti status ponude u "Odbijeno".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleStatusChange('rejected')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Potvrdi
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Contract (Ugovor) specific actions */}
        {document.type === 'ugovor' && document.status === 'draft' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Označi kao poslano
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Označiti ugovor kao poslan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ova akcija će promijeniti status ugovora u "Poslano".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Odustani</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusChange('sent')}>
                  Potvrdi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {document.type === 'ugovor' && document.status === 'sent' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="sm">
                <ThumbsUp className="mr-2 h-4 w-4" />
                Označi kao potpisan
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ugovor potpisan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ova akcija će promijeniti status ugovora u "Prihvaćeno/Potpisan".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Odustani</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusChange('accepted')}>
                  Potvrdi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delivery (Otpremnica/Nalog) specific actions */}
        {(document.type === 'otpremnica' || document.type === 'nalog-dostava-montaza') && document.status === 'draft' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Check className="mr-2 h-4 w-4" />
                Označi kao završeno
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Označiti kao završeno?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ova akcija će promijeniti status u "Završeno/Isporučeno".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Odustani</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusChange('completed')}>
                  Potvrdi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Invoice (Račun) specific actions */}
        {document.type === 'racun' && document.status === 'draft' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Označi kao poslano
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Označiti račun kao poslan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ova akcija će promijeniti status računa u "Poslano".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Odustani</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusChange('sent')}>
                  Potvrdi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {document.type === 'racun' && document.status === 'sent' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full" size="sm">
                <Check className="mr-2 h-4 w-4" />
                Plaćeno
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Račun plaćen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ova akcija će promijeniti status računa u "Završeno/Plaćeno".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Odustani</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleStatusChange('completed')}>
                  Potvrdi
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Completed/Accepted states */}
        {document.status === 'accepted' && document.type === 'ponuda' && (
          <Badge variant="outline" className={cn('w-full justify-center py-2', statusColors.accepted)}>
            <Check className="h-4 w-4 mr-2" />
            Ponuda je prihvaćena
          </Badge>
        )}

        {document.status === 'accepted' && document.type === 'ugovor' && (
          <Badge variant="outline" className={cn('w-full justify-center py-2', statusColors.accepted)}>
            <Check className="h-4 w-4 mr-2" />
            Ugovor je potpisan
          </Badge>
        )}

        {document.status === 'completed' && (
          <Badge variant="outline" className={cn('w-full justify-center py-2', statusColors.completed)}>
            <Check className="h-4 w-4 mr-2" />
            {document.type === 'racun' ? 'Račun je plaćen' : 'Isporučeno'}
          </Badge>
        )}
      </div>

      {/* Document conversion section */}
      {conversionTargets.length > 0 && (
        <div className="pt-3 mt-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Kreiraj sljedeći dokument:</p>
          {conversionTargets.map((targetType) => (
            <AlertDialog key={targetType}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  size="sm"
                  disabled={convertDocument.isPending}
                >
                  {conversionIcons[targetType]}
                  <span className="ml-2">Kreiraj {documentTypeLabels[targetType].toLowerCase()}</span>
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Kreirati {documentTypeLabels[targetType].toLowerCase()}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Novi dokument će biti kreiran s podacima iz ovog dokumenta ({document.number}).
                    Možete ga naknadno urediti.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleConvert(targetType)}>
                    Kreiraj {documentTypeLabels[targetType].toLowerCase()}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ))}
        </div>
      )}
    </div>
  );
}