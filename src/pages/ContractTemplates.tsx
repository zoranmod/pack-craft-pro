import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Loader2, Download } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useContractArticleTemplates,
  useInitializeDefaultTemplates,
  useCreateContractArticleTemplate,
  useUpdateContractArticleTemplate,
  useDeleteContractArticleTemplate,
} from '@/hooks/useContractArticles';
import { ContractArticleTemplate } from '@/types/contractArticle';

const ContractTemplates = () => {
  const { data: templates = [], isLoading } = useContractArticleTemplates();
  const initializeTemplates = useInitializeDefaultTemplates();
  const createTemplate = useCreateContractArticleTemplate();
  const updateTemplate = useUpdateContractArticleTemplate();
  const deleteTemplate = useDeleteContractArticleTemplate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newArticle, setNewArticle] = useState({
    article_number: 1,
    title: '',
    content: '',
    is_active: true,
  });

  // Initialize templates on mount if none exist
  useEffect(() => {
    if (!isLoading && templates.length === 0) {
      initializeTemplates.mutate();
    }
  }, [isLoading, templates.length]);

  const handleStartEdit = (template: ContractArticleTemplate) => {
    setEditingId(template.id);
    setEditForm({ title: template.title, content: template.content });
  };

  const handleSaveEdit = (id: string) => {
    updateTemplate.mutate({
      id,
      title: editForm.title,
      content: editForm.content,
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', content: '' });
  };

  const handleToggleActive = (template: ContractArticleTemplate) => {
    updateTemplate.mutate({
      id: template.id,
      is_active: !template.is_active,
    });
  };

  const handleDelete = (id: string) => {
    deleteTemplate.mutate(id);
  };

  const handleAddArticle = () => {
    const maxNumber = templates.reduce((max, t) => Math.max(max, t.article_number), 0);
    createTemplate.mutate({
      ...newArticle,
      article_number: maxNumber + 1,
    });
    setNewArticle({ article_number: 1, title: '', content: '', is_active: true });
    setIsAddDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MainLayout title="Predlošci ugovora" subtitle="Učitavanje...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="Predlošci članaka ugovora"
      subtitle={`Ukupno ${templates.length} članaka`}
    >
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          Upravljajte člancima koji se koriste pri kreiranju ugovora.
        </p>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novi članak
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novi članak</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="new-title">Naslov članka</Label>
                <Input
                  id="new-title"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="npr. UVJETI PLAĆANJA"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="new-content">Sadržaj</Label>
                <Textarea
                  id="new-content"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  placeholder="Unesite sadržaj članka..."
                  rows={6}
                  className="mt-1.5"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Koristite {'{placeholder}'} za dinamičke vrijednosti, npr. {'{ukupna_cijena}'}, {'{predujam}'}, {'{datum_ugovora}'}.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Odustani
                </Button>
                <Button onClick={handleAddArticle} disabled={!newArticle.title || !newArticle.content}>
                  Dodaj članak
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates List */}
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-4 pr-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 transition-opacity ${!template.is_active ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingId === template.id ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        placeholder="Naslov članka"
                      />
                      <Textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        rows={6}
                        className="font-mono text-sm"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSaveEdit(template.id)}>
                          <Check className="h-4 w-4 mr-1" />
                          Spremi
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Odustani
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary">
                          Članak {template.article_number}.
                        </span>
                        <h3 className="font-semibold text-foreground">{template.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                        {template.content}
                      </p>
                    </>
                  )}
                </div>

                {editingId !== template.id && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${template.id}`} className="text-sm text-muted-foreground">
                        Aktivan
                      </Label>
                      <Switch
                        id={`active-${template.id}`}
                        checked={template.is_active}
                        onCheckedChange={() => handleToggleActive(template)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartEdit(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Obrisati članak?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ova radnja je nepovratna. Članak "{template.title}" će biti trajno obrisan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Odustani</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(template.id)}
                          >
                            Obriši
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </MainLayout>
  );
};

export default ContractTemplates;
