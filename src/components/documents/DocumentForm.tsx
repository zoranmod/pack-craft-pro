import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { DocumentType, DocumentItem, documentTypeLabels } from '@/types/document';
import { ContractArticleFormData } from '@/types/contractArticle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDocument } from '@/hooks/useDocuments';
import { useContractArticleTemplates, useSaveDocumentContractArticles, useInitializeDefaultTemplates } from '@/hooks/useContractArticles';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { ArticleAutocomplete } from '@/components/articles/ArticleAutocomplete';
import { ContractArticlesEditor } from '@/components/contracts/ContractArticlesEditor';
import { Client } from '@/hooks/useClients';
import { Article } from '@/hooks/useArticles';

// Helper function to calculate item totals
const calculateItemTotals = (item: Omit<DocumentItem, 'id'>) => {
  const subtotal = item.quantity * item.price;
  const discountAmount = subtotal * (item.discount / 100);
  const afterDiscount = subtotal - discountAmount;
  const pdvAmount = afterDiscount * (item.pdv / 100);
  const total = afterDiscount + pdvAmount;
  return { subtotal, total };
};

export function DocumentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const typeParam = searchParams.get('type');
  const typeFromUrl: DocumentType = typeParam && typeParam in documentTypeLabels
    ? (typeParam as DocumentType)
    : 'ponuda';

  const createDocument = useCreateDocument();

  const [formData, setFormData] = useState(() => ({
    type: typeFromUrl,
    clientName: '',
    clientOib: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
  }));

  // When switching between "Nova ponuda / otpremnica / ..." we stay on /documents/new,
  // only the query param changes. Sync form type with URL.
  useEffect(() => {
    setFormData((prev) => (prev.type === typeFromUrl ? prev : { ...prev, type: typeFromUrl }));
  }, [typeFromUrl]);

  const [items, setItems] = useState<Omit<DocumentItem, 'id'>[]>([
    { name: '', quantity: 1, unit: 'kom', price: 0, discount: 0, pdv: 25, subtotal: 0, total: 0 },
  ]);

  // Contract articles state
  const { data: articleTemplates = [] } = useContractArticleTemplates();
  const initializeTemplates = useInitializeDefaultTemplates();
  const saveDocumentArticles = useSaveDocumentContractArticles();
  const [contractArticles, setContractArticles] = useState<ContractArticleFormData[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  // Initialize contract articles when templates load (for ugovor type)
  useEffect(() => {
    if (formData.type === 'ugovor' && articleTemplates.length === 0) {
      initializeTemplates.mutate();
    }
  }, [formData.type, articleTemplates.length]);

  useEffect(() => {
    if (formData.type === 'ugovor' && articleTemplates.length > 0 && contractArticles.length === 0) {
      setContractArticles(
        articleTemplates
          .filter(t => t.is_active)
          .map(t => ({
            article_number: t.article_number,
            title: t.title,
            content: t.content,
            is_selected: true,
          }))
      );
    }
  }, [formData.type, articleTemplates]);

  // Document type specific rules - ponuda, račun and ugovor have prices
  const hasPrices = ['ponuda', 'racun', 'ugovor'].includes(formData.type);
  const isContract = formData.type === 'ugovor';

  // Calculate totals BEFORE the useEffect that uses them
  const subtotalAmount = hasPrices ? items.reduce((sum, item) => sum + item.subtotal, 0) : 0;
  const totalDiscount = hasPrices ? items.reduce((sum, item) => sum + (item.subtotal * (item.discount / 100)), 0) : 0;
  const totalPdv = hasPrices ? items.reduce((sum, item) => {
    const afterDiscount = item.subtotal - (item.subtotal * (item.discount / 100));
    return sum + (afterDiscount * (item.pdv / 100));
  }, 0) : 0;
  const totalAmount = hasPrices ? items.reduce((sum, item) => sum + item.total, 0) : 0;

  // Update placeholder values based on form data
  useEffect(() => {
    setPlaceholderValues(prev => ({
      ...prev,
      adresa_kupca: formData.clientAddress,
      ukupna_cijena: totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 }),
      predujam: prev.predujam || '',
      ostatak: prev.predujam ? (totalAmount - parseFloat(prev.predujam.replace(',', '.') || '0')).toLocaleString('hr-HR', { minimumFractionDigits: 2 }) : '',
      datum_ugovora: new Date().toLocaleDateString('hr-HR'),
      mjesto_ugovora: prev.mjesto_ugovora || '',
    }));
  }, [formData.clientAddress, totalAmount]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'kom', price: 0, discount: 0, pdv: 25, subtotal: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Omit<DocumentItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate totals when relevant fields change (only for types with prices)
    if (hasPrices && ['quantity', 'price', 'discount', 'pdv'].includes(field)) {
      const { subtotal, total } = calculateItemTotals(newItems[index]);
      newItems[index].subtotal = subtotal;
      newItems[index].total = total;
    }
    
    setItems(newItems);
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => {
      const updated = { ...prev, [key]: value };
      // Auto-calculate ostatak when predujam changes
      if (key === 'predujam') {
        const predujamValue = parseFloat(value.replace(',', '.') || '0');
        updated.ostatak = (totalAmount - predujamValue).toLocaleString('hr-HR', { minimumFractionDigits: 2 });
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientName || !formData.clientAddress) {
      return;
    }

    if (items.some(item => !item.name)) {
      return;
    }

    // Create the document first
    const document = await createDocument.mutateAsync({
      type: formData.type as DocumentType,
      clientName: formData.clientName,
      clientOib: formData.clientOib || undefined,
      clientAddress: formData.clientAddress,
      clientPhone: formData.clientPhone || undefined,
      clientEmail: formData.clientEmail || undefined,
      notes: formData.notes || undefined,
      items,
    });

    // If it's a contract, save the contract articles
    if (isContract && document?.id) {
      const selectedArticles = contractArticles
        .filter(a => a.is_selected)
        .map((article, index) => {
          // Replace placeholders in content
          let content = article.content;
          Object.entries(placeholderValues).forEach(([key, value]) => {
            content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`);
          });
          return {
            article_number: index + 1,
            title: article.title,
            content,
            sort_order: index,
          };
        });

      await saveDocumentArticles.mutateAsync({
        documentId: document.id,
        articles: selectedArticles,
      });
    }
    
    navigate('/documents');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag
        </Button>
        <Button type="submit" className="gap-2 btn-float" disabled={createDocument.isPending}>
          {createDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Spremi dokument
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Type */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Vrsta dokumenta</h2>
            <Select
              value={formData.type}
              onValueChange={(value: DocumentType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Info */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Podaci o klijentu</h2>
            
            {/* Client Autocomplete */}
            <div className="mb-4">
              <Label>Brzi odabir klijenta</Label>
              <div className="mt-1.5">
                <ClientAutocomplete
                  value={formData.clientName}
                  onSelect={(client: Client) => {
                    setFormData({
                      ...formData,
                      clientName: client.name,
                      clientOib: client.oib || '',
                      clientAddress: [client.address, client.postal_code, client.city].filter(Boolean).join(', '),
                      clientPhone: client.phone || '',
                      clientEmail: client.email || '',
                    });
                    // Apply client's default PDV to all items
                    if (hasPrices) {
                      setItems(prevItems => prevItems.map(item => {
                        const updatedItem = { ...item, pdv: client.default_pdv };
                        const { subtotal, total } = calculateItemTotals(updatedItem);
                        return { ...updatedItem, subtotal, total };
                      }));
                    }
                  }}
                  placeholder="Pretraži postojeće klijente..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clientName">Naziv klijenta *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Unesite naziv klijenta"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="clientOib">OIB</Label>
                <Input
                  id="clientOib"
                  value={formData.clientOib}
                  onChange={(e) => setFormData({ ...formData, clientOib: e.target.value })}
                  placeholder="12345678901"
                  maxLength={11}
                  className="mt-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="clientAddress">Adresa *</Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  placeholder="Unesite adresu"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Telefon</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="+385 xx xxx xxxx"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="email@primjer.hr"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Stavke</h2>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj stavku
              </Button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-3">
                  {/* First row - Name, Quantity, Unit */}
                  <div className="grid gap-3 sm:grid-cols-12 items-end">
                    <div className={hasPrices ? "sm:col-span-6" : "sm:col-span-6"}>
                      <Label>Naziv</Label>
                      <div className="mt-1.5">
                        <ArticleAutocomplete
                          value={item.name}
                          onChange={(value) => updateItem(index, 'name', value)}
                          onSelect={(article: Article) => {
                            const newItems = [...items];
                            newItems[index] = {
                              ...newItems[index],
                              name: article.name,
                              unit: article.unit,
                              price: article.price,
                              pdv: article.pdv,
                            };
                            if (hasPrices) {
                              const { subtotal, total } = calculateItemTotals(newItems[index]);
                              newItems[index].subtotal = subtotal;
                              newItems[index].total = total;
                            }
                            setItems(newItems);
                          }}
                          placeholder="Naziv stavke"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Količina</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Jedinica</Label>
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
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Second row - Price, Discount, PDV, Total (only for ponuda) */}
                  {hasPrices && (
                    <div className="grid gap-3 sm:grid-cols-12 items-end">
                      <div className="sm:col-span-3">
                        <Label>Cijena (€)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Rabat (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>PDV (%)</Label>
                        <Select
                          value={item.pdv.toString()}
                          onValueChange={(value) => updateItem(index, 'pdv', parseFloat(value))}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="13">13%</SelectItem>
                            <SelectItem value="25">25%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2 text-right">
                        <Label className="text-muted-foreground">Osnovica</Label>
                        <p className="mt-1.5 py-2 text-sm text-muted-foreground">
                          {item.subtotal.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                        </p>
                      </div>
                      <div className="sm:col-span-2 text-right">
                        <Label>Ukupno</Label>
                        <p className="mt-1.5 py-2 font-semibold text-foreground">
                          {item.total.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                        </p>
                      </div>
                      <div className="sm:col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Delete button for non-price types with multiple items */}
                  {!hasPrices && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Napomene</h2>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Dodatne napomene ili upute..."
              rows={4}
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6 sticky top-24">
            <h2 className="font-semibold text-foreground mb-4">Sažetak</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vrsta dokumenta</span>
                <span className="font-medium text-foreground">{documentTypeLabels[formData.type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Broj stavki</span>
                <span className="font-medium text-foreground">{items.filter(i => i.name).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Datum</span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleDateString('hr-HR')}
                </span>
              </div>
              
              {hasPrices && (
                <div className="border-t border-border pt-3 mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Osnovica</span>
                    <span className="text-foreground">
                      {subtotalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rabat</span>
                      <span className="text-success">
                        -{totalDiscount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PDV</span>
                    <span className="text-foreground">
                      {totalPdv.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Ukupno</span>
                    <span className="text-2xl font-bold text-primary">
                      {totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
