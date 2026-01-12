import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, Star, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { WysiwygEditor } from '@/components/contracts/WysiwygEditor';
import { 
  useContractLayoutTemplate,
  useCreateContractLayoutTemplate,
  useUpdateContractLayoutTemplate,
  defaultContractHtmlContent
} from '@/hooks/useContractLayoutTemplates';
import { useCompanySettings } from '@/hooks/useSettings';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

// Available placeholders
const placeholders = [
  { key: '{broj_dokumenta}', label: 'Broj dokumenta', example: 'UG-2025-001' },
  { key: '{datum}', label: 'Datum', example: '12.01.2025.' },
  { key: '{mjesto}', label: 'Mjesto', example: 'Zagreb' },
  { key: '{naziv_prodavatelja}', label: 'Naziv prodavatelja', example: 'Akord d.o.o.' },
  { key: '{adresa_prodavatelja}', label: 'Adresa prodavatelja', example: 'Ulica 123, Zagreb' },
  { key: '{oib_prodavatelja}', label: 'OIB prodavatelja', example: '12345678901' },
  { key: '{iban_prodavatelja}', label: 'IBAN prodavatelja', example: 'HR1234567890123456789' },
  { key: '{ime_kupca}', label: 'Ime kupca', example: 'Ivan Horvat' },
  { key: '{adresa_kupca}', label: 'Adresa kupca', example: 'Ulica 456, Split' },
  { key: '{oib_kupca}', label: 'OIB kupca', example: '98765432109' },
  { key: '{telefon_kupca}', label: 'Telefon kupca', example: '+385 91 123 4567' },
  { key: '{email_kupca}', label: 'Email kupca', example: 'ivan@example.com' },
  { key: '{ukupna_cijena}', label: 'Ukupna cijena', example: '10.000,00 €' },
  { key: '{predujam}', label: 'Predujam', example: '3.000,00 €' },
  { key: '{ostatak}', label: 'Ostatak', example: '7.000,00 €' },
  { key: '{rok_isporuke}', label: 'Rok isporuke (dana)', example: '60' },
  { key: '{jamstveni_rok}', label: 'Jamstveni rok', example: '24 mjeseca' },
];

export default function ContractLayoutEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: existingTemplate, isLoading: loadingTemplate } = useContractLayoutTemplate(id);
  const { data: companySettings } = useCompanySettings();
  const createTemplate = useCreateContractLayoutTemplate();
  const updateTemplate = useUpdateContractLayoutTemplate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState(defaultContractHtmlContent);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  // Load existing template data
  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || '');
      setHtmlContent(existingTemplate.html_content);
      setIsDefault(existingTemplate.is_default);
      setIsActive(existingTemplate.is_active);
    }
  }, [existingTemplate]);

  // Replace placeholders with example values for preview
  const getPreviewContent = () => {
    let content = htmlContent;
    
    // Replace with company settings if available
    content = content.replace(/\{naziv_prodavatelja\}/g, companySettings?.company_name || 'Akord d.o.o.');
    content = content.replace(/\{adresa_prodavatelja\}/g, companySettings?.address || 'Adresa tvrtke');
    content = content.replace(/\{oib_prodavatelja\}/g, companySettings?.oib || '12345678901');
    content = content.replace(/\{iban_prodavatelja\}/g, companySettings?.iban || 'HR1234567890123456789');
    
    // Replace other placeholders with examples
    placeholders.forEach(p => {
      if (!content.includes(p.key)) return;
      content = content.replace(new RegExp(p.key.replace(/[{}]/g, '\\$&'), 'g'), p.example);
    });
    
    return content;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Unesite naziv predloška');
      return;
    }

    if (!htmlContent.trim()) {
      toast.error('Sadržaj predloška ne može biti prazan');
      return;
    }

    try {
      if (isEditing && id) {
        await updateTemplate.mutateAsync({
          id,
          name,
          description: description || null,
          html_content: htmlContent,
          is_default: isDefault,
          is_active: isActive,
        });
      } else {
        await createTemplate.mutateAsync({
          name,
          description: description || null,
          html_content: htmlContent,
          is_default: isDefault,
          is_active: isActive,
        });
      }
      navigate('/ugovori/predlosci');
    } catch (error) {
      // Error already handled in mutation
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    // This is a simple approach - ideally we'd insert at cursor position
    setHtmlContent(prev => prev + placeholder);
    toast.success(`Placeholder ${placeholder} dodan na kraj`);
  };

  if (loadingTemplate && isEditing) {
    return (
      <MainLayout title="Učitavanje...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title={isEditing ? 'Uredi predložak ugovora' : 'Novi predložak ugovora'}
      subtitle="WYSIWYG editor za potpunu kontrolu izgleda ugovora"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/ugovori/predlosci')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isEditing ? 'Uredi predložak' : 'Novi predložak ugovora'}
              </h1>
              <p className="text-muted-foreground">
                Uredite tekst i izgled ugovora kako želite
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Sakrij pregled' : 'Pregled'}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createTemplate.isPending || updateTemplate.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Spremi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Settings & Placeholders */}
          <div className="space-y-4">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Postavke predloška</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Naziv predloška *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="npr. Standardni ugovor"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kratki opis predloška..."
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="is_default">Zadani predložak</Label>
                  </div>
                  <Switch
                    id="is_default"
                    checked={isDefault}
                    onCheckedChange={setIsDefault}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Aktivan</Label>
                  <Switch
                    id="is_active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Placeholders */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Dinamički podaci
                </CardTitle>
                <CardDescription className="text-xs">
                  Kliknite za dodavanje u predložak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {placeholders.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => insertPlaceholder(p.key)}
                      className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors"
                    >
                      <code className="text-primary font-mono">{p.key}</code>
                      <span className="text-muted-foreground ml-2">— {p.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Pregled</TabsTrigger>
                <TabsTrigger value="html">HTML kod</TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <WysiwygEditor
                  content={htmlContent}
                  onChange={setHtmlContent}
                  placeholder="Počnite pisati sadržaj ugovora..."
                  editorClassName="min-h-[600px]"
                />
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardContent className="p-6">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(getPreviewContent()) 
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="html">
                <Card>
                  <CardContent className="p-4">
                    <Textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      className="font-mono text-xs min-h-[600px]"
                      placeholder="HTML sadržaj..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
