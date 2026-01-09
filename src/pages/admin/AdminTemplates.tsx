import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  StarOff,
  Eye,
  FileCheck,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useDocumentTemplates, useDeleteDocumentTemplate, useUpdateDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

const documentTypes = [
  { value: 'ponuda', label: 'Ponude' },
  { value: 'racun', label: 'Računi' },
  { value: 'otpremnica', label: 'Otpremnice' },
  { value: 'ugovor', label: 'Ugovori' },
  { value: 'nalog-dostava-montaza', label: 'Nalozi' },
];

const AdminTemplates = () => {
  const [activeTab, setActiveTab] = useState('ponuda');
  const { data: templates, isLoading } = useDocumentTemplates(activeTab);
  const deleteTemplate = useDeleteDocumentTemplate();
  const updateTemplate = useUpdateDocumentTemplate();

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj predložak?')) return;
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Predložak obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju predloška');
    }
  };

  const handleSetDefault = async (id: string, isCurrentDefault: boolean) => {
    try {
      await updateTemplate.mutateAsync({ id, is_default: !isCurrentDefault });
      toast.success(isCurrentDefault ? 'Predložak više nije zadani' : 'Predložak postavljen kao zadani');
    } catch (error) {
      toast.error('Greška pri ažuriranju predloška');
    }
  };

  const defaultTemplate = templates?.find(t => t.is_default);
  const hasTemplates = templates && templates.length > 0;

  return (
    <MainLayout title="Predlošci dokumenata" subtitle="Upravljanje predlošcima za sve vrste dokumenata">
      <div className="space-y-6">
        {/* Debug Info Card */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {defaultTemplate ? (
                  <>
                    <FileCheck className="h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-medium">
                        Aktivni predložak za {documentTypes.find(d => d.value === activeTab)?.label}: 
                        <span className="text-primary ml-1">{defaultTemplate.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {defaultTemplate.id.slice(0, 8)}... | 
                        Ažurirano: {format(new Date(defaultTemplate.updated_at || ''), 'dd.MM.yyyy HH:mm', { locale: hr })}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-yellow-600">
                        Nema zadanog predloška za {documentTypes.find(d => d.value === activeTab)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dokumenti će koristiti fallback (sistemski) predložak
                      </p>
                    </div>
                  </>
                )}
              </div>
              <Button asChild>
                <Link to="/settings/templates/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Novi predložak
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Template Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {documentTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value}>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {documentTypes.map((type) => (
            <TabsContent key={type.value} value={type.value}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !hasTemplates ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nema predložaka za {type.label}</h3>
                    <p className="text-muted-foreground mb-4">
                      Kreirajte prvi predložak za ovu vrstu dokumenta
                    </p>
                    <Button asChild>
                      <Link to="/settings/templates/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Kreiraj predložak
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates?.map((template) => (
                    <Card key={template.id} className={template.is_default ? 'ring-2 ring-primary' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {template.name}
                              {template.is_default && (
                                <Badge variant="default" className="text-xs">Zadani</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              Ažurirano: {format(new Date(template.updated_at || ''), 'dd.MM.yyyy', { locale: hr })}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground space-y-1 mb-4">
                          <p>Font: {template.font_family || 'Helvetica'}</p>
                          <p>Veličina: {template.body_font_size || 10}pt</p>
                          <p>Logo: {template.show_logo ? 'Da' : 'Ne'}</p>
                          <p>Certifikati: {template.show_certificates ? 'Da' : 'Ne'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetDefault(template.id, !!template.is_default)}
                            title={template.is_default ? 'Ukloni kao zadani' : 'Postavi kao zadani'}
                          >
                            {template.is_default ? (
                              <Star className="h-4 w-4 text-primary fill-primary" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/settings/templates/${template.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(template.id)}
                            disabled={deleteTemplate.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminTemplates;
