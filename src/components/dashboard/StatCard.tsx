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
        "bg-card rounded-xl p-5 border border-border transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
        href && "cursor-pointer hover:border-primary/40 hover:shadow-md",
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
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-primary/10 p-3 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.isPositive ? '↑' : '↓'}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}
