import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Truck, ClipboardList, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardCard } from './DashboardCard';
import { Document, DocumentType } from '@/types/document';

interface DeadlinesSectionProps {
  documents?: Document[];
}

const typeConfig: Record<string, { icon: typeof FileText; label: string; className: string }> = {
  ponuda: { icon: FileText, label: 'Ponuda', className: 'bg-primary/10 text-primary' },
  ugovor: { icon: ClipboardList, label: 'Ugovor', className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  otpremnica: { icon: Truck, label: 'Otpremnica', className: 'bg-success/10 text-success' },
  'nalog-dostava-montaza': { icon: ClipboardList, label: 'Nalog', className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  racun: { icon: FileText, label: 'Račun', className: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
};

export function DeadlinesSection({ documents = [] }: DeadlinesSectionProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
  };

  // Get documents with delivery_days that have upcoming deadlines
  const deadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return documents
      .filter(doc => {
        // Only include documents that are not completed/cancelled
        if (['completed', 'cancelled'].includes(doc.status)) return false;
        
        // Calculate deadline based on document date + delivery days
        if (doc.deliveryDays && doc.date) {
          const docDate = new Date(doc.date);
          const deadline = new Date(docDate);
          deadline.setDate(deadline.getDate() + doc.deliveryDays);
          return deadline >= today;
        }
        
        // Or documents with validity days for ponude
        if (doc.validityDays && doc.date && doc.type === 'ponuda') {
          const docDate = new Date(doc.date);
          const deadline = new Date(docDate);
          deadline.setDate(deadline.getDate() + doc.validityDays);
          return deadline >= today;
        }
        
        return false;
      })
      .map(doc => {
        const docDate = new Date(doc.date);
        let deadline = new Date(docDate);
        let title = '';
        
        if (doc.type === 'ponuda' && doc.validityDays) {
          deadline.setDate(deadline.getDate() + doc.validityDays);
          title = `Rok ponude - ${doc.clientName}`;
        } else if (doc.deliveryDays) {
          deadline.setDate(deadline.getDate() + doc.deliveryDays);
          title = `Isporuka - ${doc.clientName}`;
        }
        
        return {
          id: doc.id,
          date: deadline.toISOString().split('T')[0],
          title,
          type: doc.type,
          number: doc.number
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 8);
  }, [documents]);

  return (
    <DashboardCard title="Rokovi i isporuke">
      <div className="overflow-y-auto h-full">
        {deadlines.length > 0 ? (
          deadlines.map((item, index) => {
            const config = typeConfig[item.type] || typeConfig.ponuda;
            return (
              <Link 
                key={item.id} 
                to={`/documents/${item.id}`}
                className={cn(
                  "px-5 py-3 flex items-center gap-4 hover:bg-muted/50 transition-colors block",
                  index < deadlines.length - 1 && "border-b border-border"
                )}
              >
                <div className="text-xs font-medium text-muted-foreground w-12">
                  {formatDate(item.date)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate font-medium">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.number}
                  </div>
                </div>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0",
                  config.className
                )}>
                  {config.label}
                </span>
              </Link>
            );
          })
        ) : (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
            <Calendar className="h-8 w-8 text-muted-foreground/50" />
            Nema nadolazećih rokova
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
