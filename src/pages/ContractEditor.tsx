import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContractHeaderEditor } from '@/components/contracts/ContractHeaderEditor';
import { ContractArticlesEditor } from '@/components/contracts/ContractArticlesEditor';
import { ContractTemplateManager } from '@/components/contracts/ContractTemplateManager';
import { AppliancesEditor, Appliance } from '@/components/contracts/AppliancesEditor';
import { ArticleAutocomplete } from '@/components/articles/ArticleAutocomplete';
import { useCompanySettings } from '@/hooks/useSettings';
import {
  useContractArticleTemplates,
  useInitializeDefaultTemplates,
  useSaveDocumentContractArticles,
} from '@/hooks/useContractArticles';
import { useCreateDocument, type CreateDocumentData } from '@/hooks/useDocuments';
import { ContractArticleFormData } from '@/types/contractArticle';
import { toast } from 'sonner';

interface DocumentItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  pdv: number;
  subtotal: number;
  total: number;
}

export default function ContractEditor() {
  const navigate = useNavigate();
  const { data: companySettings, isLoading: loadingSettings } = useCompanySettings();
  const { data: templates, isLoading: loadingTemplates, refetch: refetchTemplates } = useContractArticleTemplates();
  const initializeTemplates = useInitializeDefaultTemplates();
  const createDocument = useCreateDocument();
  const saveContractArticles = useSaveDocumentContractArticles();

  // Header data - default Županja and UGOVOR
  const [headerData, setHeaderData] = useState({
    title: 'UGOVOR',
    place: 'Županja',
    date: new Date().toISOString().split('T')[0],
    seller: {
      name: '',
      address: '',
      oib: '',
      iban: '',
    },
    buyer: {
      name: '',
      address: '',
      oib: '',
      phone: '',
      email: '',
    },
  });

  // Contract articles
  const [articles, setArticles] = useState<ContractArticleFormData[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({
    predujam: '0',
  });

  // Document items (for price calculation)
  const [items, setItems] = useState<DocumentItem[]>([]);

  // Appliances
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  // Signature section
  const [signatureText, setSignatureText] = useState(
    'U znak prihvaćanja uvjeta ovog Ugovora, stranke ga vlastoručno potpisuju.'
  );

  // Notes
  const [notes, setNotes] = useState('');

  // Initialize company settings
  useEffect(() => {
    if (companySettings) {
      setHeaderData((prev) => ({
        ...prev,
        seller: {
          name: companySettings.company_name || '',
          address: companySettings.address || '',
          oib: companySettings.oib || '',
          iban: companySettings.iban || '',
        },
      }));
    }
  }, [companySettings]);

  // Initialize templates
  useEffect(() => {
    if (!loadingTemplates && templates?.length === 0) {
      initializeTemplates.mutate();
    }
  }, [loadingTemplates, templates]);

  // Load articles from templates
  useEffect(() => {
    if (templates && templates.length > 0 && articles.length === 0) {
      const formattedArticles: ContractArticleFormData[] = templates
        .filter((t) => t.is_active)
        .map((template) => ({
          article_number: template.article_number,
          title: template.title,
          content: template.content,
          is_selected: true,
        }));
      setArticles(formattedArticles);
    }
  }, [templates]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = items.reduce(
      (sum, item) => sum + (item.subtotal * item.discount) / 100,
      0
    );
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = items.reduce((sum, item) => {
      const itemAfterDiscount = item.subtotal - (item.subtotal * item.discount) / 100;
      return sum + (itemAfterDiscount * item.pdv) / 100;
    }, 0);
    const total = afterDiscount + vatAmount;

    return { subtotal, discountAmount, afterDiscount, vatAmount, total };
  }, [items]);

  // Format appliances for placeholder
  const appliancesText = useMemo(() => {
    if (appliances.length === 0) return '';
    return appliances
      .filter((a) => a.name)
      .map((a) => `- ${a.name} (garancija: ${a.warrantyMonths} mjeseci)`)
      .join('\n');
  }, [appliances]);

  // Update placeholder values based on totals and other data
  useEffect(() => {
    setPlaceholderValues((prev) => {
      const predujam = parseFloat(prev.predujam || '0');
      const ukupnaCijena = totals.total;
      const ostatak = Math.max(0, ukupnaCijena - predujam);

      return {
        ...prev,
        ukupna_cijena: ukupnaCijena.toFixed(2),
        ostatak: ostatak.toFixed(2),
        adresa_kupca: headerData.buyer.address,
        datum_ugovora: new Date(headerData.date).toLocaleDateString('hr-HR'),
        mjesto_ugovora: headerData.place,
        ugradbeni_aparati: appliancesText,
      };
    });
  }, [totals.total, headerData.buyer.address, headerData.date, headerData.place, appliancesText]);

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues((prev) => {
      const newValues = { ...prev, [key]: value };
      if (key === 'predujam') {
        newValues.ostatak = (totals.total - parseFloat(value || '0')).toFixed(2);
      }
      return newValues;
    });
  };

  // Item management
  const addItem = () => {
    const newItem: DocumentItem = {
      id: crypto.randomUUID(),
      name: '',
      quantity: 1,
      unit: 'kom',
      price: 0,
      discount: 0,
      pdv: 25,
      subtotal: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        updated.subtotal = updated.quantity * updated.price;
        const afterDiscount = updated.subtotal - (updated.subtotal * updated.discount) / 100;
        updated.total = afterDiscount + (afterDiscount * updated.pdv) / 100;

        return updated;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleArticleSelect = (article: any) => {
    const newItem: DocumentItem = {
      id: crypto.randomUUID(),
      name: article.name,
      quantity: 1,
      unit: article.unit || 'kom',
      price: article.price || 0,
      discount: 0,
      pdv: article.pdv || 25,
      subtotal: article.price || 0,
      total: (article.price || 0) * (1 + (article.pdv || 25) / 100),
    };
    setItems([...items, newItem]);
  };

  // Generate document number
  const generateDocumentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `UG-${year}${month}-${random}`;
  };

  // Save contract
  const handleSave = async () => {
    if (!headerData.buyer.name) {
      toast.error('Unesite podatke o kupcu');
      return;
    }

    const selectedArticles = articles.filter((a) => a.is_selected);
    if (selectedArticles.length === 0) {
      toast.error('Odaberite barem jedan članak ugovora');
      return;
    }

    try {
      // Create document
      const documentData: CreateDocumentData = {
        type: 'ugovor',
        clientName: headerData.buyer.name,
        clientAddress: headerData.buyer.address,
        clientOib: headerData.buyer.oib,
        clientPhone: headerData.buyer.phone,
        clientEmail: headerData.buyer.email,
        notes: notes,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discount: item.discount,
          pdv: item.pdv,
          subtotal: item.subtotal,
          total: item.total,
        })),
      };

      const document = await createDocument.mutateAsync(documentData);

      // Save contract articles with replaced placeholders
      const articlesToSave = selectedArticles.map((article, index) => {
        let content = article.content;
        Object.entries(placeholderValues).forEach(([key, value]) => {
          content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });

        return {
          article_number: index + 1,
          title: article.title,
          content: content,
          sort_order: index,
        };
      });

      await saveContractArticles.mutateAsync({
        documentId: document.id,
        articles: articlesToSave,
      });

      toast.success('Ugovor je uspješno spremljen!');
      navigate(`/documents/${document.id}`);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Greška pri spremanju ugovora');
    }
  };

  const handleTemplatesUpdated = () => {
    refetchTemplates();
  };

  if (loadingSettings || loadingTemplates) {
    return (
      <MainLayout title="Novi ugovor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Novi ugovor" subtitle="Kreirajte ugovor s mogućnošću uređivanja svih dijelova">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Novi ugovor</h1>
              <p className="text-muted-foreground">
                Kreirajte ugovor s mogućnošću uređivanja svih dijelova
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ContractTemplateManager onTemplatesUpdated={handleTemplatesUpdated} />
            <Button onClick={handleSave} disabled={createDocument.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Spremi ugovor
            </Button>
          </div>
        </div>

        {/* Editor Tabs */}
        <Tabs defaultValue="header" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="header">Zaglavlje</TabsTrigger>
            <TabsTrigger value="articles">Članci</TabsTrigger>
            <TabsTrigger value="items">Stavke</TabsTrigger>
            <TabsTrigger value="appliances">Aparati</TabsTrigger>
            <TabsTrigger value="signature">Potpisi</TabsTrigger>
          </TabsList>

          <TabsContent value="header" className="space-y-6">
            <ContractHeaderEditor data={headerData} onChange={setHeaderData} />
          </TabsContent>

          <TabsContent value="articles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Članci ugovora</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractArticlesEditor
                  articles={articles}
                  onArticlesChange={setArticles}
                  placeholderValues={placeholderValues}
                  onPlaceholderChange={handlePlaceholderChange}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Stavke / Artikli</CardTitle>
                  <div className="flex items-center gap-2">
                    <ArticleAutocomplete onSelect={handleArticleSelect} />
                    <Button variant="outline" onClick={addItem}>
                      Dodaj stavku
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nema stavki. Dodajte artikle ili stavke za izračun cijene.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Naziv</th>
                            <th className="text-right p-2 w-20">Kol.</th>
                            <th className="text-left p-2 w-20">Jed.</th>
                            <th className="text-right p-2 w-24">Cijena</th>
                            <th className="text-right p-2 w-20">Popust %</th>
                            <th className="text-right p-2 w-20">PDV %</th>
                            <th className="text-right p-2 w-24">Ukupno</th>
                            <th className="w-10"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item) => (
                            <tr key={item.id} className="border-b">
                              <td className="p-2">
                                <Input
                                  value={item.name}
                                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                  placeholder="Naziv stavke"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                                  }
                                  className="text-right"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  value={item.unit}
                                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) =>
                                    updateItem(item.id, 'price', parseFloat(e.target.value) || 0)
                                  }
                                  className="text-right"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)
                                  }
                                  className="text-right"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  value={item.pdv}
                                  onChange={(e) =>
                                    updateItem(item.id, 'pdv', parseFloat(e.target.value) || 0)
                                  }
                                  className="text-right"
                                />
                              </td>
                              <td className="p-2 text-right font-medium">
                                {item.total.toFixed(2)} €
                              </td>
                              <td className="p-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeItem(item.id)}
                                >
                                  ×
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Osnovica:</span>
                          <span>{totals.subtotal.toFixed(2)} €</span>
                        </div>
                        {totals.discountAmount > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Popust:</span>
                            <span>-{totals.discountAmount.toFixed(2)} €</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>PDV:</span>
                          <span>{totals.vatAmount.toFixed(2)} €</span>
                        </div>
                        <div className="flex justify-between font-bold text-base border-t pt-2">
                          <span>Ukupno:</span>
                          <span>{totals.total.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appliances" className="space-y-6">
            <AppliancesEditor appliances={appliances} onChange={setAppliances} />
          </TabsContent>

          <TabsContent value="signature" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Završne odredbe i potpisi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Tekst prije potpisa</Label>
                  <Textarea
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    rows={3}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Napomene</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Dodatne napomene..."
                    rows={3}
                    className="mt-1.5"
                  />
                </div>

                {/* Signature Preview */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <p className="text-center text-sm mb-8">{signatureText}</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-center">
                      <p className="font-medium mb-4">ZA PRODAVATELJA:</p>
                      <div className="border-b border-foreground/30 mb-2"></div>
                      <p className="text-sm text-muted-foreground">{headerData.seller.name}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium mb-4">ZA KUPCA:</p>
                      <div className="border-b border-foreground/30 mb-2"></div>
                      <p className="text-sm text-muted-foreground">{headerData.buyer.name}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
