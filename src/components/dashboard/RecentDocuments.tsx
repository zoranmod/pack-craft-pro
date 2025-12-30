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
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export function RecentDocuments({ documents, maxHeight = "calc(80vh - 280px)" }: RecentDocumentsProps) {
  const recentDocs = documents.slice(0, 20);

  return (
    <div className="bg-card rounded-xl shadow-card border border-border flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
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
            className="flex items-center justify-between px-5 py-3.5 hover:bg-accent/50 dark:hover:bg-white/5 transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                {doc.number}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {doc.clientName}
              </p>
            </div>
            <span className={`ml-4 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${statusStyles[doc.status] || statusStyles.draft}`}>
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
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            Nema nedavnih dokumenata
          </div>
        )}
      </div>
    </div>
  );
}
