import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContractHeaderEditor } from '@/components/contracts/ContractHeaderEditor';
import { ContractArticlesEditor } from '@/components/contracts/ContractArticlesEditor';
import { AppliancesEditor, Appliance } from '@/components/contracts/AppliancesEditor';
import { ArticleAutocomplete } from '@/components/articles/ArticleAutocomplete';
import { useCompanySettings } from '@/hooks/useSettings';
import { useDocument, useUpdateDocument } from '@/hooks/useDocuments';
import {
  useDocumentContractArticles,
  useSaveDocumentContractArticles,
} from '@/hooks/useContractArticles';
import { ContractArticleFormData } from '@/types/contractArticle';
import { toast } from 'sonner';
import { formatDateHR } from '@/lib/utils';

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

export default function ContractEditorEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: companySettings, isLoading: loadingSettings } = useCompanySettings();
  const { data: document, isLoading: loadingDocument } = useDocument(id || '');
  const { data: existingArticles, isLoading: loadingArticles } = useDocumentContractArticles(id || '');
  const updateDocument = useUpdateDocument();
  const saveContractArticles = useSaveDocumentContractArticles();

  const [isInitialized, setIsInitialized] = useState(false);

  // Header data
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

  // Document items
  const [items, setItems] = useState<DocumentItem[]>([]);

  // Appliances
  const [appliances, setAppliances] = useState<Appliance[]>([]);

  // Signature text
  const [signatureText, setSignatureText] = useState(
    'U znak prihvaćanja uvjeta ovog Ugovora, stranke ga vlastoručno potpisuju.'
  );

  // Notes
  const [notes, setNotes] = useState('');

  // Initialize from existing document
  useEffect(() => {
    if (document && existingArticles && !isInitialized) {
      // Set header data from document
      setHeaderData({
        title: 'UGOVOR',
        place: 'Županja',
        date: document.date,
        seller: {
          name: companySettings?.company_name || '',
          address: companySettings?.address || '',
          oib: companySettings?.oib || '',
          iban: companySettings?.iban || '',
        },
        buyer: {
          name: document.clientName,
          address: document.clientAddress,
          oib: document.clientOib || '',
          phone: document.clientPhone || '',
          email: document.clientEmail || '',
        },
      });

      // Set articles from existing document articles
      const formattedArticles: ContractArticleFormData[] = existingArticles.map((article) => ({
        article_number: article.article_number,
        title: article.title,
        content: article.content,
        is_selected: true,
      }));
      setArticles(formattedArticles);

      // Set items from document
      if (document.items) {
        const formattedItems: DocumentItem[] = document.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discount: item.discount,
          pdv: item.pdv,
          subtotal: item.subtotal,
          total: item.total,
        }));
        setItems(formattedItems);
      }

      // Set notes
      setNotes(document.notes || '');

      setIsInitialized(true);
    }
  }, [document, existingArticles, companySettings, isInitialized]);

  // Initialize company settings for seller
  useEffect(() => {
    if (companySettings && isInitialized) {
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
  }, [companySettings, isInitialized]);

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

  // Update placeholder values
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
        datum_ugovora: formatDateHR(headerData.date),
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

  // Save contract
  const handleSave = async () => {
    if (!id || !document) return;

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
      // Update document
      await updateDocument.mutateAsync({
        id,
        data: {
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
        },
      });

      // Save contract articles
      const articlesToSave = selectedArticles.map((article, index) => ({
        article_number: index + 1,
        title: article.title,
        content: article.content,
        sort_order: index,
      }));

      await saveContractArticles.mutateAsync({
        documentId: id,
        articles: articlesToSave,
      });

      toast.success('Ugovor je uspješno ažuriran!');
      navigate(`/documents/${id}`);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Greška pri spremanju ugovora');
    }
  };

  if (loadingSettings || loadingDocument || loadingArticles) {
    return (
      <MainLayout title="Uredi ugovor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!document) {
    return (
      <MainLayout title="Uredi ugovor">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg font-medium text-foreground">Dokument nije pronađen</p>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Natrag
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Uredi ugovor" subtitle={`Uređivanje ugovora ${document.number}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Uredi ugovor</h1>
              <p className="text-muted-foreground">{document.number}</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={updateDocument.isPending || saveContractArticles.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Spremi promjene
          </Button>
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
                          <div className="flex justify-between text-destructive">
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
                <CardTitle>Potpisi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Tekst prije potpisa</label>
                  <textarea
                    value={signatureText}
                    onChange={(e) => setSignatureText(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md text-sm min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Napomene</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md text-sm min-h-[100px]"
                    placeholder="Dodatne napomene za ugovor..."
                  />
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Pregled potpisa:</p>
                  <div className="text-sm text-center">
                    <p className="mb-8">{signatureText}</p>
                    <div className="flex justify-between px-12">
                      <div className="text-center">
                        <div className="w-40 border-t border-foreground/30 mb-2"></div>
                        <p className="font-medium">PRODAVATELJ</p>
                      </div>
                      <div className="text-center">
                        <div className="w-40 border-t border-foreground/30 mb-2"></div>
                        <p className="font-medium">KUPAC</p>
                      </div>
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
