import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { DocumentType, DocumentItem, documentTypeLabels } from '@/types/document';
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
import { toast } from 'sonner';

export function DocumentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as DocumentType) || 'ponuda';

  const [formData, setFormData] = useState({
    type: initialType,
    clientName: '',
    clientOib: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
  });

  const [items, setItems] = useState<Omit<DocumentItem, 'id'>[]>([
    { name: '', quantity: 1, unit: 'kom', price: 0, total: 0 },
  ]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'kom', price: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Omit<DocumentItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'price') {
      newItems[index].total = newItems[index].quantity * newItems[index].price;
    }
    
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientName || !formData.clientAddress) {
      toast.error('Molimo ispunite obavezna polja');
      return;
    }

    if (items.some(item => !item.name)) {
      toast.error('Molimo unesite naziv za sve stavke');
      return;
    }

    // Here you would save to database
    toast.success('Dokument uspješno kreiran!');
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
        <Button type="submit" className="gap-2 btn-float">
          <Save className="h-4 w-4" />
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
                <div key={index} className="grid gap-3 sm:grid-cols-12 items-end p-4 bg-muted/30 rounded-lg">
                  <div className="sm:col-span-4">
                    <Label>Naziv</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      placeholder="Naziv stavke"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Količina</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
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
                  <div className="sm:col-span-2">
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
                  <div className="sm:col-span-1 text-right">
                    <Label className="invisible">Ukupno</Label>
                    <p className="mt-1.5 py-2 font-medium text-foreground">
                      {item.total.toLocaleString('hr-HR')} €
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
              
              <div className="border-t border-border pt-3 mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ukupno</span>
                  <span className="text-2xl font-bold text-foreground">
                    {totalAmount.toLocaleString('hr-HR')} €
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
