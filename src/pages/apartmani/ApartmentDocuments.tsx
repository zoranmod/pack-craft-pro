import { useState } from 'react';
import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { DOCUMENT_TYPE_LABELS, PAYMENT_METHODS, type ApartmentDocument } from '@/types/apartment';

export default function ApartmentDocuments() {
  const { ownerUserId } = useApartmentAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Partial<ApartmentDocument> | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

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
      const { id, ...data } = doc as any;
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
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editDoc || !ownerUserId) return;
    upsertDoc.mutate({ ...editDoc, owner_user_id: ownerUserId } as any);
  };

  const filtered = filterType === 'all' ? documents : documents.filter(d => d.document_type === filterType);

  // Summary for "Evidencija računa"
  const invoices = documents.filter(d => d.document_type === 'racun');
  const totalByPayment = PAYMENT_METHODS.map(pm => ({
    ...pm,
    total: invoices.filter(i => i.payment_method === pm.value).reduce((sum, i) => sum + Number(i.total_amount), 0),
    count: invoices.filter(i => i.payment_method === pm.value).length,
  }));

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
                  <TableHead>Plaćanje</TableHead>
                  <TableHead>Iznos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.number}</TableCell>
                    <TableCell><Badge variant="outline">{DOCUMENT_TYPE_LABELS[d.document_type] || d.document_type}</Badge></TableCell>
                    <TableCell>{d.date}</TableCell>
                    <TableCell>{d.guest_name || '-'}</TableCell>
                    <TableCell>{PAYMENT_METHODS.find(p => p.value === d.payment_method)?.label || '-'}</TableCell>
                    <TableCell>{Number(d.total_amount).toFixed(2)} €</TableCell>
                    <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeDoc.mutate(d.id)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Nema dokumenata</TableCell></TableRow>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novi {DOCUMENT_TYPE_LABELS[editDoc?.document_type || ''] || 'dokument'}</DialogTitle>
          </DialogHeader>
          {editDoc && (
            <div className="space-y-4">
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
              <Button className="w-full" onClick={handleSave} disabled={upsertDoc.isPending}>
                {upsertDoc.isPending ? 'Spremanje...' : 'Spremi'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ApartmentLayout>
  );
}
