import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
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
import { useWorkClothing } from '@/hooks/useEmployees';

interface WorkClothingTabProps {
  employeeId: string;
}

export function WorkClothingTab({ employeeId }: WorkClothingTabProps) {
  const { clothing, create, update, remove } = useWorkClothing(employeeId);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    item_name: '',
    size: '',
    quantity: 1,
    assigned_date: new Date().toISOString().split('T')[0],
    return_date: '',
    condition: 'novo',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      item_name: '',
      size: '',
      quantity: 1,
      assigned_date: new Date().toISOString().split('T')[0],
      return_date: '',
      condition: 'novo',
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpen = (item?: typeof clothing[0]) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        item_name: item.item_name,
        size: item.size || '',
        quantity: item.quantity,
        assigned_date: item.assigned_date,
        return_date: item.return_date || '',
        condition: item.condition,
        notes: item.notes || '',
      });
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      employee_id: employeeId,
      item_name: form.item_name,
      size: form.size || undefined,
      quantity: form.quantity,
      assigned_date: form.assigned_date,
      return_date: form.return_date || undefined,
      condition: form.condition,
      notes: form.notes || undefined,
    };

    if (editingId) {
      await update.mutateAsync({ id: editingId, ...data });
    } else {
      await create.mutateAsync(data);
    }
    setIsOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Jeste li sigurni da želite obrisati ovu opremu?')) {
      await remove.mutateAsync(id);
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'novo':
        return <Badge className="bg-green-500">Novo</Badge>;
      case 'dobro':
        return <Badge variant="secondary">Dobro</Badge>;
      case 'za_zamjenu':
        return <Badge variant="destructive">Za zamjenu</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const activeItems = clothing.filter((c) => !c.return_date);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ukupno artikala</p>
              <p className="text-3xl font-bold">{clothing.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Aktivno zaduženo</p>
              <p className="text-3xl font-bold text-primary">{activeItems.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Zadužena radna odjeća i oprema</CardTitle>
          <Button size="sm" onClick={() => handleOpen()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo zaduženje
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikal</TableHead>
                <TableHead>Veličina</TableHead>
                <TableHead>Količina</TableHead>
                <TableHead>Datum zaduženja</TableHead>
                <TableHead>Datum vraćanja</TableHead>
                <TableHead>Stanje</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clothing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Nema zadužene opreme
                  </TableCell>
                </TableRow>
              ) : (
                clothing.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item_name}</TableCell>
                    <TableCell>{item.size || '-'}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{new Date(item.assigned_date).toLocaleDateString('hr-HR')}</TableCell>
                    <TableCell>
                      {item.return_date
                        ? new Date(item.return_date).toLocaleDateString('hr-HR')
                        : '-'}
                    </TableCell>
                    <TableCell>{getConditionBadge(item.condition)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleOpen(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Uredi opremu' : 'Novo zaduženje'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Naziv artikla *</Label>
              <Input
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                placeholder="npr. Radna jakna, Cipele, Kaciga..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Veličina</Label>
                <Input
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  placeholder="npr. L, 42, XL..."
                />
              </div>
              <div>
                <Label>Količina</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Datum zaduženja *</Label>
                <Input
                  type="date"
                  value={form.assigned_date}
                  onChange={(e) => setForm({ ...form, assigned_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Datum vraćanja</Label>
                <Input
                  type="date"
                  value={form.return_date}
                  onChange={(e) => setForm({ ...form, return_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Stanje</Label>
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="dobro">Dobro</SelectItem>
                  <SelectItem value="za_zamjenu">Za zamjenu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Napomene</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Odustani</Button>
              <Button onClick={handleSubmit}>{editingId ? 'Spremi' : 'Dodaj'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
