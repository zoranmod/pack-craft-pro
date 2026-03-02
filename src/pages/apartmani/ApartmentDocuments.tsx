import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { useApartmentUnits } from '@/hooks/useApartmentUnits';
import { useApartmentPriceList } from '@/hooks/useApartmentPriceList';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DOCUMENT_TYPE_LABELS, PAYMENT_METHODS, type ApartmentDocument } from '@/types/apartment';
import { differenceInCalendarDays } from 'date-fns';

interface DocFormState extends Partial<ApartmentDocument> {
  unit_id?: string;
  adults?: number;
  children?: number;
  breakfast_included?: boolean;
  check_in?: string;
  check_out?: string;
}

export default function ApartmentDocuments() {
  const navigate = useNavigate();
  const { ownerUserId } = useApartmentAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<DocFormState | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const { units } = useApartmentUnits(ownerUserId);
  const { getPrice, priceList } = useApartmentPriceList(ownerUserId);

  const { data: documents = [] } = useQuery({
    queryKey: ['apartment-documents', ownerUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartment_documents')
        .select('*')
        .eq('owner_user_id', ownerUserId!)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as ApartmentDocument[];
    },
    enabled: !!ownerUserId,
  });

  const upsertDoc = useMutation({
    mutationFn: async (doc: Partial<ApartmentDocument> & { owner_user_id: string }) => {
      // Strip non-db fields
      const { unit_id, adults, children, breakfast_included, check_in, check_out, ...rest } = doc as any;
      const { id, ...data } = rest;
      if (id) {
        const { error } = await supabase.from('apartment_documents').update(data).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('apartment_documents').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-documents'] });
      toast.success('Dokument spremljen');
      setDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeDoc = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('apartment_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-documents'] });
      toast.success('Dokument obrisan');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = (type: string) => {
    const nextNum = documents.filter(d => d.document_type === type).length + 1;
    setEditDoc({
      document_type: type as any,
      number: String(nextNum),
      date: new Date().toISOString().split('T')[0],
      total_amount: 0,
      status: 'draft',
      guest_name: '',
      payment_method: 'gotovinski',
      deposit_amount: 80,
      validity_days: 7,
      unit_id: '',
      adults: 1,
      children: 0,
      breakfast_included: false,
      check_in: new Date().toISOString().split('T')[0],
      check_out: '',
    });
    setDialogOpen(true);
  };

  const openEdit = (doc: ApartmentDocument) => {
    // Parse pdf_data for saved calculation fields
    const pdfData = doc.pdf_data || {};
    setEditDoc({
      ...doc,
      unit_id: pdfData.unit_id || '',
      adults: pdfData.adults || 1,
      children: pdfData.children || 0,
      breakfast_included: pdfData.breakfast_included || false,
      check_in: pdfData.check_in || doc.date,
      check_out: pdfData.check_out || '',
    });
    setDialogOpen(true);
  };

  // Auto-calculate total when relevant fields change
  useEffect(() => {
    if (!editDoc || !editDoc.unit_id || !editDoc.check_in || !editDoc.check_out) return;

    const unit = units.find(u => u.id === editDoc.unit_id);
    if (!unit) return;

    const nights = differenceInCalendarDays(new Date(editDoc.check_out), new Date(editDoc.check_in));
    if (nights <= 0) return;

    const persons = (editDoc.adults || 1) + (editDoc.children || 0);
    const nightlyRate = getPrice(unit.unit_type as 'apartment' | 'room', persons, editDoc.breakfast_included || false);

    if (nightlyRate > 0) {
      const total = nightlyRate * nights;
      setEditDoc(prev => prev ? { ...prev, total_amount: total } : prev);
    }
  }, [editDoc?.unit_id, editDoc?.adults, editDoc?.children, editDoc?.breakfast_included, editDoc?.check_in, editDoc?.check_out, units, priceList]);

  const handleSave = () => {
    if (!editDoc || !ownerUserId) return;
    // Save calculation data in pdf_data for later retrieval
    const pdfData = {
      unit_id: editDoc.unit_id,
      adults: editDoc.adults,
      children: editDoc.children,
      breakfast_included: editDoc.breakfast_included,
      check_in: editDoc.check_in,
      check_out: editDoc.check_out,
      unit_name: units.find(u => u.id === editDoc.unit_id)?.name || '',
    };
    upsertDoc.mutate({
      ...editDoc,
      pdf_data: pdfData,
      owner_user_id: ownerUserId,
    } as any);
  };

  const filtered = filterType === 'all' ? documents : documents.filter(d => d.document_type === filterType);

  const invoices = documents.filter(d => d.document_type === 'racun');
  const totalByPayment = PAYMENT_METHODS.map(pm => ({
    ...pm,
    total: invoices.filter(i => i.payment_method === pm.value).reduce((sum, i) => sum + Number(i.total_amount), 0),
    count: invoices.filter(i => i.payment_method === pm.value).length,
  }));

  const selectedUnit = units.find(u => u.id === editDoc?.unit_id);
  const nights = editDoc?.check_in && editDoc?.check_out
    ? differenceInCalendarDays(new Date(editDoc.check_out), new Date(editDoc.check_in))
    : 0;

  return (
    <ApartmentLayout title="Dokumenti">
      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">Svi dokumenti</TabsTrigger>
          <TabsTrigger value="registry">Evidencija računa</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi tipovi</SelectItem>
                  {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                <Button key={k} size="sm" variant="outline" onClick={() => openNew(k)}>
                  <Plus className="h-4 w-4 mr-1" /> {v}
                </Button>
              ))}
            </div>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Br.</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Gost / Kupac</TableHead>
                  <TableHead>Smještaj</TableHead>
                  <TableHead>Plaćanje</TableHead>
                  <TableHead>Iznos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow
                    key={d.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openEdit(d)}
                  >
                    <TableCell className="font-medium">{d.number}</TableCell>
                    <TableCell><Badge variant="outline">{DOCUMENT_TYPE_LABELS[d.document_type] || d.document_type}</Badge></TableCell>
                    <TableCell>{d.date}</TableCell>
                    <TableCell>{d.guest_name || '-'}</TableCell>
                    <TableCell>{(d.pdf_data as any)?.unit_name || '-'}</TableCell>
                    <TableCell>{PAYMENT_METHODS.find(p => p.value === d.payment_method)?.label || '-'}</TableCell>
                    <TableCell>{Number(d.total_amount).toFixed(2)} €</TableCell>
                    <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Otvori PDF"
                          onClick={(e) => { e.stopPropagation(); navigate(`/apartmani/pdf/${d.id}`); }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); removeDoc.mutate(d.id); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Nema dokumenata</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="registry">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {totalByPayment.map(pm => (
                <div key={pm.value} className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">{pm.label}</p>
                  <p className="text-2xl font-bold">{pm.total.toFixed(2)} €</p>
                  <p className="text-xs text-muted-foreground">{pm.count} računa</p>
                </div>
              ))}
            </div>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>R.br.</TableHead>
                    <TableHead>Način plaćanja</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Iznos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv, i) => (
                    <TableRow key={inv.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{PAYMENT_METHODS.find(p => p.value === inv.payment_method)?.label || inv.payment_method}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell className="font-medium">{Number(inv.total_amount).toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                  {invoices.length > 0 && (
                    <TableRow className="font-bold">
                      <TableCell colSpan={3}>UKUPNO</TableCell>
                      <TableCell>{invoices.reduce((s, i) => s + Number(i.total_amount), 0).toFixed(2)} €</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editDoc?.id ? 'Uredi' : 'Novi'} {DOCUMENT_TYPE_LABELS[editDoc?.document_type || ''] || 'dokument'}
            </DialogTitle>
          </DialogHeader>
          {editDoc && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Broj</Label>
                  <Input value={editDoc.number || ''} onChange={e => setEditDoc({ ...editDoc, number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Datum</Label>
                  <Input type="date" value={editDoc.date || ''} onChange={e => setEditDoc({ ...editDoc, date: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Gost / Kupac</Label>
                <Input value={editDoc.guest_name || ''} onChange={e => setEditDoc({ ...editDoc, guest_name: e.target.value })} />
              </div>

              {/* Unit selection */}
              <div className="space-y-2">
                <Label>Smještajna jedinica</Label>
                <Select value={editDoc.unit_id || ''} onValueChange={v => setEditDoc({ ...editDoc, unit_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Odaberi apartman ili sobu" /></SelectTrigger>
                  <SelectContent>
                    {units.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.unit_type === 'apartment' ? 'Apartman' : 'Soba'}, kapacitet: {u.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Check-in / Check-out */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dolazak</Label>
                  <Input type="date" value={editDoc.check_in || ''} onChange={e => setEditDoc({ ...editDoc, check_in: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Odlazak</Label>
                  <Input type="date" value={editDoc.check_out || ''} onChange={e => setEditDoc({ ...editDoc, check_out: e.target.value })} />
                </div>
              </div>

              {nights > 0 && (
                <p className="text-sm text-muted-foreground">Broj noćenja: <strong>{nights}</strong></p>
              )}

              {/* Persons */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Broj odraslih</Label>
                  <Input type="number" min={1} value={editDoc.adults || 1} onChange={e => setEditDoc({ ...editDoc, adults: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Broj djece</Label>
                  <Input type="number" min={0} value={editDoc.children || 0} onChange={e => setEditDoc({ ...editDoc, children: Number(e.target.value) })} />
                </div>
              </div>

              {/* Breakfast toggle */}
              <div className="flex items-center gap-3">
                <Switch
                  checked={editDoc.breakfast_included || false}
                  onCheckedChange={v => setEditDoc({ ...editDoc, breakfast_included: v })}
                />
                <Label>Doručak uključen</Label>
              </div>

              {/* Auto-calculated info */}
              {selectedUnit && nights > 0 && (
                <div className="bg-muted/50 rounded-md p-3 text-sm space-y-1">
                  <p>Jedinica: <strong>{selectedUnit.name}</strong></p>
                  <p>Osobe: <strong>{(editDoc.adults || 1) + (editDoc.children || 0)}</strong></p>
                  <p>Cijena po noći (iz cjenika): <strong>
                    {getPrice(
                      selectedUnit.unit_type as 'apartment' | 'room',
                      (editDoc.adults || 1) + (editDoc.children || 0),
                      editDoc.breakfast_included || false
                    ).toFixed(2)} €
                  </strong></p>
                  <p>Noćenja: <strong>{nights}</strong></p>
                  <p className="text-base font-semibold">Ukupno: {Number(editDoc.total_amount || 0).toFixed(2)} €</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Način plaćanja</Label>
                  <Select value={editDoc.payment_method || 'gotovinski'} onValueChange={v => setEditDoc({ ...editDoc, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ukupan iznos (€)</Label>
                  <Input type="number" step="0.01" value={editDoc.total_amount || 0} onChange={e => setEditDoc({ ...editDoc, total_amount: Number(e.target.value) })} />
                </div>
              </div>

              {editDoc.document_type === 'ponuda' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rok važenja (dana)</Label>
                    <Input type="number" value={editDoc.validity_days || 7} onChange={e => setEditDoc({ ...editDoc, validity_days: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Predujam (€)</Label>
                    <Input type="number" step="0.01" value={editDoc.deposit_amount || 80} onChange={e => setEditDoc({ ...editDoc, deposit_amount: Number(e.target.value) })} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Napomene</Label>
                <Input value={editDoc.notes || ''} onChange={e => setEditDoc({ ...editDoc, notes: e.target.value })} />
              </div>

              <div className="flex gap-2">
                {editDoc.id && (
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/apartmani/pdf/${editDoc.id}`)}>
                    <FileText className="h-4 w-4 mr-1" /> Otvori PDF
                  </Button>
                )}
                <Button className="flex-1" onClick={handleSave} disabled={upsertDoc.isPending}>
                  {upsertDoc.isPending ? 'Spremanje...' : 'Spremi'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ApartmentLayout>
  );
}
