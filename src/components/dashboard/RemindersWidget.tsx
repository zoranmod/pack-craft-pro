import { Link } from 'react-router-dom';
import { Bell, Clock, AlertTriangle, X, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow, parseISO, isBefore, isToday, startOfDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import { cn, formatDateHR } from '@/lib/utils';
import { useUpcomingReminders, useOverdueReminders, useDismissReminder, Reminder } from '@/hooks/useReminders';
import { documentTypeLabels } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function ReminderItem({ 
  reminder, 
  isOverdue,
  onDismiss 
}: { 
  reminder: Reminder; 
  isOverdue: boolean;
  onDismiss: (id: string) => void;
}) {
  const dueDate = parseISO(reminder.dueDate);
  const isDueToday = isToday(dueDate);

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
      isOverdue 
        ? 'bg-destructive/5 border-destructive/20' 
        : isDueToday 
          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
          : 'bg-card border-border hover:bg-accent/50'
    )}>
      <div className={cn(
        'p-2 rounded-full',
        isOverdue 
          ? 'bg-destructive/10 text-destructive' 
          : isDueToday
            ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
            : 'bg-primary/10 text-primary'
      )}>
        {isOverdue ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {reminder.title}
            </p>
            {reminder.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {reminder.description}
              </p>
            )}
          </div>
          <button 
            onClick={() => onDismiss(reminder.id)}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant={isOverdue ? 'destructive' : isDueToday ? 'secondary' : 'outline'} className="text-xs">
            {isOverdue 
              ? `Isteklo ${formatDistanceToNow(dueDate, { locale: hr, addSuffix: true })}`
              : isDueToday 
                ? 'Danas'
                : formatDateHR(reminder.dueDate)
            }
          </Badge>
          
          {reminder.documentId && reminder.documentNumber && (
            <Link 
              to={`/documents/${reminder.documentId}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <FileText className="h-3 w-3" />
              {reminder.documentNumber}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function RemindersWidget() {
  const { data: upcomingReminders, isLoading: isLoadingUpcoming } = useUpcomingReminders(14);
  const { data: overdueReminders, isLoading: isLoadingOverdue } = useOverdueReminders();
  const dismissReminder = useDismissReminder();

  const isLoading = isLoadingUpcoming || isLoadingOverdue;
  const hasOverdue = (overdueReminders?.length || 0) > 0;
  const hasUpcoming = (upcomingReminders?.length || 0) > 0;
  const isEmpty = !hasOverdue && !hasUpcoming;

  const handleDismiss = (id: string) => {
    dismissReminder.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Podsjetnici</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Podsjetnici</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nema aktivnih podsjetnika
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Podsjetnici</h3>
        {hasOverdue && (
          <Badge variant="destructive" className="ml-auto">
            {overdueReminders?.length} isteklo
          </Badge>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {/* Overdue reminders first */}
        {overdueReminders?.map(reminder => (
          <ReminderItem 
            key={reminder.id} 
            reminder={reminder} 
            isOverdue={true}
            onDismiss={handleDismiss}
          />
        ))}
        
        {/* Upcoming reminders */}
        {upcomingReminders?.map(reminder => (
          <ReminderItem 
            key={reminder.id} 
            reminder={reminder} 
            isOverdue={false}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </div>
  );
}
