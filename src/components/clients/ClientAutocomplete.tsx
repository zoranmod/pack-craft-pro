import { useState, useRef, useEffect } from 'react';
import { Search, Plus, User, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClients, Client } from '@/hooks/useClients';
import { cn } from '@/lib/utils';

interface ClientAutocompleteProps {
  onSelect: (client: Client) => void;
  onAddNew?: () => void;
  value?: string;
  placeholder?: string;
}

export function ClientAutocomplete({ 
  onSelect, 
  onAddNew, 
  value = '', 
  placeholder = 'Pretraži klijente...' 
}: ClientAutocompleteProps) {
  const [search, setSearch] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { data: clients = [], isLoading } = useClients();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    (client.oib && client.oib.includes(search))
  );

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (client: Client) => {
    setSearch(client.name);
    setIsOpen(false);
    onSelect(client);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Učitavanje...
            </div>
          ) : filteredClients.length > 0 ? (
            <div className="py-1">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelect(client)}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-start gap-3"
                >
                  {client.client_type === 'company' ? (
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{client.name}</span>
                      <Badge variant={client.client_type === 'company' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                        {client.client_type === 'company' ? 'Pravna' : 'Privatna'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {[client.address, client.city].filter(Boolean).join(', ')}
                      {client.oib && ` • OIB: ${client.oib}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Nema pronađenih klijenata
            </div>
          )}
          
          {onAddNew && (
            <div className="border-t border-border p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="w-full justify-start gap-2 text-primary"
              >
                <Plus className="h-4 w-4" />
                Dodaj novog klijenta
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
