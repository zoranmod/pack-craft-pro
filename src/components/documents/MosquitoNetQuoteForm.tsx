import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2, Save, Database } from 'lucide-react';
import { toast } from 'sonner';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { useClients } from '@/hooks/useClients';
import { useCreateDocument, useUpdateDocument, useDocument } from '@/hooks/useDocuments';
import { 
  useMosquitoNetProducts, 
  useMosquitoNetLocations, 
  useMosquitoNetQuoteItems,
  useSaveMosquitoNetQuoteItems,
  useSeedMosquitoNetData
} from '@/hooks/useMosquitoNetData';
import type { KomarnikItem, MjerenjeItem, UgradnjaItem } from '@/types/mosquitoNet';

interface MosquitoNetQuoteFormProps {
  documentId?: string;
}

export function MosquitoNetQuoteForm({ documentId }: MosquitoNetQuoteFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditing = !!documentId;

  // Data hooks
  const { data: clients = [] } = useClients();
  const { data: products = [] } = useMosquitoNetProducts();
  const { data: locations = [] } = useMosquitoNetLocations();
  const { data: existingDocument, isLoading: isLoadingDocument } = useDocument(documentId);
  const { data: existingItems = [] } = useMosquitoNetQuoteItems(documentId);
  
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const saveQuoteItems = useSaveMosquitoNetQuoteItems();
  const seedData = useSeedMosquitoNetData();

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Section items
  const [komarnici, setKomarnici] = useState<KomarnikItem[]>([]);
  const [mjerenje, setMjerenje] = useState<MjerenjeItem[]>([]);
  const [ugradnja, setUgradnja] = useState<UgradnjaItem[]>([]);

  // Load existing document data
  useEffect(() => {
    if (existingDocument) {
      setClientName(existingDocument.clientName || '');
      setClientAddress(existingDocument.clientAddress || '');
      setClientPhone(existingDocument.clientPhone || '');
      setClientEmail(existingDocument.clientEmail || '');
      setNotes(existingDocument.notes || '');
    }
  }, [existingDocument]);

  // Load existing items
  useEffect(() => {
    if (existingItems.length > 0) {
      const komarnikItems: KomarnikItem[] = [];
      const mjerenjeItems: MjerenjeItem[] = [];
      const ugradnjaItems: UgradnjaItem[] = [];
      
      existingItems.forEach(item => {
        if (item.section_type === 'komarnici') {
          komarnikItems.push({
            id: item.id,
            product_id: item.product_id || '',
            product_name: item.product_name || '',
            width_cm: item.width_cm || 0,
            height_cm: item.height_cm || 0,
            calculated_m2: item.calculated_m2 || 0,
            unit_price: item.unit_price || 0,
            quantity: item.quantity || 1,
            total: item.total || 0,
          });
        } else if (item.section_type === 'mjerenje') {
          mjerenjeItems.push({
            id: item.id,
            location_id: item.location_id || '',
            location_name: item.location_name || '',
            measurement_price: item.measurement_price || 0,
            total: item.total || 0,
          });
        } else if (item.section_type === 'ugradnja') {
          ugradnjaItems.push({
            id: item.id,
            location_id: item.location_id || '',
            location_name: item.location_name || '',
            window_count: item.window_count || 0,
            door_count: item.door_count || 0,
            window_price: item.window_price || 0,
            door_price: item.door_price || 0,
            total: item.total || 0,
          });
        }
      });
      
      setKomarnici(komarnikItems);
      setMjerenje(mjerenjeItems);
      setUgradnja(ugradnjaItems);
    }
  }, [existingItems]);

  // Client selection handler
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientName(client.name);
      setClientAddress(client.address || '');
      setClientPhone(client.phone || '');
      setClientEmail(client.email || '');
    }
  };

  // Add item handlers
  const addKomarnik = () => {
    setKomarnici([...komarnici, {
      id: crypto.randomUUID(),
      product_id: '',
      product_name: '',
      width_cm: 0,
      height_cm: 0,
      calculated_m2: 0,
      unit_price: 0,
      quantity: 1,
      total: 0,
    }]);
  };

  const addMjerenje = () => {
    setMjerenje([...mjerenje, {
      id: crypto.randomUUID(),
      location_id: '',
      location_name: '',
      measurement_price: 0,
      total: 0,
    }]);
  };

  const addUgradnja = () => {
    setUgradnja([...ugradnja, {
      id: crypto.randomUUID(),
      location_id: '',
      location_name: '',
      window_count: 0,
      door_count: 0,
      window_price: 0,
      door_price: 0,
      total: 0,
    }]);
  };

  // Update komarnik item
  const updateKomarnik = (id: string, field: keyof KomarnikItem, value: string | number) => {
    setKomarnici(items => items.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // If product changed, update price
      if (field === 'product_id') {
        const product = products.find(p => p.id === value);
        if (product) {
          updated.product_name = product.name;
          updated.unit_price = Number(product.price_per_m2);
        }
      }
      
      // Recalculate m2 and total
      const m2 = (updated.width_cm / 100) * (updated.height_cm / 100);
      updated.calculated_m2 = Math.round(m2 * 10000) / 10000;
      updated.total = Math.round(updated.calculated_m2 * updated.unit_price * updated.quantity * 100) / 100;
      
      return updated;
    }));
  };

  // Update mjerenje item
  const updateMjerenje = (id: string, field: keyof MjerenjeItem, value: string | number) => {
    setMjerenje(items => items.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // If location changed, update price
      if (field === 'location_id') {
        const location = locations.find(l => l.id === value);
        if (location) {
          updated.location_name = location.place_name;
          updated.measurement_price = Number(location.measurement_price);
          updated.total = Number(location.measurement_price);
        }
      }
      
      return updated;
    }));
  };

  // Update ugradnja item
  const updateUgradnja = (id: string, field: keyof UgradnjaItem, value: string | number) => {
    setUgradnja(items => items.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: value };
      
      // If location changed, update prices
      if (field === 'location_id') {
        const location = locations.find(l => l.id === value);
        if (location) {
          updated.location_name = location.place_name;
          updated.window_price = Number(location.window_installation_price);
          updated.door_price = Number(location.door_installation_price);
        }
      }
      
      // Recalculate total
      updated.total = (updated.window_count * updated.window_price) + (updated.door_count * updated.door_price);
      
      return updated;
    }));
  };

  // Remove item handlers
  const removeKomarnik = (id: string) => setKomarnici(items => items.filter(i => i.id !== id));
  const removeMjerenje = (id: string) => setMjerenje(items => items.filter(i => i.id !== id));
  const removeUgradnja = (id: string) => setUgradnja(items => items.filter(i => i.id !== id));

  // Calculate totals
  const komarnikTotal = komarnici.reduce((sum, item) => sum + item.total, 0);
  const mjerenjeTotal = mjerenje.reduce((sum, item) => sum + item.total, 0);
  const ugradnjaTotal = ugradnja.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = komarnikTotal + mjerenjeTotal + ugradnjaTotal;

  // Form submission
  const handleSubmit = async () => {
    if (!clientName.trim()) {
      toast.error('Unesite ime klijenta');
      return;
    }

    try {
      // Prepare document data
      const documentData = {
        type: 'ponuda-komarnici' as const,
        clientName,
        clientAddress,
        clientPhone,
        clientEmail,
        notes,
        totalAmount: grandTotal,
        items: [], // Mosquito net quotes don't use standard items
        status: 'draft' as const,
      };

      let docId: string;

      if (isEditing && documentId) {
        await updateDocument.mutateAsync({ id: documentId, data: documentData });
        docId = documentId;
      } else {
        const newDoc = await createDocument.mutateAsync(documentData);
        docId = newDoc.id;
      }

      // Save quote items
      const allItems = [
        ...komarnici.map((item, index) => ({
          document_id: docId,
          section_type: 'komarnici' as const,
          sort_order: index,
          product_id: item.product_id || null,
          product_name: item.product_name,
          width_cm: item.width_cm,
          height_cm: item.height_cm,
          calculated_m2: item.calculated_m2,
          unit_price: item.unit_price,
          quantity: item.quantity,
          location_id: null,
          location_name: null,
          measurement_price: null,
          window_count: 0,
          door_count: 0,
          window_price: null,
          door_price: null,
          total: item.total,
        })),
        ...mjerenje.map((item, index) => ({
          document_id: docId,
          section_type: 'mjerenje' as const,
          sort_order: index,
          product_id: null,
          product_name: null,
          width_cm: null,
          height_cm: null,
          calculated_m2: null,
          unit_price: null,
          quantity: 1,
          location_id: item.location_id || null,
          location_name: item.location_name,
          measurement_price: item.measurement_price,
          window_count: 0,
          door_count: 0,
          window_price: null,
          door_price: null,
          total: item.total,
        })),
        ...ugradnja.map((item, index) => ({
          document_id: docId,
          section_type: 'ugradnja' as const,
          sort_order: index,
          product_id: null,
          product_name: null,
          width_cm: null,
          height_cm: null,
          calculated_m2: null,
          unit_price: null,
          quantity: 1,
          location_id: item.location_id || null,
          location_name: item.location_name,
          measurement_price: null,
          window_count: item.window_count,
          door_count: item.door_count,
          window_price: item.window_price,
          door_price: item.door_price,
          total: item.total,
        })),
      ];

      await saveQuoteItems.mutateAsync({ documentId: docId, items: allItems });

      toast.success(isEditing ? 'Ponuda ažurirana' : 'Ponuda kreirana');
      navigate(`/documents/${docId}`);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Greška pri spremanju ponude');
    }
  };

  if (isLoadingDocument) {
    return <div className="p-8 text-center text-muted-foreground">Učitavanje...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Uredi ponudu za komarnik' : 'Nova ponuda za izradu komarnika'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {products.length === 0 && (
            <Button 
              variant="outline" 
              onClick={() => seedData.mutate()}
              disabled={seedData.isPending}
            >
              <Database className="h-4 w-4 mr-2" />
              Učitaj cjenik
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={createDocument.isPending || updateDocument.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Spremi' : 'Kreiraj ponudu'}
          </Button>
        </div>
      </div>

      {/* Client info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Podaci o kupcu</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Kupac *</Label>
            <ClientAutocomplete
              value={clientName}
              onChange={setClientName}
              onSelect={(client) => handleClientSelect(client.id)}
            />
          </div>
          <div className="space-y-2">
            <Label>Adresa</Label>
            <Input value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Komarnici section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">KOMARNICI</CardTitle>
          <Button variant="outline" size="sm" onClick={addKomarnik}>
            <Plus className="h-4 w-4 mr-1" /> Dodaj red
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">R.br.</TableHead>
                <TableHead>Artikl</TableHead>
                <TableHead className="w-24">Širina (cm)</TableHead>
                <TableHead className="w-24">Dužina (cm)</TableHead>
                <TableHead className="w-20">Kom</TableHead>
                <TableHead className="w-24">m²/kom</TableHead>
                <TableHead className="w-24">€/m²</TableHead>
                <TableHead className="w-28 text-right">Ukupno €</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {komarnici.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    Kliknite "Dodaj red" za unos komarnika
                  </TableCell>
                </TableRow>
              ) : (
                komarnici.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Select value={item.product_id} onValueChange={(v) => updateKomarnik(item.id, 'product_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberi artikl" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.price_per_m2} €/m²)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.width_cm || ''} 
                        onChange={(e) => updateKomarnik(item.id, 'width_cm', Number(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.height_cm || ''} 
                        onChange={(e) => updateKomarnik(item.id, 'height_cm', Number(e.target.value))}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.quantity || ''} 
                        onChange={(e) => updateKomarnik(item.id, 'quantity', Number(e.target.value))}
                        className="w-16"
                        min={1}
                      />
                    </TableCell>
                    <TableCell className="text-right">{item.calculated_m2.toFixed(4)}</TableCell>
                    <TableCell className="text-right">{item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{item.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeKomarnik(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {komarnici.length > 0 && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={7} className="text-right font-medium">Ukupno komarnici:</TableCell>
                  <TableCell className="text-right font-bold">{komarnikTotal.toFixed(2)} €</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mjerenje section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">MJERENJE</CardTitle>
          <Button variant="outline" size="sm" onClick={addMjerenje}>
            <Plus className="h-4 w-4 mr-1" /> Dodaj red
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">R.br.</TableHead>
                <TableHead>Mjesto</TableHead>
                <TableHead className="w-32 text-right">Cijena mjerenja €</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mjerenje.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Kliknite "Dodaj red" za unos mjerenja
                  </TableCell>
                </TableRow>
              ) : (
                mjerenje.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Select value={item.location_id} onValueChange={(v) => updateMjerenje(item.id, 'location_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberi mjesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(l => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.place_name} ({l.measurement_price} €)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeMjerenje(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {mjerenje.length > 0 && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="text-right font-medium">Ukupno mjerenje:</TableCell>
                  <TableCell className="text-right font-bold">{mjerenjeTotal.toFixed(2)} €</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ugradnja section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">UGRADNJA</CardTitle>
          <Button variant="outline" size="sm" onClick={addUgradnja}>
            <Plus className="h-4 w-4 mr-1" /> Dodaj red
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">R.br.</TableHead>
                <TableHead>Mjesto</TableHead>
                <TableHead className="w-24">Prozora</TableHead>
                <TableHead className="w-24">€/prozor</TableHead>
                <TableHead className="w-24">Vrata</TableHead>
                <TableHead className="w-24">€/vrata</TableHead>
                <TableHead className="w-28 text-right">Ukupno €</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ugradnja.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Kliknite "Dodaj red" za unos ugradnje
                  </TableCell>
                </TableRow>
              ) : (
                ugradnja.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Select value={item.location_id} onValueChange={(v) => updateUgradnja(item.id, 'location_id', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberi mjesto" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(l => (
                            <SelectItem key={l.id} value={l.id}>
                              {l.place_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.window_count || ''} 
                        onChange={(e) => updateUgradnja(item.id, 'window_count', Number(e.target.value))}
                        className="w-20"
                        min={0}
                      />
                    </TableCell>
                    <TableCell className="text-right">{item.window_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={item.door_count || ''} 
                        onChange={(e) => updateUgradnja(item.id, 'door_count', Number(e.target.value))}
                        className="w-20"
                        min={0}
                      />
                    </TableCell>
                    <TableCell className="text-right">{item.door_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">{item.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeUgradnja(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {ugradnja.length > 0 && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={6} className="text-right font-medium">Ukupno ugradnja:</TableCell>
                  <TableCell className="text-right font-bold">{ugradnjaTotal.toFixed(2)} €</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Napomena</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dodatne napomene..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Grand total */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <span className="text-xl font-medium">SVEUKUPNO:</span>
            <span className="text-3xl font-bold">{grandTotal.toFixed(2)} €</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
