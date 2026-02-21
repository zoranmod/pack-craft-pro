import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Building2, User, FileText, ExternalLink } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClients, Client } from '@/hooks/useClients';
import { useMemo } from 'react';
import { Document } from '@/types/document';

interface ClientHoverCardProps {
  clientName: string;
  documents?: Document[];
  children: React.ReactNode;
}

export function ClientHoverCard({ clientName, documents = [], children }: ClientHoverCardProps) {
  const { data: clients = [] } = useClients();

  const client = useMemo(() => {
    return clients.find(c => c.name === clientName);
  }, [clients, clientName]);

  const docCount = useMemo(() => {
    return documents.filter(d => d.clientName === clientName).length;
  }, [documents, clientName]);

  const totalAmount = useMemo(() => {
    return documents
      .filter(d => d.clientName === clientName)
      .reduce((sum, d) => sum + d.totalAmount, 0);
  }, [documents, clientName]);

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-80 p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center flex-shrink-0">
              {client?.client_type === 'company' ? (
                <Building2 className="h-5 w-5 text-muted-foreground" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">{clientName}</h4>
              {client && (
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant={client.client_type === 'company' ? 'default' : 'secondary'} className="text-[10px]">
                    {client.client_type === 'company' ? 'Pravna osoba' : 'Privatna osoba'}
                  </Badge>
                  {client.oib && (
                    <span className="text-xs text-muted-foreground">OIB: {client.oib}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Contact info */}
          {client && (
            <div className="space-y-1.5 text-sm">
              {(client.address || client.city) && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <span className="text-xs">{[client.address, client.postal_code, client.city].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <a href={`tel:${client.phone}`} className="text-xs hover:text-foreground transition-colors">{client.phone}</a>
                </div>
              )}
              {client.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                  <a href={`mailto:${client.email}`} className="text-xs hover:text-foreground transition-colors truncate">{client.email}</a>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              <span>{docCount} {docCount === 1 ? 'dokument' : 'dokumenata'}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">{totalAmount.toLocaleString('hr-HR')} €</span>
            </div>
          </div>

          {/* Open details button */}
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to={`/clients?search=${encodeURIComponent(clientName)}`}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              Otvori detalje klijenta
            </Link>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
