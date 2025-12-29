import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateHR } from '@/lib/utils';

interface RecentDocumentsProps {
  documents: Document[];
}

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-semibold text-foreground">Nedavni dokumenti</h2>
        <Link 
          to="/documents" 
          className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          Prikaži sve <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {documents.slice(0, 5).map((doc) => (
          <Link
            key={doc.id}
            to={`/documents/${doc.id}`}
            className="flex items-center gap-4 px-6 py-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground truncate">{doc.number}</p>
                <Badge variant="outline" className={cn("text-xs", statusStyles[doc.status])}>
                  {documentStatusLabels[doc.status]}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {documentTypeLabels[doc.type]} • {doc.clientName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium text-foreground">
                {doc.totalAmount.toLocaleString('hr-HR')} €
              </p>
              <p className="text-sm text-muted-foreground">{formatDateHR(doc.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
