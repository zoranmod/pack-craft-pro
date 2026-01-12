import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, FileCode, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useDocumentTemplate,
  useCreateDocumentTemplate,
  useUpdateDocumentTemplate,
  getDefaultTemplate,
  CreateDocumentTemplate,
} from '@/hooks/useDocumentTemplates';
import { documentTypeLabels, DocumentType } from '@/types/document';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { TableColumnsEditor } from '@/components/templates/TableColumnsEditor';
import { WysiwygEditor } from '@/components/contracts/WysiwygEditor';
import { Badge } from '@/components/ui/badge';

const documentTypes: DocumentType[] = ['ponuda', 'ugovor', 'otpremnica', 'racun', 'nalog-dostava-montaza'];

const getDefaultWysiwygContent = () => `
<h1 style="text-align: center;">{vrsta_dokumenta} br. {broj_dokumenta}</h1>

<p><strong>Datum:</strong> {datum}</p>
<p><strong>Klijent:</strong> {ime_klijenta}</p>
<p><strong>Adresa:</strong> {adresa_klijenta}</p>

<h2>Stavke</h2>
<p>{tablica_stavki}</p>

<h2>Ukupno</h2>
<p><strong>Ukupan iznos:</strong> {ukupno} EUR</p>

<hr />

<p style="text-align: center; font-size: 0.875em; color: #666;">
Dokument je kreiran u sustavu za upravljanje dokumentima.
</p>
`;

const TemplateEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isNew = !id || id === 'new';
  
  const { data: existingTemplate, isLoading } = useDocumentTemplate(isNew ? undefined : id);
  const createTemplate = useCreateDocumentTemplate();
  const updateTemplate = useUpdateDocumentTemplate();

  const [template, setTemplate] = useState<CreateDocumentTemplate>({
    ...getDefaultTemplate(),
    document_type: (location.state as any)?.documentType || 'ponuda',
    name: '',
  });

  useEffect(() => {
    if (existingTemplate) {
      const { id: _, user_id: __, created_at: ___, updated_at: ____, ...rest } = existingTemplate;
      setTemplate(rest as CreateDocumentTemplate);
    }
  }, [existingTemplate]);

  const handleSave = async () => {
    if (!template.name.trim()) {
      return;
    }

    if (isNew) {
      await createTemplate.mutateAsync(template);
    } else {
      await updateTemplate.mutateAsync({ id: id!, ...template });
    }
    navigate('/settings/templates');
  };

  const updateField = <K extends keyof CreateDocumentTemplate>(
    field: K,
    value: CreateDocumentTemplate[K]
  ) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  };

  if (!isNew && isLoading) {
    return (
      <MainLayout title="Učitavanje..." subtitle="">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={isNew ? 'Novi predložak' : 'Uredi predložak'}
      subtitle="Prilagodite izgled dokumenata"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/settings/templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Natrag
          </Button>
          <Button
            onClick={handleSave}
            disabled={createTemplate.isPending || updateTemplate.isPending || !template.name.trim()}
          >
            {(createTemplate.isPending || updateTemplate.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            Spremi
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Osnovni podaci</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Naziv predloška</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="npr. Standardna ponuda"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="documentType">Vrsta dokumenta</Label>
                  <Select
                    value={template.document_type}
                    onValueChange={(value) => updateField('document_type', value)}
                    disabled={!isNew}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {documentTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Zadani predložak</Label>
                    <p className="text-sm text-muted-foreground">
                      Koristi ovaj predložak automatski
                    </p>
                  </div>
                  <Switch
                    checked={template.is_default}
                    onCheckedChange={(checked) => updateField('is_default', checked)}
                  />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Label>WYSIWYG editor</Label>
                      {template.use_wysiwyg && (
                        <Badge variant="secondary" className="text-xs">
                          <FileCode className="h-3 w-3 mr-1" />
                          Slobodno uređivanje
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Omogućuje potpunu slobodu u dizajnu dokumenta
                    </p>
                  </div>
                  <Switch
                    checked={template.use_wysiwyg}
                    onCheckedChange={(checked) => updateField('use_wysiwyg', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {template.use_wysiwyg ? (
              /* WYSIWYG Editor Mode */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    Sadržaj dokumenta
                  </CardTitle>
                  <CardDescription>
                    Koristite editor za potpunu kontrolu nad izgledom dokumenta. 
                    Dostupni placeholderi: {'{'}broj_dokumenta{'}'}, {'{'}datum{'}'}, {'{'}ime_klijenta{'}'}, {'{'}adresa_klijenta{'}'}, {'{'}ukupno{'}'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WysiwygEditor
                    content={template.html_content || getDefaultWysiwygContent()}
                    onChange={(content) => updateField('html_content', content)}
                    placeholder="Dizajnirajte svoj dokument..."
                    editorClassName="min-h-[500px]"
                  />
                </CardContent>
              </Card>
            ) : (
              /* Structured Template Mode */
              <Tabs defaultValue="header">
              <TabsList className="w-full">
                <TabsTrigger value="header" className="flex-1">Zaglavlje</TabsTrigger>
                <TabsTrigger value="metadata" className="flex-1">Podaci</TabsTrigger>
                <TabsTrigger value="table" className="flex-1">Tablica</TabsTrigger>
                <TabsTrigger value="footer" className="flex-1">Podnožje</TabsTrigger>
                <TabsTrigger value="styles" className="flex-1">Stilovi</TabsTrigger>
              </TabsList>

              <TabsContent value="header" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Zaglavlje dokumenta</CardTitle>
                    <CardDescription>Postavke loga i podataka tvrtke</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Prikaži logo</Label>
                      <Switch
                        checked={template.show_logo}
                        onCheckedChange={(checked) => updateField('show_logo', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži podatke tvrtke</Label>
                      <Switch
                        checked={template.show_company_info}
                        onCheckedChange={(checked) => updateField('show_company_info', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži IBAN u zaglavlju</Label>
                      <Switch
                        checked={template.show_iban_in_header}
                        onCheckedChange={(checked) => updateField('show_iban_in_header', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži drugi IBAN</Label>
                      <Switch
                        checked={template.show_second_iban}
                        onCheckedChange={(checked) => updateField('show_second_iban', checked)}
                      />
                    </div>
                    <div>
                      <Label>Raspored zaglavlja</Label>
                      <Select
                        value={template.header_layout}
                        onValueChange={(value) => updateField('header_layout', value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left-right">Logo lijevo, podaci desno</SelectItem>
                          <SelectItem value="centered">Centrirano</SelectItem>
                          <SelectItem value="logo-only">Samo logo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Podaci dokumenta</CardTitle>
                    <CardDescription>Prikaz dodatnih informacija</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Prikaži način plaćanja</Label>
                      <Switch
                        checked={template.show_payment_method}
                        onCheckedChange={(checked) => updateField('show_payment_method', checked)}
                      />
                    </div>
                    <div>
                      <Label>Zadani način plaćanja</Label>
                      <Input
                        value={template.default_payment_method}
                        onChange={(e) => updateField('default_payment_method', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži rok valjanosti</Label>
                      <Switch
                        checked={template.show_validity_days}
                        onCheckedChange={(checked) => updateField('show_validity_days', checked)}
                      />
                    </div>
                    <div>
                      <Label>Zadani rok valjanosti (dana)</Label>
                      <Input
                        type="number"
                        value={template.default_validity_days}
                        onChange={(e) => updateField('default_validity_days', parseInt(e.target.value) || 15)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži rok isporuke</Label>
                      <Switch
                        checked={template.show_delivery_days}
                        onCheckedChange={(checked) => updateField('show_delivery_days', checked)}
                      />
                    </div>
                    <div>
                      <Label>Zadani rok isporuke (dana)</Label>
                      <Input
                        type="number"
                        value={template.default_delivery_days}
                        onChange={(e) => updateField('default_delivery_days', parseInt(e.target.value) || 60)}
                        className="mt-1.5"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="table" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tablica stavki</CardTitle>
                    <CardDescription>Odaberite i poredajte stupce tablice</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <TableColumnsEditor
                      columns={template.table_columns}
                      onChange={(columns) => updateField('table_columns', columns)}
                    />
                    <div className="flex items-center justify-between">
                      <Label>Prikaži raščlambu PDV-a</Label>
                      <Switch
                        checked={template.show_pdv_breakdown}
                        onCheckedChange={(checked) => updateField('show_pdv_breakdown', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži stupac rabata</Label>
                      <Switch
                        checked={template.show_discount_column}
                        onCheckedChange={(checked) => updateField('show_discount_column', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="footer" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Podnožje dokumenta</CardTitle>
                    <CardDescription>Potpis, kontakti i bilješke</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Prikaži "Pripremio/la"</Label>
                      <Switch
                        checked={template.show_prepared_by}
                        onCheckedChange={(checked) => updateField('show_prepared_by', checked)}
                      />
                    </div>
                    <div>
                      <Label>Tekst za "Pripremio/la"</Label>
                      <Input
                        value={template.prepared_by_label}
                        onChange={(e) => updateField('prepared_by_label', e.target.value)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži liniju za potpis</Label>
                      <Switch
                        checked={template.show_signature_line}
                        onCheckedChange={(checked) => updateField('show_signature_line', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži mjesto za pečat</Label>
                      <Switch
                        checked={template.show_stamp_placeholder}
                        onCheckedChange={(checked) => updateField('show_stamp_placeholder', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži potpis direktora</Label>
                      <Switch
                        checked={template.show_director_signature}
                        onCheckedChange={(checked) => updateField('show_director_signature', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži kontakt podatke u podnožju</Label>
                      <Switch
                        checked={template.show_footer_contacts}
                        onCheckedChange={(checked) => updateField('show_footer_contacts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Prikaži registracijske podatke</Label>
                      <Switch
                        checked={template.show_registration_info}
                        onCheckedChange={(checked) => updateField('show_registration_info', checked)}
                      />
                    </div>
                    <div>
                      <Label>Bilješka u podnožju</Label>
                      <Textarea
                        value={template.footer_note}
                        onChange={(e) => updateField('footer_note', e.target.value)}
                        className="mt-1.5"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="styles" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Stilovi</CardTitle>
                    <CardDescription>Boje i fontovi</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Primarna boja</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          type="color"
                          value={template.primary_color}
                          onChange={(e) => updateField('primary_color', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={template.primary_color}
                          onChange={(e) => updateField('primary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Sekundarna boja</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          type="color"
                          value={template.secondary_color}
                          onChange={(e) => updateField('secondary_color', e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={template.secondary_color}
                          onChange={(e) => updateField('secondary_color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Font</Label>
                      <Select
                        value={template.font_family}
                        onValueChange={(value) => updateField('font_family', value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Calibri">Calibri</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Veličina fonta zaglavlja</Label>
                        <Input
                          type="number"
                          value={template.header_font_size}
                          onChange={(e) => updateField('header_font_size', parseInt(e.target.value) || 10)}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Veličina fonta tijela</Label>
                        <Input
                          type="number"
                          value={template.body_font_size}
                          onChange={(e) => updateField('body_font_size', parseInt(e.target.value) || 9)}
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            )}
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle>Pregled</CardTitle>
                <CardDescription>Primjer izgleda dokumenta</CardDescription>
              </CardHeader>
              <CardContent>
                <TemplatePreview template={template} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TemplateEditor;
