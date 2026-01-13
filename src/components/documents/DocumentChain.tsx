import { Link } from 'react-router-dom';
import { FileText, ScrollText, Truck, Receipt, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentChain as DocumentChainType, DocumentChainItem } from '@/hooks/useDocumentChain';
import { documentTypeLabels, documentStatusLabels, DocumentType } from '@/types/document';

interface DocumentChainProps {
  chain: DocumentChainType | undefined;
  isLoading: boolean;
  currentDocumentId: string;
}

const typeIcons: Record<DocumentType, React.ElementType> = {
  ponuda: FileText,
  ugovor: ScrollText,
  otpremnica: Truck,
  'nalog-dostava-montaza': Truck,
  racun: Receipt,
  'ponuda-komarnici': FileText,
};

const typeColors: Record<DocumentType, string> = {
  ponuda: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ugovor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  otpremnica: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'nalog-dostava-montaza': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  racun: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'ponuda-komarnici': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
};

function ChainItem({ 
  item, 
  isCurrent 
}: { 
  item: DocumentChainItem; 
  isCurrent: boolean;
}) {
  const Icon = typeIcons[item.type] || FileText;
  
  return (
    <Link 
      to={`/documents/${item.id}`}
      className={cn(
        'block p-3 rounded-lg border transition-colors',
        isCurrent 
          ? 'bg-primary/10 border-primary/30 cursor-default' 
          : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', typeColors[item.type])}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-medium truncate',
            isCurrent ? 'text-primary' : 'text-foreground'
          )}>
            {item.number}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {documentTypeLabels[item.type]}
          </p>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-md font-medium',
          statusColors[item.status]
        )}>
          {documentStatusLabels[item.status as keyof typeof documentStatusLabels]}
        </span>
      </div>
    </Link>
  );
}

export function DocumentChain({ chain, isLoading, currentDocumentId }: DocumentChainProps) {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Lanac dokumenata</h3>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!chain || (!chain.ancestors.length && !chain.descendants.length)) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold text-foreground mb-4">Lanac dokumenata</h3>
        <p className="text-sm text-muted-foreground">
          Ovaj dokument nije povezan s drugim dokumentima.
        </p>
      </div>
    );
  }

  const allItems = [
    ...chain.ancestors,
    ...(chain.current ? [chain.current] : []),
    ...chain.descendants,
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4">Lanac dokumenata</h3>
      <div className="space-y-2">
        {allItems.map((item, index) => (
          <div key={item.id}>
            <ChainItem 
              item={item} 
              isCurrent={item.id === currentDocumentId}
            />
            {index < allItems.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
