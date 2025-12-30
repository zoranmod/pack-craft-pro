import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { documentStatusLabels } from '@/types/document';

interface TableToolbarProps {
  // Status filter
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  showStatusFilter?: boolean;
  
  // Search indicator
  searchQuery?: string;
  onClearSearch?: () => void;
  
  // Primary action button
  primaryActionLabel?: string;
  primaryActionHref?: string;
  primaryActionOnClick?: () => void;
  
  // Custom filters (additional content)
  children?: ReactNode;
}

export function TableToolbar({
  statusFilter = 'all',
  onStatusFilterChange,
  showStatusFilter = true,
  searchQuery,
  onClearSearch,
  primaryActionLabel,
  primaryActionHref,
  primaryActionOnClick,
  children,
}: TableToolbarProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search indicator */}
      {searchQuery && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Pretraga: <strong className="text-foreground">"{searchQuery}"</strong>
          </span>
          <Button variant="ghost" size="sm" onClick={onClearSearch} className="h-6 px-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Toolbar row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {showStatusFilter && onStatusFilterChange && (
            <>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtriraj po statusu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  {Object.entries(documentStatusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
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
