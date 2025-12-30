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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  useActivityLogs, 
  formatActivityMessage,
  type ActivityLog 
} from '@/hooks/useActivityLogs';

interface ActivityLogListProps {
  limit?: number;
  showHeader?: boolean;
  maxHeight?: string;
}

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
  create: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  update: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  delete: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  view: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
  approve: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  reject: 'text-red-600 bg-red-100 dark:bg-red-900/30',
};

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const EntityIcon = entityIcons[log.entity_type] || FileText;
  const ActionIcon = actionIcons[log.action_type] || Plus;
  const actionColor = actionColors[log.action_type] || 'text-gray-600 bg-gray-100';

  const message = formatActivityMessage(log);
  const timeAgo = format(new Date(log.created_at), "d. MMM yyyy 'u' HH:mm", { locale: hr });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      <div className={`p-2 rounded-full ${actionColor}`}>
        <ActionIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <EntityIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-medium truncate">{message}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

export function ActivityLogList({ limit = 50, showHeader = true, maxHeight = 'calc(80vh - 280px)' }: ActivityLogListProps) {
  const { data: logs, isLoading } = useActivityLogs(limit);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-card border border-border flex flex-col">
        {showHeader && (
          <div className="px-5 py-3.5 border-b border-border shrink-0">
            <h3 className="font-semibold text-foreground">Aktivnosti</h3>
          </div>
        )}
        <div className="p-5">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasLogs = logs && logs.length > 0;

  return (
    <div className="bg-card rounded-xl shadow-card border border-border flex flex-col">
      {showHeader && (
        <div className="px-5 py-3.5 border-b border-border shrink-0">
          <h3 className="font-semibold text-foreground">Aktivnosti</h3>
        </div>
      )}
      <div className="px-5 flex-1">
        {hasLogs ? (
          <ScrollArea style={{ maxHeight }} className="pr-2">
            {logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nema zabilježenih aktivnosti</p>
          </div>
        )}
      </div>
    </div>
  );
}
