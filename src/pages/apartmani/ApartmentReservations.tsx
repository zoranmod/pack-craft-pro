import { useState } from 'react';
import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { useApartmentReservations } from '@/hooks/useApartmentReservations';
import { useApartmentUnits } from '@/hooks/useApartmentUnits';
import { useApartmentGuests } from '@/hooks/useApartmentGuests';
import { useApartmentPriceList } from '@/hooks/useApartmentPriceList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getGuestDisplayName, calculateReservationTotal, PAYMENT_METHODS, type ApartmentReservation } from '@/types/apartment';

const statusLabels: Record<string, string> = {
  reserved: 'Rezervirano',
  checked_in: 'Prijavljen',
  checked_out: 'Odjavljen',
  cancelled: 'Otkazano',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  reserved: 'default',
  checked_in: 'secondary',
  checked_out: 'outline',
  cancelled: 'destructive',
};

export default function ApartmentReservations() {
  const { ownerUserId } = useApartmentAuth();
  const { reservations, isLoading, upsert, remove } = useApartmentReservations(ownerUserId);
  const { units } = useApartmentUnits(ownerUserId);
  const { guests } = useApartmentGuests(ownerUserId);
  const { getPrice } = useApartmentPriceList(ownerUserId);
  const [editRes, setEditRes] = useState<Partial<ApartmentReservation> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openNew = () => {
    setEditRes({
      unit_id: units[0]?.id || '',
      guest_id: null,
      check_in: format(new Date(), 'yyyy-MM-dd'),
      check_out: format(new Date(), 'yyyy-MM-dd'),
      adults: 1,
      children: 0,
      price_per_person: 0,
      breakfast_included: false,
      breakfast_price_per_person: 0,
      tourist_tax_per_person: 0,
      status: 'reserved',
      source: 'manual',
      payment_method: 'gotovinski',
    });
    setDialogOpen(true);
  };

  const openEdit = (r: ApartmentReservation) => {
    setEditRes({ ...r });
    setDialogOpen(true);
  };

  const nights = editRes?.check_in && editRes?.check_out
    ? Math.max(0, differenceInDays(new Date(editRes.check_out), new Date(editRes.check_in)))
    : 0;

  // Auto-lookup price from price list when unit or persons change
  const autoLookupPrice = (unitId?: string, adults?: number, children?: number, breakfast?: boolean) => {
    const unit = units.find(u => u.id === (unitId || editRes?.unit_id));
    if (!unit) return;
    const totalPersons = (adults ?? editRes?.adults ?? 1) + (children ?? editRes?.children ?? 0);
    const withBreakfast = breakfast ?? editRes?.breakfast_included ?? false;
    const price = getPrice(unit.unit_type as 'apartment' | 'room', totalPersons, withBreakfast);
    if (price > 0) {
      setEditRes(prev => prev ? { ...prev, price_per_person: price } : prev);
    }
  };

  const calc = editRes ? calculateReservationTotal(
    editRes.adults || 0, editRes.children || 0, nights,
    editRes.price_per_person || 0,
    editRes.breakfast_included || false,
    editRes.breakfast_price_per_person || 0,
    editRes.tourist_tax_per_person || 0
  ) : null;

  const handleSave = () => {
    if (!editRes || !ownerUserId) return;
    upsert.mutate({
      ...editRes,
      owner_user_id: ownerUserId,
      total_amount: calc?.total || 0,
    } as any, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleUnitChange = (unitId: string) => {
    setEditRes(prev => prev ? { ...prev, unit_id: unitId } : prev);
    setTimeout(() => autoLookupPrice(unitId), 0);
  };

  const handlePersonsChange = (field: 'adults' | 'children', value: number) => {
    setEditRes(prev => {
      if (!prev) return prev;
      const updated = { ...prev, [field]: value };
      return updated;
    });
    setTimeout(() => {
      const a = field === 'adults' ? value : editRes?.adults;
      const c = field === 'children' ? value : editRes?.children;
      autoLookupPrice(undefined, a, c);
    }, 0);
  };

  const handleBreakfastChange = (checked: boolean) => {
    setEditRes(prev => prev ? { ...prev, breakfast_included: checked } : prev);
    setTimeout(() => autoLookupPrice(undefined, undefined, undefined, checked), 0);
  };

  return (
    <ApartmentLayout title="Rezervacije">
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{reservations.length} rezervacija</p>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova rezervacija</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jedinica</TableHead>
              <TableHead>Gost</TableHead>
              <TableHead>Dolazak</TableHead>
              <TableHead>Odlazak</TableHead>
              <TableHead>Osobe</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Plaćanje</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Izvor</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.unit?.name || '-'}</TableCell>
                <TableCell>{r.guest ? getGuestDisplayName(r.guest) : '-'}</TableCell>
                <TableCell>{r.check_in}</TableCell>
                <TableCell>{r.check_out}</TableCell>
                <TableCell>{r.adults + r.children}</TableCell>
                <TableCell>{Number(r.total_amount).toFixed(2)} €</TableCell>
                <TableCell>{PAYMENT_METHODS.find(p => p.value === r.payment_method)?.label || r.payment_method || '-'}</TableCell>
                <TableCell><Badge variant={statusVariants[r.status]}>{statusLabels[r.status]}</Badge></TableCell>
                <TableCell>{r.source === 'booking_com' ? 'Booking.com' : 'Ručno'}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate(r.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {reservations.length === 0 && (
              <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">Nema rezervacija</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editRes?.id ? 'Uredi rezervaciju' : 'Nova rezervacija'}</DialogTitle>
          </DialogHeader>
          {editRes && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Jedinica</Label>
                <Select value={editRes.unit_id || ''} onValueChange={handleUnitChange}>
                  <SelectTrigger><SelectValue placeholder="Odaberi jedinicu" /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gost</Label>
                <Select value={editRes.guest_id || '__none__'} onValueChange={v => setEditRes({ ...editRes, guest_id: v === '__none__' ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Odaberi gosta" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Bez gosta —</SelectItem>
                    {guests.map(g => <SelectItem key={g.id} value={g.id}>{getGuestDisplayName(g)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dolazak</Label>
                  <Input type="date" value={editRes.check_in || ''} onChange={e => setEditRes({ ...editRes, check_in: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Odlazak</Label>
                  <Input type="date" value={editRes.check_out || ''} onChange={e => setEditRes({ ...editRes, check_out: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Odrasli</Label>
                  <Input type="number" min={1} value={editRes.adults || 1} onChange={e => handlePersonsChange('adults', Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Djeca</Label>
                  <Input type="number" min={0} value={editRes.children || 0} onChange={e => handlePersonsChange('children', Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={editRes.breakfast_included || false}
                  onCheckedChange={v => handleBreakfastChange(!!v)}
                />
                <Label>Doručak uključen</Label>
              </div>
              <div className="space-y-2">
                <Label>Cijena po noćenju (€) <span className="text-muted-foreground text-xs">— automatski iz cjenika</span></Label>
                <Input type="number" step="0.01" value={editRes.price_per_person || 0} onChange={e => setEditRes({ ...editRes, price_per_person: Number(e.target.value) })} />
              </div>
              {editRes.breakfast_included && (
                <div className="space-y-2">
                  <Label>Cijena doručka po osobi (€)</Label>
                  <Input type="number" step="0.01" value={editRes.breakfast_price_per_person || 0} onChange={e => setEditRes({ ...editRes, breakfast_price_per_person: Number(e.target.value) })} />
                </div>
              )}
              <div className="space-y-2">
                <Label>Boravišna taksa po osobi (€)</Label>
                <Input type="number" step="0.01" value={editRes.tourist_tax_per_person || 0} onChange={e => setEditRes({ ...editRes, tourist_tax_per_person: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Način plaćanja</Label>
                  <Select value={editRes.payment_method || 'gotovinski'} onValueChange={v => setEditRes({ ...editRes, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editRes.status || 'reserved'} onValueChange={v => setEditRes({ ...editRes, status: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserved">Rezervirano</SelectItem>
                      <SelectItem value="checked_in">Prijavljen</SelectItem>
                      <SelectItem value="checked_out">Odjavljen</SelectItem>
                      <SelectItem value="cancelled">Otkazano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Izvor</Label>
                  <Select value={editRes.source || 'manual'} onValueChange={v => setEditRes({ ...editRes, source: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Ručno</SelectItem>
                      <SelectItem value="booking_com">Booking.com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editRes.source === 'booking_com' && (
                  <div className="space-y-2">
                    <Label>Booking referenca</Label>
                    <Input value={editRes.booking_reference || ''} onChange={e => setEditRes({ ...editRes, booking_reference: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Napomene</Label>
                <Input value={editRes.notes || ''} onChange={e => setEditRes({ ...editRes, notes: e.target.value })} />
              </div>

              {calc && (
                <div className="border rounded-md p-3 bg-muted/50 text-sm space-y-1">
                  <div className="flex justify-between"><span>Noćenje ({nights} noći × {editRes.price_per_person || 0} €/noć)</span><span>{calc.accommodation.toFixed(2)} €</span></div>
                  {editRes.breakfast_included && <div className="flex justify-between"><span>Doručak ({(editRes.adults || 0) + (editRes.children || 0)} os. × {nights} noći)</span><span>{calc.breakfast.toFixed(2)} €</span></div>}
                  <div className="flex justify-between"><span>Boravišna taksa ({editRes.adults || 0} odr. × {nights} noći)</span><span>{calc.touristTax.toFixed(2)} €</span></div>
                  <div className="flex justify-between font-bold border-t pt-1"><span>UKUPNO</span><span>{calc.total.toFixed(2)} €</span></div>
                </div>
              )}

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
