import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Plus, User, Building2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useClients, Client, normalizeClientName, useCreateClient } from '@/hooks/useClients';
import { cn } from '@/lib/utils';
import { NewClientModal, NewClientData } from './NewClientModal';

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
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [pendingClientName, setPendingClientName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { data: clients = [], isLoading } = useClients();
  const createClient = useCreateClient();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    (client.oib && client.oib.includes(search))
  );

  // Check if there's an exact match (case-insensitive)
  const normalizedSearch = normalizeClientName(search);
  const hasExactMatch = search.trim() !== '' && clients.some(
    client => normalizeClientName(client.name) === normalizedSearch
  );

  // Show "add new" option if there's text and no exact match
  const showAddNewOption = search.trim() !== '' && !hasExactMatch;

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

  // Open modal to add new client
  const handleAddNewClick = () => {
    setPendingClientName(search.trim());
    setShowNewClientModal(true);
    setIsOpen(false);
  };

  // Save new client from modal
  const handleSaveNewClient = useCallback(async (data: NewClientData) => {
    setIsCreating(true);
    try {
      const client = await createClient.mutateAsync({
        name: data.name,
        client_type: data.client_type,
        oib: data.oib,
        address: data.address,
        phone: data.phone,
        email: data.email,
        notes: data.contact_person ? `Kontakt: ${data.contact_person}` : undefined,
      });
      
      if (client) {
        setSearch(client.name);
        setShowNewClientModal(false);
        onSelect(client);
      }
    } finally {
      setIsCreating(false);
    }
  }, [createClient, onSelect]);

  // Function to check if name exists and open modal if not
  const checkAndPromptNewClient = useCallback((clientName: string): boolean => {
    const normalized = normalizeClientName(clientName);
    const existing = clients.find(c => normalizeClientName(c.name) === normalized);
    
    if (existing) {
      return false; // Client exists, no modal needed
    }
    
    // Client doesn't exist, open modal
    setPendingClientName(clientName.trim());
    setShowNewClientModal(true);
    return true; // Modal opened
  }, [clients]);

  return (
    <>
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
            ) : (
              <>
                {/* Show "Add new client" option at the top when typing a new name */}
                {showAddNewOption && (
                  <button
                    type="button"
                    onClick={handleAddNewClick}
                    className="w-full px-3 py-2.5 text-left hover:bg-accent transition-colors flex items-center gap-3 border-b border-border bg-primary/5"
                  >
                    <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-primary font-medium">
                      + Dodaj novog klijenta: "{search.trim()}"
                    </span>
                  </button>
                )}

                {filteredClients.length > 0 ? (
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
                ) : !showAddNewOption ? (
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    Nema pronađenih klijenata
                  </div>
                ) : null}
              </>
            )}
            
            {/* Legacy "Add new" button - only show if onAddNew prop is provided and we're not showing inline add */}
            {onAddNew && !showAddNewOption && (
              <div className="border-t border-border p-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onAddNew();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-primary rounded-md"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj novog klijenta
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Client Modal */}
      <NewClientModal
        open={showNewClientModal}
        onOpenChange={setShowNewClientModal}
        initialName={pendingClientName}
        onSave={handleSaveNewClient}
        isLoading={isCreating}
      />
    </>
  );
}
