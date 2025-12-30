import { cn } from '@/lib/utils';
import { DocumentStatus, documentStatusLabels } from '@/types/document';

interface StatusBadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400',
  sent: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
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
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        style,
        className
      )}
    >
      {label}
    </span>
  );
}
