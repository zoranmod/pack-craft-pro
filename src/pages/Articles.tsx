import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, Upload, ChevronLeft, ChevronRight, Bookmark, X } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle, Article, CreateArticleData } from '@/hooks/useArticles';
import { ArticleImportDialog } from '@/components/articles/ArticleImportDialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useDebounce } from '@/hooks/useDebounce';

const emptyForm: CreateArticleData = {
  code: '',
  name: '',
  unit: 'kom',
  price: 0,
  pdv: 25,
  description: '',
  barcode: '',
  purchase_price: 0,
  stock: 0,
  is_template: false,
};

const Articles = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const { data, isLoading } = useArticles({ page, pageSize, search: debouncedSearch });
  const articles = data?.articles || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = data?.totalPages || 1;

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateArticleData>(emptyForm);

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
      barcode: article.barcode || '',
      purchase_price: article.purchase_price,
      stock: article.stock,
      is_template: article.is_template,
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
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Pretraži artikle..."
              className="pl-9 pr-9"
            />
            {search && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
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
        {/* Info bar */}
        {!isLoading && totalCount > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Ukupno: <strong className="text-foreground">{totalCount.toLocaleString('hr-HR')}</strong> artikala</span>
            <div className="flex items-center gap-2">
              <span>Prikaz po stranici:</span>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Articles Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {debouncedSearch ? `Nema rezultata za "${debouncedSearch}"` : 'Nema artikala'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearch ? 'Pokušajte s drugim pojmom' : 'Dodajte prvi artikl da započnete'}
            </p>
            {!debouncedSearch && (
              <Button onClick={openNew} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj artikl
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Šifra</TableHead>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Barkod</TableHead>
                    <TableHead>Jedinica</TableHead>
                    <TableHead className="text-right">Nab. cijena</TableHead>
                    <TableHead className="text-right">Cijena</TableHead>
                    <TableHead className="text-right">Stanje</TableHead>
                    <TableHead className="text-right">PDV</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
<TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-mono text-muted-foreground min-w-[80px] max-w-[120px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block whitespace-normal break-words cursor-default">
                              {article.code || '-'}
                            </span>
                          </TooltipTrigger>
                          {article.code && (
                            <TooltipContent>
                              <p>{article.code}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell className="font-medium min-w-[150px] max-w-[300px]">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block whitespace-normal break-words cursor-default">
                                {article.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[400px]">
                              <p>{article.name}</p>
                            </TooltipContent>
                          </Tooltip>
                          {article.is_template && (
                            <Badge variant="secondary" className="gap-1 shrink-0">
                              <Bookmark className="h-3 w-3" />
                              Šablona
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground text-xs min-w-[100px] max-w-[150px]">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="block whitespace-normal break-words cursor-default">
                              {article.barcode || '-'}
                            </span>
                          </TooltipTrigger>
                          {article.barcode && (
                            <TooltipContent>
                              <p>{article.barcode}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell>{article.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {article.purchase_price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {article.price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={article.stock <= 0 ? 'text-destructive' : article.stock < 10 ? 'text-yellow-500' : 'text-green-500'}>
                          {article.stock.toLocaleString('hr-HR')}
                        </span>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  Stranica {page} od {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prethodna
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Sljedeća
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
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
              <div>
                <Label htmlFor="barcode">Barkod</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="3859890123456"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">Nabavna cijena (€)</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.purchase_price}
                  onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stanje zalihe</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                  className="mt-1.5"
                />
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
              <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                <Checkbox
                  id="is_template"
                  checked={formData.is_template}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_template: checked === true })}
                />
                <Label htmlFor="is_template" className="cursor-pointer flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Koristi kao brzu šablonu
                </Label>
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
