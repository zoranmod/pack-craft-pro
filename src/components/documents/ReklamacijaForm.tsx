import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Loader2, AlertCircle, Building2 } from 'lucide-react';
import { DocumentItem, documentTypeLabels } from '@/types/document';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDocument, useDocument, useUpdateDocument } from '@/hooks/useDocuments';
import { ArticleAutocomplete } from '@/components/articles/ArticleAutocomplete';
import { Article } from '@/hooks/useArticles';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useSettings';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { useSuppliers } from '@/hooks/useSuppliers';

interface ReklamacijaFormProps {
  documentId?: string;
}

export function ReklamacijaForm({ documentId }: ReklamacijaFormProps) {
  const navigate = useNavigate();
  const isEditMode = !!documentId;
  
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { employee } = useCurrentEmployee();
  const { data: suppliers = [] } = useSuppliers();

  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const { data: existingDocument, isLoading: isLoadingDocument } = useDocument(documentId || '');

  const [formData, setFormData] = useState({
    supplierName: '',
    supplierAddress: '',
    supplierOib: '',
    supplierContact: '',
    pickupDate: '',
    receivedBy: '',
    companyRepresentative: '',
    notes: '',
  });

  const [items, setItems] = useState<(Omit<DocumentItem, 'id'> & { invoiceNumber?: string })[]>([
    { name: '', code: '', quantity: 1, unit: 'kom', price: 0, discount: 0, pdv: 0, subtotal: 0, total: 0, invoiceNumber: '' },
  ]);

  const [validationErrors, setValidationErrors] = useState<{
    supplierName?: string;
  }>({});

  // Load existing document data when in edit mode
  useEffect(() => {
    if (isEditMode && existingDocument) {
      setFormData({
        supplierName: existingDocument.supplierName || '',
        supplierAddress: existingDocument.supplierAddress || '',
        supplierOib: existingDocument.supplierOib || '',
        supplierContact: existingDocument.supplierContact || '',
        pickupDate: existingDocument.pickupDate || '',
        receivedBy: existingDocument.receivedBy || '',
        companyRepresentative: existingDocument.companyRepresentative || '',
        notes: existingDocument.notes || '',
      });
      setItems(existingDocument.items.map(item => ({
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        unit: item.unit,
        price: 0,
        discount: 0,
        pdv: 0,
        subtotal: 0,
        total: 0,
        invoiceNumber: item.invoiceNumber || '',
      })));
    }
  }, [isEditMode, existingDocument]);

  // Auto-fill companyRepresentative with current user's name when creating new document
  useEffect(() => {
    if (!isEditMode) {
      const fullName = employee?.first_name || employee?.last_name
        ? [employee.first_name, employee.last_name].filter(Boolean).join(' ')
        : userProfile?.first_name || userProfile?.last_name
          ? [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ')
          : null;
      
      if (fullName && !formData.companyRepresentative) {
        setFormData(prev => ({ ...prev, companyRepresentative: fullName }));
      }
    }
  }, [isEditMode, employee, userProfile]);

  const addItem = () => {
    setItems([...items, { name: '', code: '', quantity: 1, unit: 'kom', price: 0, discount: 0, pdv: 0, subtotal: 0, total: 0, invoiceNumber: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSupplierSelect = (supplier: any) => {
    setFormData(prev => ({
      ...prev,
      supplierName: supplier.name,
      supplierAddress: [supplier.address, supplier.postal_code, supplier.city].filter(Boolean).join(', '),
      supplierOib: supplier.oib || '',
      supplierContact: supplier.contact_person || '',
    }));
    if (validationErrors.supplierName) {
      setValidationErrors(prev => ({ ...prev, supplierName: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: typeof validationErrors = {};
    
    if (!formData.supplierName || formData.supplierName.trim() === '') {
      errors.supplierName = 'Naziv dobavljača je obavezan';
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error(errors.supplierName || 'Molimo ispravite greške u obrascu');
      return;
    }

    const documentData = {
      type: 'reklamacija' as const,
      // Use supplier info as client info for document storage
      clientName: formData.supplierName,
      clientAddress: formData.supplierAddress,
      clientOib: formData.supplierOib || undefined,
      notes: formData.notes || undefined,
      items: items.map(item => ({
        name: item.name,
        code: item.code,
        quantity: item.quantity,
        unit: item.unit,
        price: 0,
        discount: 0,
        pdv: 0,
        subtotal: 0,
        total: 0,
        invoiceNumber: item.invoiceNumber,
      })),
      // Reklamacija specific fields
      supplierName: formData.supplierName,
      supplierAddress: formData.supplierAddress,
      supplierOib: formData.supplierOib || undefined,
      supplierContact: formData.supplierContact || undefined,
      pickupDate: formData.pickupDate || undefined,
      receivedBy: formData.receivedBy || undefined,
      companyRepresentative: formData.companyRepresentative || undefined,
    };

    try {
      if (isEditMode && documentId) {
        await updateDocument.mutateAsync({ id: documentId, data: documentData });
      } else {
        await createDocument.mutateAsync(documentData);
      }
      navigate('/reklamacije');
    } catch (error) {
      // Error handled by hooks
    }
  };

  const isSaving = createDocument.isPending || updateDocument.isPending;

  if (isEditMode && isLoadingDocument) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background py-4 -mx-4 px-4 border-b border-border shadow-sm flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag
        </Button>
        <Button type="submit" className="gap-2 btn-float" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditMode ? 'Spremi promjene' : 'Spremi dokument'}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Document Type - Read Only */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Vrsta dokumenta</h2>
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md border border-border">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {documentTypeLabels['reklamacija']}
              </span>
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Podaci o dobavljaču</h2>
            
            {/* Quick Supplier Picker */}
            {suppliers.length > 0 && (
              <div className="mb-4">
                <Label className="text-muted-foreground text-sm">Brzi odabir dobavljača</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    const supplier = suppliers.find(s => s.id === value);
                    if (supplier) handleSupplierSelect(supplier);
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi dobavljača..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="supplierName" className={validationErrors.supplierName ? 'text-destructive' : ''}>
                  Naziv dobavljača *
                </Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => {
                    setFormData({ ...formData, supplierName: e.target.value });
                    if (validationErrors.supplierName) {
                      setValidationErrors(prev => ({ ...prev, supplierName: undefined }));
                    }
                  }}
                  placeholder="Unesite naziv dobavljača"
                  className={cn("mt-1.5", validationErrors.supplierName && "border-destructive focus-visible:ring-destructive")}
                />
                {validationErrors.supplierName && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.supplierName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="supplierOib">OIB</Label>
                <Input
                  id="supplierOib"
                  value={formData.supplierOib}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({ ...formData, supplierOib: value });
                  }}
                  placeholder="12345678901"
                  maxLength={11}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="supplierAddress">Adresa</Label>
                <Input
                  id="supplierAddress"
                  value={formData.supplierAddress}
                  onChange={(e) => setFormData({ ...formData, supplierAddress: e.target.value })}
                  placeholder="Unesite adresu dobavljača"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="supplierContact">Kontakt osoba</Label>
                <Input
                  id="supplierContact"
                  value={formData.supplierContact}
                  onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                  placeholder="Ime i prezime kontakt osobe"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pickupDate">Datum preuzimanja</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <div className="sticky top-20 z-40 bg-card -mx-6 px-6 py-3 mb-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Stavke za reklamaciju</h2>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj stavku
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-3">
                  <div className="grid gap-3 sm:grid-cols-12 items-start">
                    <div className="sm:col-span-2">
                      <Label>Šifra</Label>
                      <Input
                        value={item.code || ''}
                        onChange={(e) => updateItem(index, 'code', e.target.value)}
                        placeholder="Šifra"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <Label>Naziv artikla</Label>
                      <div className="mt-1.5">
                        <ArticleAutocomplete
                          value={item.name}
                          onChange={(value) => updateItem(index, 'name', value)}
                          onSelect={(article: Article) => {
                            const newItems = [...items];
                            newItems[index] = {
                              ...newItems[index],
                              name: article.name,
                              code: article.code || '',
                              unit: article.unit,
                            };
                            setItems(newItems);
                          }}
                          placeholder="Naziv stavke"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Jed. mjera</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateItem(index, 'unit', value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kom">kom</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="m²">m²</SelectItem>
                          <SelectItem value="usluga">usluga</SelectItem>
                          <SelectItem value="sat">sat</SelectItem>
                          <SelectItem value="kpl">kpl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="sm:col-span-1">
                      <Label>Količina</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>Broj računa</Label>
                      <Input
                        value={item.invoiceNumber || ''}
                        onChange={(e) => updateItem(index, 'invoiceNumber', e.target.value)}
                        placeholder="RAC-0001/25"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1.5"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Napomena</h2>
            <AutoResizeTextarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Unesite napomenu o reklamaciji (opis problema, razlog povrata, itd.)"
              className="min-h-[100px]"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Signatures */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Potpisi</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="receivedBy">Robu preuzeo</Label>
                <Input
                  id="receivedBy"
                  value={formData.receivedBy}
                  onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                  placeholder="Ime i prezime osobe koja je preuzela robu"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="companyRepresentative">Za Akord d.o.o.</Label>
                <Input
                  id="companyRepresentative"
                  value={formData.companyRepresentative}
                  onChange={(e) => setFormData({ ...formData, companyRepresentative: e.target.value })}
                  placeholder="Ime i prezime predstavnika tvrtke"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Sažetak</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Broj stavki:</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ukupna količina:</span>
                <span className="font-medium">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
