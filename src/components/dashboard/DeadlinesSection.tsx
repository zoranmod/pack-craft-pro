import { FileText, Truck, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardCard } from './DashboardCard';

interface DeadlineItem {
  id: string;
  date: string;
  title: string;
  type: 'ponuda' | 'ugovor' | 'otpremnica' | 'nalog';
}

const mockDeadlines: DeadlineItem[] = [
  { id: '1', date: '2025-01-02', title: 'Isporuka - Marković d.o.o.', type: 'otpremnica' },
  { id: '2', date: '2025-01-05', title: 'Montaža kuhinje - Horvat', type: 'nalog' },
  { id: '3', date: '2025-01-08', title: 'Rok ponude - Petrović', type: 'ponuda' },
  { id: '4', date: '2025-01-10', title: 'Završetak ugovora - ABC d.o.o.', type: 'ugovor' },
];

const typeConfig = {
  ponuda: { icon: FileText, label: 'Ponuda', className: 'bg-primary/10 text-primary' },
  ugovor: { icon: ClipboardList, label: 'Ugovor', className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  otpremnica: { icon: Truck, label: 'Otpremnica', className: 'bg-success/10 text-success' },
  nalog: { icon: ClipboardList, label: 'Nalog', className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
};

export function DeadlinesSection() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
  };

  return (
    <DashboardCard title="Rokovi i isporuke">
      <div className="overflow-y-auto h-full">
        {mockDeadlines.map((item, index) => {
          const config = typeConfig[item.type];
          return (
            <div 
              key={item.id} 
              className={cn(
                "px-5 py-3 flex items-center gap-4 hover:bg-muted/50 transition-colors",
                index < mockDeadlines.length - 1 && "border-b border-border"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground w-12">
                {formatDate(item.date)}
              </div>
              <div className="flex-1 text-sm text-foreground truncate font-medium">
                {item.title}
              </div>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0",
                config.className
              )}>
                {config.label}
              </span>
            </div>
          );
        })}
        {mockDeadlines.length === 0 && (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            Nema nadolazećih rokova
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
