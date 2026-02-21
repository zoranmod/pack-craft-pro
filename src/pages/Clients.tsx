import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit, Trash2, User, Phone, Mail, MapPin, Building2, Copy } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, Client, CreateClientData } from '@/hooks/useClients';
import { useDebounce } from '@/hooks/useDebounce';
import { DuplicateCheckerDialog } from '@/components/shared/DuplicateCheckerDialog';
import { getDuplicateCount } from '@/lib/duplicateUtils';
import { useIgnoredDuplicates } from '@/hooks/useIgnoredDuplicates';
import { toast } from '@/hooks/use-toast';

const emptyForm: CreateClientData = {
  name: '',
  oib: '',
  address: '',
  city: '',
  postal_code: '',
  phone: '',
  email: '',
  notes: '',
  client_type: 'company',
  default_pdv: 25,
};

const Clients = () => {
  const { data: clients = [], isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDuplicateCheckOpen, setIsDuplicateCheckOpen] = useState(false);
  const [isDeletingDuplicates, setIsDeletingDuplicates] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateClientData>(emptyForm);

  const { isGroupIgnored } = useIgnoredDuplicates('client');
  const { groupCount: duplicateGroupCount } = getDuplicateCount(clients, isGroupIgnored);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (client.oib && client.oib.includes(debouncedSearch)) ||
    (client.city && client.city.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  const openNew = () => {
    setEditingClient(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      oib: client.oib || '',
      address: client.address || '',
      city: client.city || '',
      postal_code: client.postal_code || '',
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
      client_type: client.client_type || 'company',
      default_pdv: client.default_pdv ?? 25,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingClient) {
      await updateClient.mutateAsync({ id: editingClient.id, ...formData });
    } else {
      // createClient now handles duplicate detection internally
      await createClient.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteClient.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleDeleteDuplicates = async (idsToDelete: string[]) => {
    setIsDeletingDuplicates(true);
    try {
      for (const id of idsToDelete) {
        await deleteClient.mutateAsync(id);
      }
      toast({
        title: 'Duplikati obrisani',
        description: `Uspješno obrisano ${idsToDelete.length} duplikata.`,
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati sve duplikate.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingDuplicates(false);
    }
  };

  return (
    <MainLayout title="Klijenti" subtitle="Upravljajte bazom klijenata">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pretraži klijente..."
            className="flex-1 max-w-md"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDuplicateCheckOpen(true)} 
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
              Duplikati
              {duplicateGroupCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {duplicateGroupCount}
                </span>
              )}
            </Button>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj klijenta
            </Button>
          </div>
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {debouncedSearch ? `Nema rezultata za "${debouncedSearch}"` : 'Nema klijenata'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearch ? 'Pokušajte s drugim pojmom' : 'Dodajte prvog klijenta da započnete'}
            </p>
            {!debouncedSearch && (
              <Button onClick={openNew} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj klijenta
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-card rounded-xl border border-border/50 p-5 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted/60 dark:bg-muted/40 flex items-center justify-center">
                      {client.client_type === 'company' ? (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{client.name}</h3>
                        <Badge variant={client.client_type === 'company' ? 'default' : 'secondary'} className="text-xs">
                          {client.client_type === 'company' ? 'Pravna osoba' : 'Privatna osoba'}
                        </Badge>
                      </div>
                      {client.oib && (
                        <p className="text-xs text-muted-foreground">OIB: {client.oib}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(client)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(client.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {(client.address || client.city) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{[client.address, client.postal_code, client.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Uredi klijenta' : 'Novi klijent'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Client Type Selection */}
              <div className="sm:col-span-2">
                <Label className="mb-3 block">Tip klijenta</Label>
                <RadioGroup
                  value={formData.client_type || 'company'}
                  onValueChange={(value: 'private' | 'company') => {
                    setFormData({
                      ...formData,
                      client_type: value,
                      default_pdv: value === 'private' ? 0 : 25,
                    });
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2 flex-1 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Privatna osoba
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      Pravna osoba
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="name">Naziv *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.client_type === 'company' ? 'Naziv tvrtke' : 'Ime i prezime'}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="oib">OIB</Label>
                <Input
                  id="oib"
                  value={formData.oib}
                  onChange={(e) => setFormData({ ...formData, oib: e.target.value })}
                  placeholder="12345678901"
                  maxLength={11}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+385 xx xxx xxxx"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@primjer.hr"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Adresa</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Ulica i broj"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="postal_code">Poštanski broj</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                  placeholder="10000"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="city">Grad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Zagreb"
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Napomene</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Dodatne napomene..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Odustani
              </Button>
              <Button type="submit" disabled={createClient.isPending || updateClient.isPending}>
                {editingClient ? 'Spremi promjene' : 'Dodaj klijenta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati klijenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja se ne može poništiti. Klijent će biti trajno obrisan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Duplicate Checker Dialog */}
      <DuplicateCheckerDialog
        open={isDuplicateCheckOpen}
        onOpenChange={setIsDuplicateCheckOpen}
        entities={clients}
        entityType="client"
        onDeleteDuplicates={handleDeleteDuplicates}
        isDeleting={isDeletingDuplicates}
      />
    </MainLayout>
  );
};

export default Clients;
