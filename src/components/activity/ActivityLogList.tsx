import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { 
  FileText, 
  Users, 
  Package, 
  UserPlus, 
  Calendar, 
  Stethoscope,
  Shirt,
  Settings,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Check,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { 
  useActivityLogs, 
  formatActivityMessage,
  type ActivityLog 
} from '@/hooks/useActivityLogs';
import { cn } from '@/lib/utils';
import { documentTypeStyles } from '@/lib/documentTypeStyles';
import { DocumentType } from '@/types/document';

interface ActivityLogListProps {
  limit?: number;
}

// Default entity icons (for non-document entities)
const entityIcons: Record<string, typeof FileText> = {
  document: FileText,
  client: Users,
  article: Package,
  employee: UserPlus,
  leave_request: Calendar,
  sick_leave: Stethoscope,
  work_clothing: Shirt,
  settings: Settings,
};

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  view: Eye,
  approve: Check,
  reject: X,
};

const actionColors: Record<string, string> = {
  create: 'text-success bg-success/10',
  update: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  delete: 'text-destructive bg-destructive/10',
  view: 'text-muted-foreground bg-muted',
  approve: 'text-success bg-success/10',
  reject: 'text-destructive bg-destructive/10',
};

// Map document type from activity log details to DocumentType
function getDocumentTypeFromDetails(details: Record<string, unknown> | null): DocumentType | null {
  if (!details) return null;
  const docType = details.document_type as string | undefined;
  if (docType && docType in documentTypeStyles) {
    return docType as DocumentType;
  }
  return null;
}

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const ActionIcon = actionIcons[log.action_type] || Plus;
  const actionColor = actionColors[log.action_type] || 'text-muted-foreground bg-muted';
  
  // Check if this is a document-related activity and get specific styling
  const documentType = log.entity_type === 'document' 
    ? getDocumentTypeFromDetails(log.details as Record<string, unknown> | null) 
    : null;
  
  // Get appropriate entity icon and colors
  let EntityIcon = entityIcons[log.entity_type] || FileText;
  let entityIconBg = 'bg-muted';
  let entityIconFg = 'text-muted-foreground';
  let borderColor = '';
  
  if (documentType) {
    const typeStyle = documentTypeStyles[documentType];
    EntityIcon = typeStyle.icon;
    entityIconBg = typeStyle.iconBg;
    entityIconFg = typeStyle.iconFg;
    borderColor = typeStyle.borderColor;
  }

  const message = formatActivityMessage(log);
  const timeAgo = format(new Date(log.created_at), "d. MMM yyyy 'u' HH:mm", { locale: hr });

  return (
    <div className={cn(
      "flex items-start gap-3 px-5 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors duration-150",
      borderColor && `border-l-4 ${borderColor}`
    )}>
      <div className={`p-1.5 rounded-md ${actionColor} shrink-0`}>
        <ActionIcon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded", entityIconBg)}>
            <EntityIcon className={cn("h-3 w-3", entityIconFg)} />
          </div>
          <p className="text-sm font-medium truncate text-foreground">{message}</p>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export function ActivityLogList({ limit = 50 }: ActivityLogListProps) {
  const { data: logs, isLoading } = useActivityLogs(limit);

  if (isLoading) {
    return (
      <DashboardCard title="Aktivnosti">
        <div className="p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-7 w-7 rounded-md shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-3/4 mb-1.5" />
                <Skeleton className="h-2.5 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    );
  }

  const hasLogs = logs && logs.length > 0;

  return (
    <DashboardCard title="Aktivnosti">
      <div className="overflow-y-auto h-full">
        {hasLogs ? (
          logs.map((log) => (
            <ActivityLogItem key={log.id} log={log} />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nema zabilježenih aktivnosti</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
