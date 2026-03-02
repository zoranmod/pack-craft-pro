import { useState } from 'react';
import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { useApartmentUnits } from '@/hooks/useApartmentUnits';
import { useApartmentPriceList } from '@/hooks/useApartmentPriceList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, BedDouble, Building2 } from 'lucide-react';
import type { ApartmentUnit, ApartmentPriceEntry } from '@/types/apartment';

export default function ApartmentUnits() {
  const { ownerUserId } = useApartmentAuth();
  const { units, isLoading, upsert, remove } = useApartmentUnits(ownerUserId);
  const { priceList, upsert: upsertPrice } = useApartmentPriceList(ownerUserId);
  const [editUnit, setEditUnit] = useState<Partial<ApartmentUnit> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openNew = () => {
    setEditUnit({ name: '', unit_type: 'apartment', capacity: 2, price_per_person: 0, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (u: ApartmentUnit) => {
    setEditUnit({ ...u });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editUnit || !ownerUserId) return;
    upsert.mutate({ ...editUnit, owner_user_id: ownerUserId } as any, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  // Price list grouped by unit type
  const apartmentPrices = priceList.filter(p => p.unit_type === 'apartment');
  const roomPrices = priceList.filter(p => p.unit_type === 'room');

  const handlePriceChange = (unitType: 'apartment' | 'room', persons: number, field: 'price_without_breakfast' | 'price_with_breakfast', value: number) => {
    if (!ownerUserId) return;
    const existing = priceList.find(p => p.unit_type === unitType && p.persons === persons);
    upsertPrice.mutate({
      ...(existing ? { id: existing.id } : {}),
      owner_user_id: ownerUserId,
      unit_type: unitType,
      persons,
      price_without_breakfast: field === 'price_without_breakfast' ? value : (existing?.price_without_breakfast || 0),
      price_with_breakfast: field === 'price_with_breakfast' ? value : (existing?.price_with_breakfast || 0),
    } as any);
  };

  const maxPersons = (type: 'apartment' | 'room') => type === 'apartment' ? 6 : 3;

  return (
    <ApartmentLayout title="Smještajne jedinice i cjenik">
      <Tabs defaultValue="units">
        <TabsList>
          <TabsTrigger value="units">Jedinice</TabsTrigger>
          <TabsTrigger value="prices">Cjenik</TabsTrigger>
        </TabsList>

        <TabsContent value="units">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">{units.length} jedinica</p>
            <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" /> Nova jedinica</Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map(u => (
              <Card key={u.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {u.unit_type === 'apartment' ? <Building2 className="h-5 w-5 text-primary" /> : <BedDouble className="h-5 w-5 text-primary" />}
                      <div>
                        <h3 className="font-medium">{u.name}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {u.unit_type === 'apartment' ? 'Apartman' : 'Soba'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove.mutate(u.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">Kapacitet:</span> {u.capacity} osoba
                  </div>
                  {u.description && <p className="mt-2 text-sm text-muted-foreground">{u.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prices">
          <div className="space-y-6">
            {(['apartment', 'room'] as const).map(type => (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    {type === 'apartment' ? <Building2 className="h-4 w-4" /> : <BedDouble className="h-4 w-4" />}
                    {type === 'apartment' ? 'Apartman' : 'Soba'} — Cijene po noćenju (€)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Broj osoba</TableHead>
                        <TableHead>Bez doručka (€)</TableHead>
                        <TableHead>S doručkom (€)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: maxPersons(type) }, (_, i) => i + 1).map(persons => {
                        const entry = priceList.find(p => p.unit_type === type && p.persons === persons);
                        return (
                          <TableRow key={persons}>
                            <TableCell className="font-medium">{persons} {persons === 1 ? 'osoba' : persons < 5 ? 'osobe' : 'osoba'}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                className="w-28"
                                value={entry?.price_without_breakfast ?? ''}
                                placeholder="0.00"
                                onBlur={e => handlePriceChange(type, persons, 'price_without_breakfast', Number(e.target.value))}
                                onChange={() => {}}
                                defaultValue={entry?.price_without_breakfast || ''}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                className="w-28"
                                value={entry?.price_with_breakfast ?? ''}
                                placeholder="0.00"
                                onBlur={e => handlePriceChange(type, persons, 'price_with_breakfast', Number(e.target.value))}
                                onChange={() => {}}
                                defaultValue={entry?.price_with_breakfast || ''}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUnit?.id ? 'Uredi jedinicu' : 'Nova jedinica'}</DialogTitle>
          </DialogHeader>
          {editUnit && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Naziv</Label>
                <Input value={editUnit.name || ''} onChange={e => setEditUnit({ ...editUnit, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select value={editUnit.unit_type || 'apartment'} onValueChange={v => setEditUnit({ ...editUnit, unit_type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartman</SelectItem>
                    <SelectItem value="room">Soba</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kapacitet (osoba)</Label>
                <Input type="number" value={editUnit.capacity || 0} onChange={e => setEditUnit({ ...editUnit, capacity: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Opis</Label>
                <Input value={editUnit.description || ''} onChange={e => setEditUnit({ ...editUnit, description: e.target.value })} />
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
