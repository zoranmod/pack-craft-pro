import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { usePublicHolidays, useCreatePublicHoliday, useUpdatePublicHoliday, useDeletePublicHoliday } from '@/hooks/usePublicHolidays';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const AdminHolidays = () => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: '',
    date: '',
    is_non_working: true,
  });

  const { data: holidays, isLoading, refetch } = usePublicHolidays(parseInt(selectedYear));
  const createHoliday = useCreatePublicHoliday();
  const updateHoliday = useUpdatePublicHoliday();
  const deleteHoliday = useDeletePublicHoliday();

  const handleOpenDialog = (holiday?: any) => {
    if (holiday) {
      setEditingHoliday(holiday);
      setForm({
        name: holiday.name,
        date: holiday.date,
        is_non_working: holiday.is_non_working,
      });
    } else {
      setEditingHoliday(null);
      setForm({
        name: '',
        date: '',
        is_non_working: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.date) {
      toast.error('Popunite sva polja');
      return;
    }

    try {
      if (editingHoliday) {
        await updateHoliday.mutateAsync({
          id: editingHoliday.id,
          name: form.name,
          date: form.date,
          is_non_working: form.is_non_working,
        });
        toast.success('Blagdan ažuriran');
      } else {
        await createHoliday.mutateAsync({
          name: form.name,
          date: form.date,
          is_non_working: form.is_non_working,
          source: 'manual',
          country_code: 'HR',
        });
        toast.success('Blagdan dodan');
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error('Greška pri spremanju blagdana');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj blagdan?')) return;
    try {
      await deleteHoliday.mutateAsync(id);
      toast.success('Blagdan obrisan');
    } catch (error) {
      toast.error('Greška pri brisanju blagdana');
    }
  };

  const automaticHolidays = holidays?.filter(h => h.source === 'automatic') || [];
  const manualHolidays = holidays?.filter(h => h.source === 'manual') || [];

  return (
    <MainLayout title="Blagdani" subtitle="Upravljanje neradnim danima i praznicima">
      <div className="space-y-6">
        {/* Year selector and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Label>Godina:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Osvježi
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj blagdan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingHoliday ? 'Uredi blagdan' : 'Novi blagdan'}
                  </DialogTitle>
                  <DialogDescription>
                    Ručno dodani blagdani koriste se u izračunu godišnjih odmora
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Naziv</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="npr. Božić"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Datum</Label>
                    <Input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="is_non_working"
                      checked={form.is_non_working}
                      onCheckedChange={(checked) => setForm({ ...form, is_non_working: checked })}
                    />
                    <Label htmlFor="is_non_working">Neradni dan</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Odustani
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={createHoliday.isPending || updateHoliday.isPending}
                  >
                    {(createHoliday.isPending || updateHoliday.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Spremi
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{holidays?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Ukupno blagdana u {selectedYear}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Calendar className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{automaticHolidays.length}</p>
                  <p className="text-xs text-muted-foreground">Automatski (HR)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{manualHolidays.length}</p>
                  <p className="text-xs text-muted-foreground">Ručno dodani</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holidays table */}
        <Card>
          <CardHeader>
            <CardTitle>Blagdani {selectedYear}</CardTitle>
            <CardDescription>
              Svi blagdani koji se koriste u izračunu godišnjih odmora
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : holidays?.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nema blagdana za {selectedYear}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Naziv</TableHead>
                    <TableHead>Izvor</TableHead>
                    <TableHead>Neradni</TableHead>
                    <TableHead className="w-[100px]">Akcije</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays?.sort((a, b) => a.date.localeCompare(b.date)).map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(holiday.date), 'dd.MM.yyyy (EEEE)', { locale: hr })}
                      </TableCell>
                      <TableCell>{holiday.name}</TableCell>
                      <TableCell>
                        <Badge variant={holiday.source === 'automatic' ? 'secondary' : 'outline'}>
                          {holiday.source === 'automatic' ? 'Automatski' : 'Ručni'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={holiday.is_non_working ? 'default' : 'outline'}>
                          {holiday.is_non_working ? 'Da' : 'Ne'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {holiday.source === 'manual' && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(holiday)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(holiday.id)}
                              disabled={deleteHoliday.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminHolidays;
