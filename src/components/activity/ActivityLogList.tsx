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
  create: 'text-success bg-success/10',
  update: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  delete: 'text-destructive bg-destructive/10',
  view: 'text-muted-foreground bg-muted',
  approve: 'text-success bg-success/10',
  reject: 'text-destructive bg-destructive/10',
};

function ActivityLogItem({ log }: { log: ActivityLog }) {
  const EntityIcon = entityIcons[log.entity_type] || FileText;
  const ActionIcon = actionIcons[log.action_type] || Plus;
  const actionColor = actionColors[log.action_type] || 'text-muted-foreground bg-muted';

  const message = formatActivityMessage(log);
  const timeAgo = format(new Date(log.created_at), "d. MMM yyyy 'u' HH:mm", { locale: hr });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)] last:border-b-0 hover:bg-[hsl(0_0%_97%)] dark:hover:bg-[hsl(0_0%_13%)] transition-colors -mx-5 px-5">
      <div className={`p-1.5 rounded-md ${actionColor}`}>
        <ActionIcon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-center gap-2">
          <EntityIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <p className="text-[13px] font-medium truncate text-foreground">{message}</p>
        </div>
        <p className="text-[11px] text-[hsl(220_9%_46%)] mt-1">
          {timeAgo}
        </p>
      </div>
    </div>
  );
}

export function ActivityLogList({ limit = 50, showHeader = true, maxHeight = 'calc(80vh - 280px)' }: ActivityLogListProps) {
  const { data: logs, isLoading } = useActivityLogs(limit);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {showHeader && (
          <div className="px-6 py-4 border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)] shrink-0">
            <h3 className="font-semibold text-foreground text-[15px]">Aktivnosti</h3>
          </div>
        )}
        <div className="p-5">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-7 w-7 rounded-md" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-3/4 mb-1.5" />
                  <Skeleton className="h-2.5 w-1/4" />
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
    <div className="bg-card rounded-xl border border-border flex flex-col shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      {showHeader && (
        <div className="px-6 py-4 border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)] shrink-0">
          <h3 className="font-semibold text-foreground text-[15px]">Aktivnosti</h3>
        </div>
      )}
      <div className="px-5 py-2 flex-1">
        {hasLogs ? (
          <ScrollArea style={{ maxHeight }} className="pr-2">
            {logs.map((log) => (
              <ActivityLogItem key={log.id} log={log} />
            ))}
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nema zabilježenih aktivnosti</p>
          </div>
        )}
      </div>
    </div>
  );
}
