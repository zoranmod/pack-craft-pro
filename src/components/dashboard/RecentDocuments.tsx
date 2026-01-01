import { Link } from 'react-router-dom';
import { Document, documentTypeLabels } from '@/types/document';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import { DashboardCard } from './DashboardCard';
import { getDocumentTypeStyle } from '@/lib/documentTypeStyles';

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
        {recentDocs.map((doc, index) => {
          const typeStyle = getDocumentTypeStyle(doc.type);
          const TypeIcon = typeStyle.icon;
          
          return (
            <Link
              key={doc.id}
              to={`/documents/${doc.id}`}
              className={cn(
                "flex items-center gap-3 px-5 py-3 hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors duration-150 group border-l-4",
                typeStyle.borderColor,
                index < recentDocs.length - 1 && "border-b border-border"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg shrink-0",
                typeStyle.iconBg
              )}>
                <TypeIcon className={cn("h-4 w-4", typeStyle.iconFg)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors duration-150">
                  {doc.number}
                </p>
                <p className={cn("text-xs font-medium truncate mt-0.5", typeStyle.badgeFg)}>
                  {documentTypeLabels[doc.type]} • {doc.clientName}
                </p>
              </div>
              <StatusBadge status={doc.status} className="ml-3 flex-shrink-0" />
            </Link>
          );
        })}
        {recentDocs.length === 0 && (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            Nema nedavnih dokumenata
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
