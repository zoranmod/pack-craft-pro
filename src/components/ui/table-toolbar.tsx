import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
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
  
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  
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
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Pretraži...',
  primaryActionLabel,
  primaryActionHref,
  primaryActionOnClick,
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
                  {Object.entries(documentStatusLabels)
                    .filter(([value]) => !['rejected', 'pending'].includes(value))
                    .map(([value, label]) => (
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
