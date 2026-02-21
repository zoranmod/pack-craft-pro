import { useState } from 'react';
import { History, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useDocumentVersions, useRestoreDocumentVersion, DocumentVersion } from '@/hooks/useDocumentVersions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { formatDateHR } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DocumentVersionsProps {
  documentId: string;
}

export function DocumentVersions({ documentId }: DocumentVersionsProps) {
  const { data: versions, isLoading } = useDocumentVersions(documentId);
  const restoreVersion = useRestoreDocumentVersion();
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !versions || versions.length === 0) return null;

  const displayedVersions = expanded ? versions : versions.slice(0, 3);

  const handleRestore = () => {
    if (!selectedVersion) return;
    restoreVersion.mutate({ version: selectedVersion }, {
      onSuccess: () => {
        setConfirmRestore(false);
        setSelectedVersion(null);
      },
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Verzije</h3>
          </div>
          <Badge variant="secondary" className="text-xs">{versions.length}</Badge>
        </div>

        <div className="space-y-2">
          {displayedVersions.map((version) => (
            <button
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">
                  Verzija {version.version_number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateHR(version.created_at)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatAmount(version.snapshot?.total_amount || 0)}
                {' · '}
                {version.items_snapshot?.length || 0} stavki
              </div>
            </button>
          ))}
        </div>

        {versions.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>Prikaži manje <ChevronUp className="ml-1 h-3 w-3" /></>
            ) : (
              <>Prikaži sve ({versions.length}) <ChevronDown className="ml-1 h-3 w-3" /></>
            )}
          </Button>
        )}
      </div>

      {/* Version detail dialog */}
      <Dialog open={!!selectedVersion && !confirmRestore} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Verzija {selectedVersion?.version_number}</DialogTitle>
          </DialogHeader>

          {selectedVersion && (
            <div className="space-y-4">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datum spremanja</span>
                  <span>{formatDateHR(selectedVersion.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Klijent</span>
                  <span>{selectedVersion.snapshot?.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ukupno</span>
                  <span className="font-medium">{formatAmount(selectedVersion.snapshot?.total_amount || 0)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium mb-2">Stavke ({selectedVersion.items_snapshot?.length || 0})</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {selectedVersion.items_snapshot?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs p-2 rounded bg-muted/50">
                      <span className="truncate mr-2">{item.name}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {item.quantity} × {Number(item.price).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedVersion.snapshot?.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-1">Napomene</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{selectedVersion.snapshot.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVersion(null)}>Zatvori</Button>
            <Button onClick={() => setConfirmRestore(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Vrati ovu verziju
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation */}
      <AlertDialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vratiti dokument na verziju {selectedVersion?.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              Trenutni podaci dokumenta bit će zamijenjeni podacima iz odabrane verzije.
              Prije vraćanja, trenutno stanje će biti spremljeno kao nova verzija.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore} disabled={restoreVersion.isPending}>
              {restoreVersion.isPending ? 'Vraćam...' : 'Vrati'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
