import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Edit2, Trash2, Star, StarOff, Loader2, FileCode } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDocumentTemplates,
  useDeleteDocumentTemplate,
  useUpdateDocumentTemplate,
  DocumentTemplate,
} from '@/hooks/useDocumentTemplates';
import { documentTypeLabels, DocumentType } from '@/types/document';

const documentTypes: DocumentType[] = ['ponuda', 'ugovor', 'otpremnica', 'racun', 'nalog-dostava-montaza'];

const DocumentTemplates = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('ponuda');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { data: templates, isLoading } = useDocumentTemplates();
  const deleteTemplate = useDeleteDocumentTemplate();
  const updateTemplate = useUpdateDocumentTemplate();

  const filteredTemplates = templates?.filter(t => t.document_type === activeTab) || [];

  const handleToggleDefault = (template: DocumentTemplate) => {
    updateTemplate.mutate({
      id: template.id,
      document_type: template.document_type,
      is_default: !template.is_default,
    });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTemplate.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout
      title="Predlošci dokumenata"
      subtitle="Upravljajte izgledom vaših dokumenata"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => navigate('/settings/templates/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Novi predložak
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {documentTypes.map((type) => (
              <TabsTrigger key={type} value={type} className="min-w-fit">
                {documentTypeLabels[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          {documentTypes.map((type) => (
            <TabsContent key={type} value={type}>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Nemate nijedan predložak za {documentTypeLabels[type].toLowerCase()}.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate('/settings/templates/new', { state: { documentType: type } })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Kreiraj prvi predložak
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="relative">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription>
                              {documentTypeLabels[template.document_type as DocumentType]}
                            </CardDescription>
                          </div>
                          <div className="flex gap-1">
                            {template.use_wysiwyg && (
                              <Badge variant="outline" className="text-xs">
                                <FileCode className="h-3 w-3 mr-1" />
                                WYSIWYG
                              </Badge>
                            )}
                            {template.is_default && (
                              <Badge variant="secondary">Zadani</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {template.use_wysiwyg ? (
                            <p className="text-primary">Slobodno uređivanje sadržaja</p>
                          ) : (
                            <>
                              <p>Font: {template.font_family}</p>
                              <p>Stupci tablice: {template.table_columns?.length || 0}</p>
                              <p>
                                {template.show_logo ? '✓ Logo' : '✗ Logo'} | 
                                {template.show_signature_line ? ' ✓ Potpis' : ' ✗ Potpis'}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleDefault(template)}
                            disabled={updateTemplate.isPending}
                          >
                            {template.is_default ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/settings/templates/${template.id}`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja će trajno obrisati predložak. Ovu radnju nije moguće poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default DocumentTemplates;
