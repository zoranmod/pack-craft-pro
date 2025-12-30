import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateHR } from '@/lib/utils';

interface RecentDocumentsProps {
  documents: Document[];
  maxHeight?: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-success/10 text-success',
  pending: 'bg-primary/10 text-primary',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export function RecentDocuments({ documents, maxHeight = "calc(80vh - 280px)" }: RecentDocumentsProps) {
  const recentDocs = documents.slice(0, 20);

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <h3 className="font-semibold text-foreground">Nedavni dokumenti</h3>
        <Link 
          to="/documents" 
          className="text-sm text-primary hover:underline font-medium"
        >
          Prikaži sve
        </Link>
      </div>
      <div className="divide-y divide-border overflow-y-auto flex-1" style={{ maxHeight }}>
        {recentDocs.map((doc) => (
          <Link
            key={doc.id}
            to={`/documents/${doc.id}`}
            className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                {doc.number}
              </p>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {doc.clientName}
              </p>
            </div>
            <span className={cn(
              "ml-4 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0",
              statusStyles[doc.status] || statusStyles.draft
            )}>
              {doc.status === 'draft' && 'Nacrt'}
              {doc.status === 'sent' && 'Poslano'}
              {doc.status === 'pending' && 'Na čekanju'}
              {doc.status === 'accepted' && 'Prihvaćeno'}
              {doc.status === 'completed' && 'Završeno'}
              {doc.status === 'cancelled' && 'Otkazano'}
            </span>
          </Link>
        ))}
        {recentDocs.length === 0 && (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            Nema nedavnih dokumenata
          </div>
        )}
      </div>
    </div>
  );
}
