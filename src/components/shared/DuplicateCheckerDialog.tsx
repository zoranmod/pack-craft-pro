import { useState, useMemo } from 'react';
import { Copy, Trash2, Check, AlertTriangle, CheckCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { findDuplicates, getDuplicateCount } from '@/lib/duplicateUtils';
import { useIgnoredDuplicates } from '@/hooks/useIgnoredDuplicates';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

interface Entity {
  id: string;
  name: string;
  created_at: string;
  oib?: string | null;
  city?: string | null;
  address?: string | null;
}

interface DuplicateCheckerDialogProps<T extends Entity> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: T[];
  entityType: 'supplier' | 'client';
  onDeleteDuplicates: (idsToDelete: string[]) => Promise<void>;
  isDeleting?: boolean;
}

export function DuplicateCheckerDialog<T extends Entity>({
  open,
  onOpenChange,
  entities,
  entityType,
  onDeleteDuplicates,
  isDeleting = false,
}: DuplicateCheckerDialogProps<T>) {
  const [selectedToKeep, setSelectedToKeep] = useState<Record<string, string>>({});
  const { ignoreDuplicate, isIgnoring, isGroupIgnored } = useIgnoredDuplicates(entityType);
  
  const duplicates = useMemo(() => findDuplicates(entities), [entities]);

  // Filter out ignored duplicate groups
  const activeDuplicateGroups = useMemo(() => {
    const groups = Array.from(duplicates.entries())
      .map(([normalizedName, group]) => ({
        normalizedName,
        items: group.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }))
      .filter(group => !isGroupIgnored(group.items.map(item => item.id)));
    
    return groups;
  }, [duplicates, isGroupIgnored]);

  const groupCount = activeDuplicateGroups.length;
  const totalDuplicates = activeDuplicateGroups.reduce(
    (sum, group) => sum + group.items.length - 1,
    0
  );

  // Initialize selectedToKeep with the oldest item in each group
  useMemo(() => {
    const initial: Record<string, string> = {};
    activeDuplicateGroups.forEach(group => {
      if (!selectedToKeep[group.normalizedName] && group.items.length > 0) {
        initial[group.normalizedName] = group.items[0].id;
      }
    });
    if (Object.keys(initial).length > 0) {
      setSelectedToKeep(prev => ({ ...prev, ...initial }));
    }
  }, [activeDuplicateGroups]);

  const handleDeleteSelected = async () => {
    const idsToDelete: string[] = [];
    
    activeDuplicateGroups.forEach(group => {
      const keepId = selectedToKeep[group.normalizedName];
      group.items.forEach(item => {
        if (item.id !== keepId) {
          idsToDelete.push(item.id);
        }
      });
    });

    if (idsToDelete.length > 0) {
      await onDeleteDuplicates(idsToDelete);
      onOpenChange(false);
    }
  };

  const handleKeepBoth = (group: { normalizedName: string; items: T[] }) => {
    const entityIds = group.items.map(item => item.id);
    ignoreDuplicate(entityIds);
  };

  const entityLabel = entityType === 'supplier' ? 'dobavljača' : 'klijenata';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Provjera duplikata {entityLabel}
          </DialogTitle>
          <DialogDescription>
            Pronađite i uklonite dvostruke zapise
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto py-4">
          {groupCount === 0 ? (
            <div className="text-center py-12">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nema duplikata
              </h3>
              <p className="text-muted-foreground">
                Svi {entityLabel} imaju jedinstvene nazive.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-sm text-foreground">
                  Pronađeno <strong>{groupCount}</strong> grupa duplikata 
                  ({totalDuplicates} suvišnih zapisa). Odaberite koji zapis želite zadržati u svakoj grupi.
                </p>
              </div>

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {activeDuplicateGroups.map((group) => (
                    <div
                      key={group.normalizedName}
                      className="border border-border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground capitalize">
                          "{group.items[0].name}"
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {group.items.length} zapisa
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleKeepBoth(group)}
                            disabled={isIgnoring}
                            className="gap-1.5"
                          >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Zadrži sve
                          </Button>
                        </div>
                      </div>

                      <RadioGroup
                        value={selectedToKeep[group.normalizedName] || group.items[0].id}
                        onValueChange={(value) =>
                          setSelectedToKeep(prev => ({
                            ...prev,
                            [group.normalizedName]: value,
                          }))
                        }
                        className="space-y-2"
                      >
                        {group.items.map((item, index) => (
                          <div
                            key={item.id}
                            className={`flex items-start gap-3 p-3 rounded-md border transition-colors ${
                              selectedToKeep[group.normalizedName] === item.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                            }`}
                          >
                            <RadioGroupItem value={item.id} id={item.id} className="mt-0.5" />
                            <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{item.name}</span>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Najstariji
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                <p>
                                  Kreiran: {format(new Date(item.created_at), 'dd.MM.yyyy HH:mm', { locale: hr })}
                                </p>
                                {item.oib && <p>OIB: {item.oib}</p>}
                                {(item.address || item.city) && (
                                  <p>{[item.address, item.city].filter(Boolean).join(', ')}</p>
                                )}
                              </div>
                            </Label>
                            {selectedToKeep[group.normalizedName] === item.id ? (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                <Check className="h-3 w-3 mr-1" />
                                Zadrži
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="opacity-70">
                                <Trash2 className="h-3 w-3 mr-1" />
                                Obriši
                              </Badge>
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zatvori
          </Button>
          {groupCount > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Brisanje...' : `Obriši ${totalDuplicates} duplikata`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
