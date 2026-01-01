import { Link } from 'react-router-dom';
import { Document } from '@/types/document';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { DashboardCard } from './DashboardCard';

interface RecentDocumentsProps {
  documents: Document[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  const recentDocs = documents.slice(0, 20);

  return (
    <DashboardCard 
      title="Nedavni dokumenti" 
      actionLabel="Prikaži sve"
      actionHref="/documents"
    >
      <div className="overflow-y-auto h-full">
        {recentDocs.map((doc, index) => (
          <Link
            key={doc.id}
            to={`/documents/${doc.id}`}
            className={cn(
              "flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors group",
              index < recentDocs.length - 1 && "border-b border-border"
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {doc.number}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {doc.clientName}
              </p>
            </div>
            <StatusBadge status={doc.status} className="ml-3 flex-shrink-0" />
          </Link>
        ))}
        {recentDocs.length === 0 && (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            Nema nedavnih dokumenata
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
