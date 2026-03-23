import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  href?: string;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className, href }: StatCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (href) {
      navigate(href);
    }
  };

  return (
    <div 
      className={cn(
        "bg-card rounded-lg p-4 border border-border transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.04)]",
        href && "cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-primary/30",
        className
      )}
      onClick={handleClick}
      role={href ? "button" : undefined}
      tabIndex={href ? 0 : undefined}
      onKeyDown={(e) => {
        if (href && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
    >
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[hsl(45_100%_92%)] dark:bg-primary/20 p-2.5 shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{title}</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-xl font-bold text-foreground leading-none">{value}</p>
            {trend && (
              <span className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                trend.isPositive 
                  ? "text-success bg-success/10" 
                  : "text-destructive bg-destructive/10"
              )}>
                {trend.isPositive ? '↑' : '↓'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
