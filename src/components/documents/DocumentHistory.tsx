import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { History, Plus, Pencil, Trash2, Eye, Check, X, Loader2, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ActivityLogEntry {
  id: string;
  action_type: string;
  entity_type: string;
  entity_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface DocumentHistoryProps {
  documentId: string;
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash2,
  view: Eye,
  approve: Check,
  reject: X,
};

const actionColors: Record<string, string> = {
  create: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  update: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
  view: 'text-muted-foreground bg-muted',
  approve: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400',
  reject: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400',
};

const actionLabels: Record<string, string> = {
  create: 'kreirao/la dokument',
  update: 'uredio/la dokument',
  delete: 'obrisao/la dokument',
  view: 'pregledao/la dokument',
  approve: 'odobrio/la dokument',
  reject: 'odbio/la dokument',
};

function useDocumentHistory(documentId: string) {
  return useQuery({
    queryKey: ['document-history', documentId],
    queryFn: async (): Promise<ActivityLogEntry[]> => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action_type,
          entity_type,
          entity_name,
          details,
          created_at,
          employee:employees(first_name, last_name)
        `)
        .eq('entity_type', 'document')
        .eq('entity_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ActivityLogEntry[];
    },
    enabled: !!documentId,
    staleTime: 30000,
  });
}

function HistoryItem({ entry }: { entry: ActivityLogEntry }) {
  const ActionIcon = actionIcons[entry.action_type] || Pencil;
  const actionColor = actionColors[entry.action_type] || 'text-muted-foreground bg-muted';
  const actionLabel = actionLabels[entry.action_type] || entry.action_type;
  
  const actorName = entry.employee 
    ? `${entry.employee.first_name} ${entry.employee.last_name}`
    : 'Korisnik';

  const timeFormatted = format(new Date(entry.created_at), "d. MMM yyyy 'u' HH:mm", { locale: hr });

  // Extract changed fields from details if available
  const changedFields = entry.details && typeof entry.details === 'object' 
    ? Object.keys(entry.details).filter(k => k !== 'document_type')
    : [];

  return (
    <div className="flex gap-3 pb-4 last:pb-0">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={cn('p-2 rounded-full', actionColor)}>
          <ActionIcon className="h-4 w-4" />
        </div>
        <div className="w-0.5 flex-1 bg-border mt-2" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 pb-4 border-b border-border last:border-b-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-foreground">
            <span className="font-semibold">{actorName}</span>{' '}
            <span className="text-muted-foreground">{actionLabel}</span>
          </p>
          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {timeFormatted}
          </span>
        </div>
        
        {/* Changed fields */}
        {changedFields.length > 0 && entry.action_type === 'update' && (
          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
            <p className="font-medium mb-1">Promijenjeno:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {changedFields.map((field) => (
                <li key={field}>{formatFieldName(field)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to format field names to Croatian
function formatFieldName(field: string): string {
  const fieldLabels: Record<string, string> = {
    status: 'Status',
    client_name: 'Naziv klijenta',
    client_address: 'Adresa klijenta',
    total_amount: 'Ukupan iznos',
    notes: 'Napomene',
    delivery_address: 'Adresa dostave',
    payment_method: 'Način plaćanja',
    validity_days: 'Rok valjanosti',
    delivery_days: 'Rok isporuke',
    prepared_by: 'Izradio',
    monter1: 'Monter 1',
    monter2: 'Monter 2',
    items: 'Stavke',
  };
  
  return fieldLabels[field] || field;
}

export function DocumentHistory({ documentId }: DocumentHistoryProps) {
  const { data: history, isLoading, error } = useDocumentHistory(documentId);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Povijest dokumenta</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Povijest dokumenta</h3>
        </div>
        <p className="text-sm text-destructive">Greška pri učitavanju povijesti</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Povijest dokumenta</h3>
        </div>
        <p className="text-sm text-muted-foreground">Nema zabilježenih promjena</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Povijest dokumenta</h3>
        <span className="text-xs text-muted-foreground">({history.length})</span>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto pr-2">
        {history.map((entry) => (
          <HistoryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
