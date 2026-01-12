import { useState } from 'react';
import { Search, Filter, X, Calendar, User, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { documentTypeLabels, DocumentType } from '@/types/document';
import { STATUS_LABELS, UI_VISIBLE_STATUSES } from '@/config/documentStatus';

export interface AdvancedFilters {
  clientName?: string;
  dateFrom?: string;
  dateTo?: string;
  amountFrom?: number;
  amountTo?: number;
  documentType?: DocumentType | 'all';
  status?: string;
  monter?: string;
  preparedBy?: string;
}

interface AdvancedSearchDialogProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClear: () => void;
}

export function AdvancedSearchDialog({ 
  filters, 
  onFiltersChange, 
  onClear 
}: AdvancedSearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<AdvancedFilters>(filters);

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (value === undefined || value === '' || value === 'all') return false;
    return true;
  }).length;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClear = () => {
    const emptyFilters: AdvancedFilters = {};
    setLocalFilters(emptyFilters);
    onClear();
    setOpen(false);
  };

  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K, 
    value: AdvancedFilters[K]
  ) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Napredni filteri
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Napredna pretraga
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Klijent
            </Label>
            <Input
              placeholder="Naziv klijenta..."
              value={localFilters.clientName || ''}
              onChange={(e) => updateFilter('clientName', e.target.value)}
            />
          </div>

          <Separator />

          {/* Date range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Raspon datuma
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Od</Label>
                <Input
                  type="date"
                  value={localFilters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Do</Label>
                <Input
                  type="date"
                  value={localFilters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Amount range */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Raspon iznosa (€)
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Od</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.amountFrom || ''}
                  onChange={(e) => updateFilter('amountFrom', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Do</Label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={localFilters.amountTo || ''}
                  onChange={(e) => updateFilter('amountTo', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Document type and status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Tip dokumenta
              </Label>
              <Select 
                value={localFilters.documentType || 'all'} 
                onValueChange={(v) => updateFilter('documentType', v as DocumentType | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Svi tipovi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(documentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={localFilters.status || 'all'} 
                onValueChange={(v) => updateFilter('status', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Svi statusi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  {UI_VISIBLE_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Monter and PreparedBy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Monter</Label>
              <Input
                placeholder="Ime montera..."
                value={localFilters.monter || ''}
                onChange={(e) => updateFilter('monter', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Izradio</Label>
              <Input
                placeholder="Ime osobe..."
                value={localFilters.preparedBy || ''}
                onChange={(e) => updateFilter('preparedBy', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={handleClear}>
            <X className="mr-2 h-4 w-4" />
            Očisti
          </Button>
          <Button onClick={handleApply}>
            <Search className="mr-2 h-4 w-4" />
            Primijeni
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
