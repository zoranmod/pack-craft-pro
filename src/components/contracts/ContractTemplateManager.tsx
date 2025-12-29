import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronUp, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  useContractArticleTemplates,
  useCreateContractArticleTemplate,
  useUpdateContractArticleTemplate,
  useDeleteContractArticleTemplate,
} from '@/hooks/useContractArticles';
import { toast } from 'sonner';

interface ContractTemplateManagerProps {
  onTemplatesUpdated?: () => void;
}

export function ContractTemplateManager({ onTemplatesUpdated }: ContractTemplateManagerProps) {
  const { data: templates, isLoading } = useContractArticleTemplates();
  const createTemplate = useCreateContractArticleTemplate();
  const updateTemplate = useUpdateContractArticleTemplate();
  const deleteTemplate = useDeleteContractArticleTemplate();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const startEditing = (template: any) => {
    setEditingId(template.id);
    setEditTitle(template.title);
    setEditContent(template.content);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    
    try {
      await updateTemplate.mutateAsync({
        id: editingId,
        title: editTitle,
        content: editContent,
      });
      setEditingId(null);
      onTemplatesUpdated?.();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const toggleActive = async (template: any) => {
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        is_active: !template.is_active,
      });
      onTemplatesUpdated?.();
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj predložak?')) return;
    
    try {
      await deleteTemplate.mutateAsync(id);
      onTemplatesUpdated?.();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Unesite naslov i sadržaj članka');
      return;
    }

    try {
      const nextNumber = (templates?.length || 0) + 1;
      await createTemplate.mutateAsync({
        article_number: nextNumber,
        title: newTitle,
        content: newContent,
        is_active: true,
      });
      setNewTitle('');
      setNewContent('');
      setShowNewForm(false);
      onTemplatesUpdated?.();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Uredi predloške
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Predlošci članaka ugovora</SheetTitle>
          <SheetDescription>
            Upravljajte predlošcima članaka koji se koriste pri izradi novih ugovora.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* New Template Form */}
          {showNewForm ? (
            <div className="border border-primary/50 rounded-lg p-4 space-y-3 bg-primary/5">
              <div>
                <Label>Naslov članka</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Npr. PREDMET UGOVORA"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Sadržaj</Label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Unesite sadržaj članka..."
                  rows={4}
                  className="mt-1.5"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewForm(false)}>
                  <X className="h-4 w-4 mr-1" />
                  Odustani
                </Button>
                <Button size="sm" onClick={handleCreate} disabled={createTemplate.isPending}>
                  <Check className="h-4 w-4 mr-1" />
                  Spremi
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj novi predložak
            </Button>
          )}

          {/* Templates List */}
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2 pr-4">
              {isLoading ? (
                <p className="text-muted-foreground text-center py-8">Učitavanje...</p>
              ) : templates?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nema predložaka</p>
              ) : (
                templates?.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg transition-colors ${
                      template.is_active ? 'border-border' : 'border-border/50 bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={() => toggleActive(template)}
                      />
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                      >
                        <span className={`font-medium ${!template.is_active ? 'text-muted-foreground' : ''}`}>
                          Članak {template.article_number}. {template.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setExpandedId(expandedId === template.id ? null : template.id)}
                        >
                          {expandedId === template.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedId === template.id && (
                      <div className="border-t p-3 space-y-3">
                        {editingId === template.id ? (
                          <>
                            <div>
                              <Label>Naslov</Label>
                              <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="mt-1.5"
                              />
                            </div>
                            <div>
                              <Label>Sadržaj</Label>
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={6}
                                className="mt-1.5 font-mono text-sm"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                <X className="h-4 w-4 mr-1" />
                                Odustani
                              </Button>
                              <Button size="sm" onClick={saveEdit} disabled={updateTemplate.isPending}>
                                <Check className="h-4 w-4 mr-1" />
                                Spremi
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {template.content}
                            </p>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(template)}
                              >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Uredi
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(template.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Obriši
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
