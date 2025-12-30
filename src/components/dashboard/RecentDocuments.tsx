import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateHR } from '@/lib/utils';

interface RecentDocumentsProps {
  documents: Document[];
}

const statusStyles: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600 border-gray-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  accepted: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  const recentDocs = documents.slice(0, 5);

  return (
    <div className="bg-card rounded-md shadow-card border border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Nedavni dokumenti</h2>
        <Link 
          to="/documents" 
          className="text-xs text-primary hover:underline"
        >
          Prikaži sve
        </Link>
      </div>
      <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
        {recentDocs.map((doc) => (
          <Link
            key={doc.id}
            to={`/documents/${doc.id}`}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{doc.number}</span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", statusStyles[doc.status] || statusStyles.default)}>
                    {documentStatusLabels[doc.status] || doc.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {documentTypeLabels[doc.type]} • {doc.clientName}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-sm font-medium text-foreground">
                {doc.totalAmount.toLocaleString('hr-HR')} €
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDateHR(doc.date)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
