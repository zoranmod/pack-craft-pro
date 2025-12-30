import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { Document, documentTypeLabels } from '@/types/document';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn, formatDateHR } from '@/lib/utils';

interface RecentDocumentsProps {
  documents: Document[];
  maxHeight?: string;
}

export function RecentDocuments({ documents, maxHeight = "calc(80vh - 280px)" }: RecentDocumentsProps) {
  const recentDocs = documents.slice(0, 20);

  return (
    <div className="bg-card rounded-xl border border-border flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)] shrink-0">
        <h3 className="font-semibold text-foreground text-[15px]">Nedavni dokumenti</h3>
        <Link 
          to="/documents" 
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Prikaži sve
        </Link>
      </div>
      <div className="overflow-y-auto flex-1" style={{ maxHeight }}>
        {recentDocs.map((doc, index) => (
          <Link
            key={doc.id}
            to={`/documents/${doc.id}`}
            className={cn(
              "flex items-center justify-between px-6 py-3.5 hover:bg-[hsl(0_0%_97%)] dark:hover:bg-[hsl(0_0%_13%)] transition-colors group",
              index < recentDocs.length - 1 && "border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)]"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm truncate group-hover:text-primary transition-colors">
                {doc.number}
              </p>
              <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                {doc.clientName}
              </p>
            </div>
            <StatusBadge status={doc.status} className="ml-4 flex-shrink-0" />
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
