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
import { useSickLeaves } from '@/hooks/useEmployees';

interface SickLeaveTabProps {
  employeeId: string;
}

export function SickLeaveTab({ employeeId }: SickLeaveTabProps) {
  const { sickLeaves, create, update, remove } = useSickLeaves(employeeId);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    days_count: 1,
    sick_leave_type: 'bolovanje',
    document_number: '',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      start_date: '',
      end_date: '',
      days_count: 1,
      sick_leave_type: 'bolovanje',
      document_number: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpen = (sickLeave?: typeof sickLeaves[0]) => {
    if (sickLeave) {
      setEditingId(sickLeave.id);
      setForm({
        start_date: sickLeave.start_date,
        end_date: sickLeave.end_date || '',
        days_count: sickLeave.days_count || 1,
        sick_leave_type: sickLeave.sick_leave_type,
        document_number: sickLeave.document_number || '',
        notes: sickLeave.notes || '',
      });
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      employee_id: employeeId,
      start_date: form.start_date,
      end_date: form.end_date || undefined,
      days_count: form.days_count || undefined,
      sick_leave_type: form.sick_leave_type,
      document_number: form.document_number || undefined,
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
    if (confirm('Jeste li sigurni da želite obrisati ovo bolovanje?')) {
      await remove.mutateAsync(id);
    }
  };

  const totalDays = sickLeaves.reduce((sum, sl) => sum + (sl.days_count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ukupno bolovanja</p>
              <p className="text-3xl font-bold">{sickLeaves.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ukupno dana</p>
              <p className="text-3xl font-bold">{totalDays}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evidencija bolovanja</CardTitle>
          <Button size="sm" onClick={() => handleOpen()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo bolovanje
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Dana</TableHead>
                <TableHead>Vrsta</TableHead>
                <TableHead>Broj doznake</TableHead>
                <TableHead>Napomena</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sickLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nema evidentiranih bolovanja
                  </TableCell>
                </TableRow>
              ) : (
                sickLeaves.map((sl) => (
                  <TableRow key={sl.id}>
                    <TableCell>
                      {(() => {
                        const formatD = (date: string) => {
                          const d = new Date(date);
                          const day = d.getDate().toString().padStart(2, '0');
                          const month = (d.getMonth() + 1).toString().padStart(2, '0');
                          const year = d.getFullYear();
                          return `${day}.${month}.${year}.`;
                        };
                        return formatD(sl.start_date) + (sl.end_date ? ` - ${formatD(sl.end_date)}` : '');
                      })()}
                    </TableCell>
                    <TableCell>{sl.days_count || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {sl.sick_leave_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{sl.document_number || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{sl.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleOpen(sl)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(sl.id)}
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
            <DialogTitle>{editingId ? 'Uredi bolovanje' : 'Novo bolovanje'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Od datuma *</Label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Do datuma</Label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Broj dana</Label>
                <Input
                  type="number"
                  value={form.days_count}
                  onChange={(e) => setForm({ ...form, days_count: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label>Vrsta</Label>
                <Select
                  value={form.sick_leave_type}
                  onValueChange={(v) => setForm({ ...form, sick_leave_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bolovanje">Bolovanje</SelectItem>
                    <SelectItem value="ozljeda_na_radu">Ozljeda na radu</SelectItem>
                    <SelectItem value="bolovanje_djeteta">Bolovanje djeteta</SelectItem>
                    <SelectItem value="njega_clana_obitelji">Njega člana obitelji</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Broj doznake</Label>
              <Input
                value={form.document_number}
                onChange={(e) => setForm({ ...form, document_number: e.target.value })}
              />
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
