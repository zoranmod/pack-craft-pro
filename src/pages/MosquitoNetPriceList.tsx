import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Pencil, Trash2, Database, Package, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  useMosquitoNetProducts,
  useMosquitoNetLocations,
  useCreateMosquitoNetProduct,
  useUpdateMosquitoNetProduct,
  useDeleteMosquitoNetProduct,
  useCreateMosquitoNetLocation,
  useUpdateMosquitoNetLocation,
  useDeleteMosquitoNetLocation,
  useSeedMosquitoNetData,
  useResetMosquitoNetData,
} from '@/hooks/useMosquitoNetData';
import type { MosquitoNetProduct, MosquitoNetLocation } from '@/types/mosquitoNet';

export default function MosquitoNetPriceList() {
  const navigate = useNavigate();
  
  const { data: products = [], isLoading: isLoadingProducts } = useMosquitoNetProducts();
  const { data: locations = [], isLoading: isLoadingLocations } = useMosquitoNetLocations();
  
  const createProduct = useCreateMosquitoNetProduct();
  const updateProduct = useUpdateMosquitoNetProduct();
  const deleteProduct = useDeleteMosquitoNetProduct();
  
  const createLocation = useCreateMosquitoNetLocation();
  const updateLocation = useUpdateMosquitoNetLocation();
  const deleteLocation = useDeleteMosquitoNetLocation();
  
  const seedData = useSeedMosquitoNetData();
  const resetData = useResetMosquitoNetData();

  // Product form state
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MosquitoNetProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    code: '',
    price_per_m2: 0,
    color: '',
    product_type: '',
    sort_order: 0,
  });

  // Location form state
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MosquitoNetLocation | null>(null);
  const [locationForm, setLocationForm] = useState({
    place_name: '',
    measurement_price: 0,
    window_installation_price: 0,
    door_installation_price: 0,
    sort_order: 0,
  });

  // Product handlers
  const openProductDialog = (product?: MosquitoNetProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        code: product.code || '',
        price_per_m2: Number(product.price_per_m2),
        color: product.color || '',
        product_type: product.product_type || '',
        sort_order: product.sort_order,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        code: '',
        price_per_m2: 0,
        color: '',
        product_type: '',
        sort_order: products.length,
      });
    }
    setProductDialogOpen(true);
  };

  const saveProduct = async () => {
    if (!productForm.name.trim()) {
      toast.error('Unesite naziv proizvoda');
      return;
    }

    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, ...productForm });
    } else {
      await createProduct.mutateAsync(productForm);
    }
    setProductDialogOpen(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovaj proizvod?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  // Location handlers
  const openLocationDialog = (location?: MosquitoNetLocation) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        place_name: location.place_name,
        measurement_price: Number(location.measurement_price),
        window_installation_price: Number(location.window_installation_price),
        door_installation_price: Number(location.door_installation_price),
        sort_order: location.sort_order,
      });
    } else {
      setEditingLocation(null);
      setLocationForm({
        place_name: '',
        measurement_price: 0,
        window_installation_price: 0,
        door_installation_price: 0,
        sort_order: locations.length,
      });
    }
    setLocationDialogOpen(true);
  };

  const saveLocation = async () => {
    if (!locationForm.place_name.trim()) {
      toast.error('Unesite naziv mjesta');
      return;
    }

    if (editingLocation) {
      await updateLocation.mutateAsync({ id: editingLocation.id, ...locationForm });
    } else {
      await createLocation.mutateAsync(locationForm);
    }
    setLocationDialogOpen(false);
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovu lokaciju?')) {
      await deleteLocation.mutateAsync(id);
    }
  };

  return (
    <MainLayout title="Cjenik komarnika">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Cjenik komarnika</h1>
              <p className="text-muted-foreground">Upravljajte proizvodima i lokacijama za komarnik ponude</p>
            </div>
          </div>
          <div className="flex gap-2">
            {products.length === 0 && locations.length === 0 ? (
              <Button onClick={() => seedData.mutate(false)} disabled={seedData.isPending}>
                <Database className="h-4 w-4 mr-2" />
                Učitaj početne podatke
              </Button>
            ) : (
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (confirm('Jeste li sigurni? Ovo će obrisati sve proizvode i lokacije i učitati zadane podatke.')) {
                    resetData.mutate();
                  }
                }} 
                disabled={resetData.isPending}
              >
                <Database className="h-4 w-4 mr-2" />
                Resetiraj cjenik
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Proizvodi ({products.length})
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-2">
              <MapPin className="h-4 w-4" />
              Lokacije ({locations.length})
            </TabsTrigger>
          </TabsList>

          {/* Products tab */}
          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Proizvodi komarnika</CardTitle>
                  <CardDescription>Tipovi komarnika s cijenama po m²</CardDescription>
                </div>
                <Button onClick={() => openProductDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novi proizvod
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingProducts ? (
                  <div className="text-center py-8 text-muted-foreground">Učitavanje...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nema proizvoda. Kliknite "Učitaj početne podatke" ili dodajte proizvode ručno.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Šifra</TableHead>
                        <TableHead>Naziv</TableHead>
                        <TableHead>Tip</TableHead>
                        <TableHead>Boja</TableHead>
                        <TableHead className="text-right">Cijena/m² €</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(product => (
                        <TableRow key={product.id}>
                          <TableCell className="font-mono">{product.code}</TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.product_type}</TableCell>
                          <TableCell>{product.color}</TableCell>
                          <TableCell className="text-right font-medium">{Number(product.price_per_m2).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openProductDialog(product)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations tab */}
          <TabsContent value="locations" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Lokacije</CardTitle>
                  <CardDescription>Mjesta s cijenama mjerenja i ugradnje</CardDescription>
                </div>
                <Button onClick={() => openLocationDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova lokacija
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingLocations ? (
                  <div className="text-center py-8 text-muted-foreground">Učitavanje...</div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nema lokacija. Kliknite "Učitaj početne podatke" ili dodajte lokacije ručno.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mjesto</TableHead>
                        <TableHead className="text-right">Mjerenje €</TableHead>
                        <TableHead className="text-right">Ugradnja prozor €</TableHead>
                        <TableHead className="text-right">Ugradnja vrata €</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map(location => (
                        <TableRow key={location.id}>
                          <TableCell className="font-medium">{location.place_name}</TableCell>
                          <TableCell className="text-right">{Number(location.measurement_price).toFixed(2)}</TableCell>
                          <TableCell className="text-right">{Number(location.window_installation_price).toFixed(2)}</TableCell>
                          <TableCell className="text-right">{Number(location.door_installation_price).toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openLocationDialog(location)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteLocation(location.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Uredi proizvod' : 'Novi proizvod'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Naziv *</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Prozor komarnik BIJELI"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Šifra</Label>
                  <Input
                    value={productForm.code}
                    onChange={(e) => setProductForm({ ...productForm, code: e.target.value })}
                    placeholder="PK-B"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cijena/m² €</Label>
                  <Input
                    type="number"
                    value={productForm.price_per_m2 || ''}
                    onChange={(e) => setProductForm({ ...productForm, price_per_m2: Number(e.target.value) })}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tip</Label>
                  <Select 
                    value={productForm.product_type} 
                    onValueChange={(v) => setProductForm({ ...productForm, product_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prozor">Prozor</SelectItem>
                      <SelectItem value="vrata">Vrata</SelectItem>
                      <SelectItem value="rolo">Rolo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Boja</Label>
                  <Select 
                    value={productForm.color} 
                    onValueChange={(v) => setProductForm({ ...productForm, color: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bijeli">Bijeli</SelectItem>
                      <SelectItem value="smeđi">Smeđi</SelectItem>
                      <SelectItem value="antracit">Antracit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setProductDialogOpen(false)}>Odustani</Button>
                <Button onClick={saveProduct} disabled={createProduct.isPending || updateProduct.isPending}>
                  Spremi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Location dialog */}
        <Dialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLocation ? 'Uredi lokaciju' : 'Nova lokacija'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Naziv mjesta *</Label>
                <Input
                  value={locationForm.place_name}
                  onChange={(e) => setLocationForm({ ...locationForm, place_name: e.target.value })}
                  placeholder="Zagreb"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Mjerenje €</Label>
                  <Input
                    type="number"
                    value={locationForm.measurement_price || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, measurement_price: Number(e.target.value) })}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ugradnja prozor €</Label>
                  <Input
                    type="number"
                    value={locationForm.window_installation_price || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, window_installation_price: Number(e.target.value) })}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ugradnja vrata €</Label>
                  <Input
                    type="number"
                    value={locationForm.door_installation_price || ''}
                    onChange={(e) => setLocationForm({ ...locationForm, door_installation_price: Number(e.target.value) })}
                    min={0}
                    step={0.01}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setLocationDialogOpen(false)}>Odustani</Button>
                <Button onClick={saveLocation} disabled={createLocation.isPending || updateLocation.isPending}>
                  Spremi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
