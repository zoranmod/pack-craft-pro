import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, MapPin, Building2, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, Supplier, CreateSupplierData } from '@/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';

const emptyForm: CreateSupplierData = {
  name: '',
  oib: '',
  address: '',
  city: '',
  postal_code: '',
  phone: '',
  email: '',
  contact_person: '',
  notes: '',
};

const Dobavljaci = () => {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSupplierData>(emptyForm);

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
    (supplier.oib && supplier.oib.includes(debouncedSearch)) ||
    (supplier.city && supplier.city.toLowerCase().includes(debouncedSearch.toLowerCase()))
  );

  const openNew = () => {
    setEditingSupplier(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      oib: supplier.oib || '',
      address: supplier.address || '',
      city: supplier.city || '',
      postal_code: supplier.postal_code || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      contact_person: supplier.contact_person || '',
      notes: supplier.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...formData });
    } else {
      await createSupplier.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSupplier.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout title="Dobavljači" subtitle="Upravljajte bazom dobavljača">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži dobavljače..."
              className="pl-9 pr-9"
            />
            {search && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj dobavljača
          </Button>
        </div>

        {/* Supplier List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {debouncedSearch ? `Nema rezultata za "${debouncedSearch}"` : 'Nema dobavljača'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearch ? 'Pokušajte s drugim pojmom' : 'Dodajte prvog dobavljača da započnete'}
            </p>
            {!debouncedSearch && (
              <Button onClick={openNew} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj dobavljača
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="bg-card rounded-xl border border-border/50 p-5 shadow-card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{supplier.name}</h3>
                      {supplier.oib && (
                        <p className="text-xs text-muted-foreground">OIB: {supplier.oib}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(supplier.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {supplier.contact_person && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4 flex-shrink-0" />
                      <span>{supplier.contact_person}</span>
                    </div>
                  )}
                  {(supplier.address || supplier.city) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{[supplier.address, supplier.postal_code, supplier.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{supplier.email}</span>
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
            <DialogTitle>{editingSupplier ? 'Uredi dobavljača' : 'Novi dobavljač'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Naziv tvrtke *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Naziv dobavljača"
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
                <Label htmlFor="contact_person">Kontakt osoba</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="Ime i prezime"
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
              <div>
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
              <Button type="submit" disabled={createSupplier.isPending || updateSupplier.isPending}>
                {editingSupplier ? 'Spremi promjene' : 'Dodaj dobavljača'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati dobavljača?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja se ne može poništiti. Dobavljač će biti trajno obrisan.
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
    </MainLayout>
  );
};

export default Dobavljaci;
