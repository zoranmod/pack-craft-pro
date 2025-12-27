import { useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Download, AlertTriangle } from 'lucide-react';
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
import { useEmployeeDocuments } from '@/hooks/useEmployees';

interface DocumentsTabProps {
  employeeId: string;
}

export function DocumentsTab({ employeeId }: DocumentsTabProps) {
  const { documents, create, update, remove } = useEmployeeDocuments(employeeId);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    document_type: '',
    document_name: '',
    expiry_date: '',
    file_url: '',
    notes: '',
  });

  const resetForm = () => {
    setForm({
      document_type: '',
      document_name: '',
      expiry_date: '',
      file_url: '',
      notes: '',
    });
    setEditingId(null);
  };

  const handleOpen = (doc?: typeof documents[0]) => {
    if (doc) {
      setEditingId(doc.id);
      setForm({
        document_type: doc.document_type,
        document_name: doc.document_name,
        expiry_date: doc.expiry_date || '',
        file_url: doc.file_url || '',
        notes: doc.notes || '',
      });
    } else {
      resetForm();
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    const data = {
      employee_id: employeeId,
      document_type: form.document_type,
      document_name: form.document_name,
      expiry_date: form.expiry_date || undefined,
      file_url: form.file_url || undefined,
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
    if (confirm('Jeste li sigurni da želite obrisati ovaj dokument?')) {
      await remove.mutateAsync(id);
    }
  };

  const isExpired = (date?: string) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isExpiringSoon = (date?: string) => {
    if (!date) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiryDate = new Date(date);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
  };

  const expiringDocuments = documents.filter((d) => isExpiringSoon(d.expiry_date) || isExpired(d.expiry_date));

  return (
    <div className="space-y-6">
      {expiringDocuments.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Dokumenti koji ističu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {expiringDocuments.map((doc) => (
                <li key={doc.id} className="text-sm">
                  <span className="font-medium">{doc.document_name}</span>
                  {' - '}
                  {(() => {
                    const d = new Date(doc.expiry_date!);
                    const day = d.getDate().toString().padStart(2, '0');
                    const month = (d.getMonth() + 1).toString().padStart(2, '0');
                    const year = d.getFullYear();
                    const formatted = `${day}.${month}.${year}.`;
                    return isExpired(doc.expiry_date) ? (
                      <span className="text-destructive">Isteklo {formatted}</span>
                    ) : (
                      <span className="text-yellow-600">Ističe {formatted}</span>
                    );
                  })()}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dokumenti zaposlenika</CardTitle>
          <Button size="sm" onClick={() => handleOpen()}>
            <Plus className="h-4 w-4 mr-2" />
            Novi dokument
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vrsta</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead>Datum isteka</TableHead>
                <TableHead>Napomena</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nema dokumenata
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge variant="outline">{doc.document_type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.document_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.expiry_date ? (
                        <span
                          className={
                            isExpired(doc.expiry_date)
                              ? 'text-destructive'
                              : isExpiringSoon(doc.expiry_date)
                              ? 'text-yellow-600'
                              : ''
                          }
                        >
                          {(() => {
                            const d = new Date(doc.expiry_date);
                            const day = d.getDate().toString().padStart(2, '0');
                            const month = (d.getMonth() + 1).toString().padStart(2, '0');
                            const year = d.getFullYear();
                            return `${day}.${month}.${year}.`;
                          })()}
                          {isExpired(doc.expiry_date) && ' (isteklo)'}
                          {isExpiringSoon(doc.expiry_date) && ' (uskoro)'}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{doc.notes || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {doc.file_url && (
                          <Button size="sm" variant="ghost" asChild>
                            <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleOpen(doc)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(doc.id)}
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
            <DialogTitle>{editingId ? 'Uredi dokument' : 'Novi dokument'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vrsta dokumenta *</Label>
              <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Odaberi vrstu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ugovor">Ugovor o radu</SelectItem>
                  <SelectItem value="aneks">Aneks ugovora</SelectItem>
                  <SelectItem value="sanitarna">Sanitarna knjižica</SelectItem>
                  <SelectItem value="certifikat">Certifikat</SelectItem>
                  <SelectItem value="licenca">Licenca</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="osobna">Osobna iskaznica</SelectItem>
                  <SelectItem value="ostalo">Ostalo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Naziv dokumenta *</Label>
              <Input
                value={form.document_name}
                onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                placeholder="npr. Ugovor o radu 2024"
              />
            </div>
            <div>
              <Label>Datum isteka</Label>
              <Input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
            <div>
              <Label>URL dokumenta</Label>
              <Input
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                placeholder="https://..."
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
