import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Star, Eye, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  useContractLayoutTemplates, 
  useDeleteContractLayoutTemplate,
  useUpdateContractLayoutTemplate,
  useCreateContractLayoutTemplate
} from '@/hooks/useContractLayoutTemplates';
import { useCompanySettings } from '@/hooks/useSettings';
import { formatDateHR } from '@/lib/utils';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

export default function ContractLayoutTemplates() {
  const navigate = useNavigate();
  const { data: templates, isLoading } = useContractLayoutTemplates();
  const { data: companySettings } = useCompanySettings();
  const deleteTemplate = useDeleteContractLayoutTemplate();
  const updateTemplate = useUpdateContractLayoutTemplate();
  const createTemplate = useCreateContractLayoutTemplate();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteTemplate.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleToggleDefault = async (id: string, currentDefault: boolean) => {
    try {
      await updateTemplate.mutateAsync({
        id,
        is_default: !currentDefault,
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      await createTemplate.mutateAsync({
        name: `${template.name} (kopija)`,
        description: template.description,
        html_content: template.html_content,
        is_default: false,
        is_active: true,
      });
      toast.success('Predložak dupliciran!');
    } catch (error) {
      // Error handled in mutation
    }
  };

  const getPreviewContent = (htmlContent: string) => {
    let content = htmlContent;
    content = content.replace(/\{naziv_prodavatelja\}/g, companySettings?.company_name || 'Akord d.o.o.');
    content = content.replace(/\{adresa_prodavatelja\}/g, companySettings?.address || 'Adresa tvrtke');
    content = content.replace(/\{oib_prodavatelja\}/g, companySettings?.oib || '12345678901');
    content = content.replace(/\{ime_kupca\}/g, 'Ivan Horvat');
    content = content.replace(/\{adresa_kupca\}/g, 'Ulica 123, Zagreb');
    content = content.replace(/\{ukupna_cijena\}/g, '10.000,00 €');
    content = content.replace(/\{datum\}/g, formatDateHR(new Date()));
    // Replace remaining placeholders with generic text
    content = content.replace(/\{[^}]+\}/g, '[...]');
    return content;
  };

  if (isLoading) {
    return (
      <MainLayout title="Predlošci ugovora">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Predlošci ugovora" 
      subtitle="WYSIWYG predlošci za potpunu kontrolu izgleda ugovora"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Predlošci ugovora</h1>
            <p className="text-muted-foreground">
              Kreirajte i upravljajte predlošcima za izgled ugovora
            </p>
          </div>
          <Button onClick={() => navigate('/ugovori/predlosci/novi')}>
            <Plus className="h-4 w-4 mr-2" />
            Novi predložak
          </Button>
        </div>

        {/* Templates Grid */}
        {templates && templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`relative ${!template.is_active ? 'opacity-60' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </CardTitle>
                      {template.description && (
                        <CardDescription className="text-xs">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {!template.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Neaktivan
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Preview snippet */}
                  <div 
                    className="text-xs text-muted-foreground line-clamp-3 prose prose-xs max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(
                        getPreviewContent(template.html_content).substring(0, 200) + '...'
                      ) 
                    }}
                  />
                  
                  <div className="text-xs text-muted-foreground">
                    Ažurirano: {formatDateHR(template.updated_at)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Pregled
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/ugovori/predlosci/${template.id}`)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Uredi
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Kopiraj
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleDefault(template.id, template.is_default)}
                      className={template.is_default ? 'text-yellow-600' : ''}
                    >
                      <Star className={`h-4 w-4 mr-1 ${template.is_default ? 'fill-current' : ''}`} />
                      {template.is_default ? 'Zadani' : 'Postavi'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive ml-auto"
                      onClick={() => setDeleteId(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Nemate još nijedan predložak ugovora
              </p>
              <Button onClick={() => navigate('/ugovori/predlosci/novi')}>
                <Plus className="h-4 w-4 mr-2" />
                Kreiraj prvi predložak
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja će trajno obrisati predložak. Ova radnja se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div 
            className="prose prose-sm max-w-none mt-4"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(
                previewTemplate ? getPreviewContent(previewTemplate.html_content) : ''
              ) 
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
