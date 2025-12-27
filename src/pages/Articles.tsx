import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Upload } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, Article, CreateArticleData } from '@/hooks/useArticles';
import { ArticleImportDialog } from '@/components/articles/ArticleImportDialog';

const emptyForm: CreateArticleData = {
  code: '',
  name: '',
  unit: 'kom',
  price: 0,
  pdv: 25,
  description: '',
};

const Articles = () => {
  const { data: articles = [], isLoading } = useArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateArticleData>(emptyForm);

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(search.toLowerCase()) ||
    (article.code && article.code.toLowerCase().includes(search.toLowerCase()))
  );

  const openNew = () => {
    setEditingArticle(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      code: article.code || '',
      name: article.name,
      unit: article.unit,
      price: article.price,
      pdv: article.pdv,
      description: article.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingArticle) {
      await updateArticle.mutateAsync({ id: editingArticle.id, ...formData });
    } else {
      await createArticle.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteArticle.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout title="Artikli" subtitle="Upravljajte bazom artikala">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pretraži artikle..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsImportOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Uvoz iz Excel-a
            </Button>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj artikl
            </Button>
          </div>
        </div>
        {/* Articles Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nema artikala</h3>
            <p className="text-muted-foreground mb-4">Dodajte prvi artikl da započnete</p>
            <Button onClick={openNew} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj artikl
            </Button>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Naziv</TableHead>
                  <TableHead>Jedinica</TableHead>
                  <TableHead className="text-right">Cijena</TableHead>
                  <TableHead className="text-right">PDV</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-mono text-muted-foreground">
                      {article.code || '-'}
                    </TableCell>
                    <TableCell className="font-medium">{article.name}</TableCell>
                    <TableCell>{article.unit}</TableCell>
                    <TableCell className="text-right">
                      {article.price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                    </TableCell>
                    <TableCell className="text-right">{article.pdv}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(article)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(article.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Uredi artikl' : 'Novi artikl'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="code">Šifra</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ART-001"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="unit">Jedinica mjere</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kom">kom</SelectItem>
                    <SelectItem value="m">m</SelectItem>
                    <SelectItem value="m²">m²</SelectItem>
                    <SelectItem value="usluga">usluga</SelectItem>
                    <SelectItem value="sat">sat</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="name">Naziv *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Naziv artikla"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="price">Cijena (€)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="pdv">PDV (%)</Label>
                <Select
                  value={formData.pdv?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, pdv: parseFloat(value) })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="13">13%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Opis artikla..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Odustani
              </Button>
              <Button type="submit" disabled={createArticle.isPending || updateArticle.isPending}>
                {editingArticle ? 'Spremi promjene' : 'Dodaj artikl'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati artikl?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja se ne može poništiti. Artikl će biti trajno obrisan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ArticleImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </MainLayout>
  );
};

export default Articles;
