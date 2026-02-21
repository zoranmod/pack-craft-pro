import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { Client } from '@/hooks/useClients';
import { Document } from '@/types/document';
import { useCopyDocumentForClient } from '@/hooks/useCopyDocumentForClient';

interface CopyForClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
}

export function CopyForClientDialog({ open, onOpenChange, document }: CopyForClientDialogProps) {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const copyForClient = useCopyDocumentForClient();

  const handleCopy = async () => {
    if (!selectedClient) return;
    
    const result = await copyForClient.mutateAsync({
      sourceDocument: document,
      clientOverride: {
        clientName: selectedClient.name,
        clientAddress: [selectedClient.address, selectedClient.postal_code, selectedClient.city].filter(Boolean).join(', '),
        clientOib: selectedClient.oib || undefined,
        clientPhone: selectedClient.phone || undefined,
        clientEmail: selectedClient.email || undefined,
      },
    });

    if (result?.id) {
      onOpenChange(false);
      navigate(`/documents/${result.id}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kopiraj za drugog klijenta
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Odaberite klijenta za koji želite kopirati dokument <strong>{document.number}</strong>:
          </p>
          <ClientAutocomplete
            onSelect={setSelectedClient}
            placeholder="Pretraži i odaberi klijenta..."
          />
          {selectedClient && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <p className="font-medium text-foreground">{selectedClient.name}</p>
              {selectedClient.address && (
                <p className="text-muted-foreground text-xs">
                  {[selectedClient.address, selectedClient.postal_code, selectedClient.city].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Odustani
          </Button>
          <Button
            onClick={handleCopy}
            disabled={!selectedClient || copyForClient.isPending}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copyForClient.isPending ? 'Kopiram...' : 'Kopiraj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
