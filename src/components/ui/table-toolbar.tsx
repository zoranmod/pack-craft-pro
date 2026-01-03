import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { UI_VISIBLE_STATUSES, STATUS_LABELS } from '@/config/documentStatus';

// Status styles matching StatusBadge component
const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  accepted: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400',
};

interface TableToolbarProps {
  // Status filter
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  showStatusFilter?: boolean;
  
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
  // Primary action button
  primaryActionLabel?: string;
  primaryActionHref?: string;
  primaryActionOnClick?: () => void;
  
  // Year filter indicator
  yearLabel?: string;
  
  // Custom filters (additional content)
  children?: ReactNode;
}

export function TableToolbar({
  statusFilter = 'all',
  onStatusFilterChange,
  showStatusFilter = true,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Pretraži...',
  primaryActionLabel,
  primaryActionHref,
  primaryActionOnClick,
  yearLabel,
  children,
}: TableToolbarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Toolbar row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Search input */}
          {onSearchChange && (
            <SearchInput
              value={searchValue}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="flex-1 max-w-md"
            />
          )}
          
          {showStatusFilter && onStatusFilterChange && (
            <>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtriraj po statusu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  {UI_VISIBLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="py-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
                        statusStyles[status]
                      )}>
                        {STATUS_LABELS[status]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          
          {/* Year filter indicator */}
          {yearLabel && (
            <Badge variant="secondary" className="gap-1.5 h-8 px-3">
              <Calendar className="h-3.5 w-3.5" />
              Godina: {yearLabel}
            </Badge>
          )}
          
          {children}
        </div>
        
        {primaryActionLabel && (primaryActionHref || primaryActionOnClick) && (
          primaryActionHref ? (
            <Link to={primaryActionHref}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {primaryActionLabel}
              </Button>
            </Link>
          ) : (
            <Button className="gap-2" onClick={primaryActionOnClick}>
              <Plus className="h-4 w-4" />
              {primaryActionLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
