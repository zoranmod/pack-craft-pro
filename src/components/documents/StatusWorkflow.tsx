import { Document, DocumentStatus, documentStatusLabels, quoteStatusFlow, getNextQuoteStatus } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Send, ThumbsUp, ThumbsDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateDocumentStatus } from '@/hooks/useDocuments';
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
  draft: null,
  sent: <Send className="h-3 w-3" />,
  accepted: <ThumbsUp className="h-3 w-3" />,
  rejected: <ThumbsDown className="h-3 w-3" />,
  pending: null,
  completed: <Check className="h-3 w-3" />,
  cancelled: null,
};

const statusColors: Record<DocumentStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-muted',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StatusWorkflow({ document }: StatusWorkflowProps) {
  const updateStatus = useUpdateDocumentStatus();
  const isQuote = document.type === 'ponuda';
  
  const handleStatusChange = (newStatus: DocumentStatus) => {
    updateStatus.mutate({
      id: document.id,
      status: newStatus,
      number: document.number,
    });
  };

  // For quotes, show the visual workflow
  if (isQuote) {
    const currentIndex = quoteStatusFlow.indexOf(document.status);
    const nextStatus = getNextQuoteStatus(document.status);
    const isRejected = document.status === 'rejected';

    return (
      <div className="space-y-4">
        {/* Visual stepper */}
        <div className="flex items-center justify-between">
          {quoteStatusFlow.map((status, index) => {
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
                    'text-xs mt-1',
                    isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}>
                    {documentStatusLabels[status]}
                  </span>
                </div>
                {index < quoteStatusFlow.length - 1 && (
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

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {document.status === 'draft' && (
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

          {document.status === 'sent' && (
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

          {document.status === 'accepted' && (
            <Badge variant="outline" className={cn('w-full justify-center py-2', statusColors.accepted)}>
              <Check className="h-4 w-4 mr-2" />
              Ponuda je prihvaćena
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // For other document types, show simple status badge
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Status</span>
        <Badge variant="outline" className={cn(statusColors[document.status])}>
          {documentStatusLabels[document.status]}
        </Badge>
      </div>
    </div>
  );
}
