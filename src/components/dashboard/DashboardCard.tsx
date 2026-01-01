import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  contentClassName?: string;
}

export function DashboardCard({ 
  title, 
  children, 
  actionLabel,
  actionHref,
  className,
  contentClassName
}: DashboardCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-lg border border-border shadow-sm flex flex-col h-full",
      className
    )}>
      {/* Standardized header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {actionLabel && actionHref && (
          <Link 
            to={actionHref} 
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      
      {/* Standardized content area */}
      <div className={cn("flex-1 min-h-0", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
