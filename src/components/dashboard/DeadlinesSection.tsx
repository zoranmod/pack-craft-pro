import { Calendar, FileText, Truck, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  nalog: { icon: Calendar, label: 'Nalog', className: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
};

export function DeadlinesSection() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.06)] h-full">
      <div className="px-6 py-4 border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)]">
        <h3 className="font-semibold text-foreground text-[15px]">Rokovi i isporuke</h3>
      </div>
      <div>
        {mockDeadlines.map((item, index) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <div 
              key={item.id} 
              className={cn(
                "px-6 py-3.5 flex items-center gap-4 hover:bg-[hsl(0_0%_97%)] dark:hover:bg-[hsl(0_0%_13%)] transition-colors",
                index < mockDeadlines.length - 1 && "border-b border-[hsl(220_13%_91%)] dark:border-[hsl(0_0%_20%)]"
              )}
            >
              <div className="text-[13px] font-medium text-muted-foreground w-14">
                {formatDate(item.date)}
              </div>
              <div className="flex-1 text-[13px] text-foreground truncate font-medium">
                {item.title}
              </div>
              <span className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-medium",
                config.className
              )}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
