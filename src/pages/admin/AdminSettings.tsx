import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompanySettings, useSaveCompanySettings } from '@/hooks/useSettings';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Save, Building2, FileText, Calculator, Clock, Layers } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FurnitureContractTemplateUploader } from '@/components/settings/FurnitureContractTemplateUploader';

const AdminSettings = () => {
  const { data: settings, isLoading } = useCompanySettings();
  const saveSettings = useSaveCompanySettings();
  
  const [companyForm, setCompanyForm] = useState({
    company_name: '',
    address: '',
    oib: '',
    iban: '',
    iban_2: '',
    bank_name_1: '',
    bank_name_2: '',
    swift_1: '',
    swift_2: '',
    phone_main: '',
    phone_sales: '',
    phone_accounting: '',
    email_info: '',
    website: '',
    director_name: '',
    registration_court: '',
    registration_number: '',
    capital_amount: '',
    pdv_id: '',
  });

  const [documentSettings, setDocumentSettings] = useState({
    default_validity_days: 30,
    default_delivery_days: 14,
    default_payment_method: 'Transakcijski račun',
    reset_numbering_yearly: true,
    ponuda_prefix: 'P',
    racun_prefix: 'R',
    otpremnica_prefix: 'OTP',
    ugovor_prefix: 'U',
    nalog_prefix: 'N',
  });

  const [vatSettings, setVatSettings] = useState({
    default_vat_rate: 25,
    show_pdv_breakdown: true,
    rounding_method: 'standard', // standard, up, down
  });

  useEffect(() => {
    if (settings) {
      setCompanyForm({
        company_name: settings.company_name || '',
        address: settings.address || '',
        oib: settings.oib || '',
        iban: settings.iban || '',
        iban_2: settings.iban_2 || '',
        bank_name_1: settings.bank_name_1 || '',
        bank_name_2: settings.bank_name_2 || '',
        swift_1: settings.swift_1 || '',
        swift_2: settings.swift_2 || '',
        phone_main: settings.phone_main || '',
        phone_sales: settings.phone_sales || '',
        phone_accounting: settings.phone_accounting || '',
        email_info: settings.email_info || '',
        website: settings.website || '',
        director_name: settings.director_name || '',
        registration_court: settings.registration_court || '',
        registration_number: settings.registration_number || '',
        capital_amount: settings.capital_amount || '',
        pdv_id: settings.pdv_id || '',
      });
    }
  }, [settings]);

  const handleSaveCompany = async () => {
    try {
      await saveSettings.mutateAsync(companyForm);
      toast.success('Postavke tvrtke spremljene');
    } catch (error) {
      toast.error('Greška pri spremanju postavki');
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Admin Postavke">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Postavke" subtitle="Globalne postavke aplikacije">
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Tvrtka
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Dokumenti
          </TabsTrigger>
          <TabsTrigger value="vat" className="gap-2">
            <Calculator className="h-4 w-4" />
            PDV
          </TabsTrigger>
          <TabsTrigger value="defaults" className="gap-2">
            <Clock className="h-4 w-4" />
            Zadane vrijednosti
          </TabsTrigger>
          <TabsTrigger value="furniture-contract" className="gap-2">
            <Layers className="h-4 w-4" />
            Ugovor 1:1
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Profil tvrtke</CardTitle>
              <CardDescription>Podaci koji se koriste u zaglavlju i podnožju dokumenata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Naziv tvrtke</Label>
                  <Input
                    id="company_name"
                    value={companyForm.company_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oib">OIB</Label>
                  <Input
                    id="oib"
                    value={companyForm.oib}
                    onChange={(e) => setCompanyForm({ ...companyForm, oib: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Adresa</Label>
                  <Input
                    id="address"
                    value={companyForm.address}
                    onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={companyForm.iban}
                    onChange={(e) => setCompanyForm({ ...companyForm, iban: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_name_1">Naziv banke</Label>
                  <Input
                    id="bank_name_1"
                    value={companyForm.bank_name_1}
                    onChange={(e) => setCompanyForm({ ...companyForm, bank_name_1: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_main">Telefon (glavni)</Label>
                  <Input
                    id="phone_main"
                    value={companyForm.phone_main}
                    onChange={(e) => setCompanyForm({ ...companyForm, phone_main: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_info">Email</Label>
                  <Input
                    id="email_info"
                    type="email"
                    value={companyForm.email_info}
                    onChange={(e) => setCompanyForm({ ...companyForm, email_info: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="director_name">Direktor</Label>
                  <Input
                    id="director_name"
                    value={companyForm.director_name}
                    onChange={(e) => setCompanyForm({ ...companyForm, director_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Web stranica</Label>
                  <Input
                    id="website"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveCompany} disabled={saveSettings.isPending}>
                  {saveSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Spremi postavke tvrtke
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Numbering Settings */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Numeriranje dokumenata</CardTitle>
              <CardDescription>Prefiksi i pravila numeriranja po vrsti dokumenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ponuda_prefix">Prefiks ponude</Label>
                  <Input
                    id="ponuda_prefix"
                    value={documentSettings.ponuda_prefix}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, ponuda_prefix: e.target.value })}
                    placeholder="P"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="racun_prefix">Prefiks računa</Label>
                  <Input
                    id="racun_prefix"
                    value={documentSettings.racun_prefix}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, racun_prefix: e.target.value })}
                    placeholder="R"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otpremnica_prefix">Prefiks otpremnice</Label>
                  <Input
                    id="otpremnica_prefix"
                    value={documentSettings.otpremnica_prefix}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, otpremnica_prefix: e.target.value })}
                    placeholder="OTP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ugovor_prefix">Prefiks ugovora</Label>
                  <Input
                    id="ugovor_prefix"
                    value={documentSettings.ugovor_prefix}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, ugovor_prefix: e.target.value })}
                    placeholder="U"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nalog_prefix">Prefiks naloga</Label>
                  <Input
                    id="nalog_prefix"
                    value={documentSettings.nalog_prefix}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, nalog_prefix: e.target.value })}
                    placeholder="N"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="reset_yearly"
                  checked={documentSettings.reset_numbering_yearly}
                  onCheckedChange={(checked) => setDocumentSettings({ ...documentSettings, reset_numbering_yearly: checked })}
                />
                <Label htmlFor="reset_yearly">Reset numeriranja svake godine</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Ove postavke utječu na generiranje novih brojeva dokumenata. Format: [PREFIKS]-[BROJ]/[GODINA]
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VAT Settings */}
        <TabsContent value="vat">
          <Card>
            <CardHeader>
              <CardTitle>PDV postavke</CardTitle>
              <CardDescription>Stope PDV-a i pravila zaokruživanja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="default_vat">Zadana stopa PDV-a (%)</Label>
                  <Input
                    id="default_vat"
                    type="number"
                    value={vatSettings.default_vat_rate}
                    onChange={(e) => setVatSettings({ ...vatSettings, default_vat_rate: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rounding">Način zaokruživanja</Label>
                  <Select 
                    value={vatSettings.rounding_method} 
                    onValueChange={(value) => setVatSettings({ ...vatSettings, rounding_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standardno (matematičko)</SelectItem>
                      <SelectItem value="up">Uvijek gore</SelectItem>
                      <SelectItem value="down">Uvijek dolje</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="show_pdv"
                  checked={vatSettings.show_pdv_breakdown}
                  onCheckedChange={(checked) => setVatSettings({ ...vatSettings, show_pdv_breakdown: checked })}
                />
                <Label htmlFor="show_pdv">Prikaži razradu PDV-a na dokumentima</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Default Values */}
        <TabsContent value="defaults">
          <Card>
            <CardHeader>
              <CardTitle>Zadane vrijednosti</CardTitle>
              <CardDescription>Defaultne vrijednosti za nove dokumente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="validity_days">Rok valjanosti (dana)</Label>
                  <Input
                    id="validity_days"
                    type="number"
                    value={documentSettings.default_validity_days}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, default_validity_days: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_days">Rok isporuke (dana)</Label>
                  <Input
                    id="delivery_days"
                    type="number"
                    value={documentSettings.default_delivery_days}
                    onChange={(e) => setDocumentSettings({ ...documentSettings, default_delivery_days: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Način plaćanja</Label>
                  <Select 
                    value={documentSettings.default_payment_method} 
                    onValueChange={(value) => setDocumentSettings({ ...documentSettings, default_payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transakcijski račun">Transakcijski račun</SelectItem>
                      <SelectItem value="Gotovina">Gotovina</SelectItem>
                      <SelectItem value="Kartica">Kartica</SelectItem>
                      <SelectItem value="Virman">Virman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Furniture contract 1:1 template backgrounds */}
        <TabsContent value="furniture-contract">
          <FurnitureContractTemplateUploader />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default AdminSettings;
