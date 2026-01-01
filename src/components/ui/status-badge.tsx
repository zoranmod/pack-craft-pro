import { cn } from '@/lib/utils';
import { DocumentStatus, documentStatusLabels } from '@/types/document';

interface StatusBadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

// Stripe-like soft muted status colors
const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
  pending: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  cancelled: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  draft: 'U pripremi',
  sent: 'Poslano',
  accepted: 'Prihvaćeno',
  rejected: 'Odbijeno',
  pending: 'Na čekanju',
  completed: 'Završeno',
  cancelled: 'Otkazano',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || statusStyles.draft;
  const label = documentStatusLabels[status as DocumentStatus] || statusLabels[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-transparent',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
