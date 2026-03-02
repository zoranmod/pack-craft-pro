import { useState } from 'react';
import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { useApartmentGuests } from '@/hooks/useApartmentGuests';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { getGuestDisplayName, type ApartmentGuest } from '@/types/apartment';

export default function ApartmentGuests() {
  const { ownerUserId } = useApartmentAuth();
  const { guests, isLoading, upsert, remove } = useApartmentGuests(ownerUserId);
  const [editGuest, setEditGuest] = useState<Partial<ApartmentGuest> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const openNew = () => {
    setEditGuest({ guest_type: 'fizicko_lice', first_name: '', last_name: '' });
    setDialogOpen(true);
  };

  const openEdit = (g: ApartmentGuest) => {
    setEditGuest({ ...g });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editGuest || !ownerUserId) return;
    upsert.mutate({ ...editGuest, owner_user_id: ownerUserId } as any, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const filtered = guests.filter(g => {
    const name = getGuestDisplayName(g).toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const isFizicko = editGuest?.guest_type === 'fizicko_lice';

  return (
    <ApartmentLayout title="Evidencija gostiju">
      <div className="flex justify-between items-center mb-4 gap-4">
        <Input placeholder="Pretraži goste..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Novi gost</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Grad</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>OIB / JIB</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(g => (
              <TableRow key={g.id}>
                <TableCell className="font-medium">{getGuestDisplayName(g)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{g.guest_type === 'fizicko_lice' ? 'Fizičko lice' : 'Pravno lice'}</Badge>
                </TableCell>
                <TableCell>{[g.postal_code, g.city].filter(Boolean).join(' ') || '-'}</TableCell>
                <TableCell>{g.phone || '-'}</TableCell>
                <TableCell>{g.email || '-'}</TableCell>
                <TableCell>{g.jib || g.id_number || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(g.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nema gostiju</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editGuest?.id ? 'Uredi gosta' : 'Novi gost'}</DialogTitle>
          </DialogHeader>
          {editGuest && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={editGuest.guest_type || 'fizicko_lice'} onValueChange={v => setEditGuest({ ...editGuest, guest_type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fizicko_lice">Fizičko lice</SelectItem>
                    <SelectItem value="pravno_lice">Pravno lice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isFizicko ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ime</Label>
                      <Input value={editGuest.first_name || ''} onChange={e => setEditGuest({ ...editGuest, first_name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Prezime</Label>
                      <Input value={editGuest.last_name || ''} onChange={e => setEditGuest({ ...editGuest, last_name: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Br. lične karte / pasoša</Label>
                      <Input value={editGuest.id_number || ''} onChange={e => setEditGuest({ ...editGuest, id_number: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Nacionalnost</Label>
                      <Input value={editGuest.nationality || ''} onChange={e => setEditGuest({ ...editGuest, nationality: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Datum rođenja</Label>
                    <Input type="date" value={editGuest.date_of_birth || ''} onChange={e => setEditGuest({ ...editGuest, date_of_birth: e.target.value })} />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Naziv firme</Label>
                    <Input value={editGuest.company_name || ''} onChange={e => setEditGuest({ ...editGuest, company_name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>OIB / JIB</Label>
                      <Input value={editGuest.jib || ''} onChange={e => setEditGuest({ ...editGuest, jib: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>PDV broj</Label>
                      <Input value={editGuest.pdv_number || ''} onChange={e => setEditGuest({ ...editGuest, pdv_number: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Kontakt osoba</Label>
                    <Input value={editGuest.contact_person || ''} onChange={e => setEditGuest({ ...editGuest, contact_person: e.target.value })} />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefon</Label>
                  <Input value={editGuest.phone || ''} onChange={e => setEditGuest({ ...editGuest, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editGuest.email || ''} onChange={e => setEditGuest({ ...editGuest, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresa</Label>
                <Input value={editGuest.address || ''} onChange={e => setEditGuest({ ...editGuest, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Poštanski broj</Label>
                  <Input value={editGuest.postal_code || ''} onChange={e => setEditGuest({ ...editGuest, postal_code: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Grad</Label>
                  <Input value={editGuest.city || ''} onChange={e => setEditGuest({ ...editGuest, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Država</Label>
                  <Input value={editGuest.country || ''} onChange={e => setEditGuest({ ...editGuest, country: e.target.value })} />
                </div>
              </div>

              <Button className="w-full" onClick={handleSave} disabled={upsert.isPending}>
                {upsert.isPending ? 'Spremanje...' : 'Spremi'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ApartmentLayout>
  );
}
