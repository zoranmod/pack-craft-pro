import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shirt, Plus, Search, X, Edit, Trash2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEmployees } from '@/hooks/useEmployees';
import {
  useAllWorkClothing,
  useCreateWorkClothing,
  useUpdateWorkClothing,
  useDeleteWorkClothing,
  useItemTypes,
  WorkClothingWithEmployee,
} from '@/hooks/useWorkClothingOverview';

const CONDITION_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'dobro', label: 'Dobro' },
  { value: 'rabljeno', label: 'Rabljeno' },
  { value: 'oštećeno', label: 'Oštećeno' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Svi statusi' },
  { value: 'ok', label: 'U redu' },
  { value: 'soon', label: 'Uskoro zamjena' },
  { value: 'overdue', label: 'Kasni' },
];

const COMMON_ITEMS = [
  'Majica',
  'Hlače',
  'Jakna',
  'Cipele',
  'Kapa',
  'Rukavice',
  'Prsluk',
  'Kombinezon',
  'Ostalo',
];

const getStatusBadge = (status: 'ok' | 'soon' | 'overdue') => {
  switch (status) {
    case 'ok':
      return (
        <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 gap-1">
          <CheckCircle className="h-3 w-3" />
          U redu
        </Badge>
      );
    case 'soon':
      return (
        <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 gap-1">
          <Clock className="h-3 w-3" />
          Uskoro
        </Badge>
      );
    case 'overdue':
      return (
        <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Kasni
        </Badge>
      );
  }
};

const getConditionLabel = (condition: string) => {
  return CONDITION_OPTIONS.find(c => c.value === condition)?.label || condition;
};

const RadnaOdjeca = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkClothingWithEmployee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    employee_id: '',
    item_name: '',
    size: '',
    quantity: 1,
    assigned_date: new Date().toISOString().split('T')[0],
    condition: 'novo',
    notes: '',
  });

  // Data hooks
  const { employees } = useEmployees();
  const { data: workClothing = [], isLoading } = useAllWorkClothing({
    itemType: itemTypeFilter,
    status: statusFilter,
    search: debouncedSearch,
  });
  const { data: itemTypes = [] } = useItemTypes();
  const createClothing = useCreateWorkClothing();
  const updateClothing = useUpdateWorkClothing();
  const deleteClothing = useDeleteWorkClothing();

  // Stats
  const totalActive = workClothing.filter(c => !c.return_date).length;
  const dueSoon = workClothing.filter(c => c.status === 'soon').length;
  const overdue = workClothing.filter(c => c.status === 'overdue').length;

  const resetForm = () => {
    setForm({
      employee_id: '',
      item_name: '',
      size: '',
      quantity: 1,
      assigned_date: new Date().toISOString().split('T')[0],
      condition: 'novo',
      notes: '',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingItem(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: WorkClothingWithEmployee) => {
    setForm({
      employee_id: item.employee_id,
      item_name: item.item_name,
      size: item.size || '',
      quantity: item.quantity,
      assigned_date: item.assigned_date,
      condition: item.condition,
      notes: item.notes || '',
    });
    setEditingItem(item);
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.item_name || !form.assigned_date) return;

    if (editingItem) {
      await updateClothing.mutateAsync({
        id: editingItem.id,
        item_name: form.item_name,
        size: form.size || undefined,
        quantity: form.quantity,
        assigned_date: form.assigned_date,
        condition: form.condition,
        notes: form.notes || undefined,
      });
    } else {
      await createClothing.mutateAsync({
        employee_id: form.employee_id,
        item_name: form.item_name,
        size: form.size || undefined,
        quantity: form.quantity,
        assigned_date: form.assigned_date,
        condition: form.condition,
        notes: form.notes || undefined,
      });
    }
    setIsAddOpen(false);
    resetForm();
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteClothing.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout
      title="Radna odjeća"
      subtitle="Pregled zadužene radne odjeće i opreme"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Aktivna zaduženja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shirt className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{totalActive}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Uskoro za zamjenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{dueSoon}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Kasni zamjena</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-2xl font-bold">{overdue}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Pretraži po imenu ili stavci..."
              className="w-72"
            />
            <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Stavka" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve stavke</SelectItem>
                {itemTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj zaduženje
          </Button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
        ) : workClothing.length === 0 ? (
          <div className="text-center py-12">
            <Shirt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nema zapisa</h3>
            <p className="text-muted-foreground">Nema radne odjeće za odabrane filtere</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zaposlenik</TableHead>
                    <TableHead>Stavka</TableHead>
                    <TableHead>Veličina</TableHead>
                    <TableHead>Količina</TableHead>
                    <TableHead>Datum izdavanja</TableHead>
                    <TableHead>Sljedeća zamjena</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stanje</TableHead>
                    <TableHead>Napomena</TableHead>
                    <TableHead className="text-right">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workClothing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.employee_name}</TableCell>
                      <TableCell>{item.item_name}</TableCell>
                      <TableCell>{item.size || '-'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{format(parseISO(item.assigned_date), 'dd.MM.yyyy', { locale: hr })}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.next_replacement_at ? format(parseISO(item.next_replacement_at), 'dd.MM.yyyy', { locale: hr }) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>{getConditionLabel(item.condition)}</TableCell>
                      <TableCell className="max-w-[150px] truncate text-muted-foreground">
                        {item.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Uredi zaduženje' : 'Dodaj zaduženje'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editingItem && (
              <div className="space-y-2">
                <Label>Zaposlenik *</Label>
                <Select value={form.employee_id} onValueChange={(v) => setForm(prev => ({ ...prev, employee_id: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Odaberi zaposlenika" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Stavka *</Label>
              <Select value={form.item_name} onValueChange={(v) => setForm(prev => ({ ...prev, item_name: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi stavku" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_ITEMS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Veličina</Label>
                <Input
                  value={form.size}
                  onChange={(e) => setForm(prev => ({ ...prev, size: e.target.value }))}
                  placeholder="npr. XL, 42, ..."
                />
              </div>
              <div className="space-y-2">
                <Label>Količina</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={(e) => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum izdavanja *</Label>
                <Input
                  type="date"
                  value={form.assigned_date}
                  onChange={(e) => setForm(prev => ({ ...prev, assigned_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Stanje</Label>
                <Select value={form.condition} onValueChange={(v) => setForm(prev => ({ ...prev, condition: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Napomena</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Opcijska napomena..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Odustani</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.item_name || !form.assigned_date || (!editingItem && !form.employee_id) || createClothing.isPending || updateClothing.isPending}
            >
              {editingItem ? 'Spremi' : 'Dodaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši zaduženje?</AlertDialogTitle>
            <AlertDialogDescription>
              Zapis će biti premješten u kantu za smeće. Možete ga vratiti iz kante ako se predomislite.
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
    </MainLayout>
  );
};

export default RadnaOdjeca;
