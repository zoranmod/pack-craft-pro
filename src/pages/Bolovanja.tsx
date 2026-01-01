import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, parseISO, getDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Calendar, List, Plus, Search, X, Edit, Trash2, Users, CalendarDays, ChevronLeft, ChevronRight, Stethoscope } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { useEmployees } from '@/hooks/useEmployees';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import {
  useAllLeaveRequests,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useDeleteLeaveRequest,
  LeaveRequestWithEmployee,
} from '@/hooks/useLeaveOverview';
import { calculateWorkingDays } from '@/lib/workingDays';
import type { Employee } from '@/types/employee';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Na čekanju' },
  { value: 'approved', label: 'Odobreno' },
  { value: 'rejected', label: 'Odbijeno' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">Odobreno</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Odbijeno</Badge>;
    case 'pending':
    default:
      return <Badge variant="secondary">Na čekanju</Badge>;
  }
};

const Bolovanja = () => {
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [yearFilter, setYearFilter] = useState<string>(currentYear.toString());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveRequestWithEmployee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Form state
  const [form, setForm] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    reason: '',
    status: 'pending',
  });

  // Data hooks
  const { employees } = useEmployees();
  const { hasFullAccess } = useCurrentEmployee();
  const { data: leaveRequests = [], isLoading } = useAllLeaveRequests({
    year: yearFilter !== 'all' ? parseInt(yearFilter) : undefined,
    status: statusFilter,
    leaveType: 'bolovanje', // Filter only sick leave
    search: debouncedSearch,
  });
  const createLeave = useCreateLeaveRequest();
  const updateLeave = useUpdateLeaveRequest();
  const deleteLeave = useDeleteLeaveRequest();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Create employee map for quick lookup
  const employeeMap = useMemo(() => {
    const map = new Map<string, Employee>();
    employees.forEach(emp => map.set(emp.id, emp));
    return map;
  }, [employees]);

  // Get selected employee's works_saturday setting
  const selectedEmployee = form.employee_id ? employeeMap.get(form.employee_id) : null;
  const worksSaturday = selectedEmployee?.works_saturday ?? false;

  // Calculate working days based on selected employee
  const calculatedDays = useMemo(() => {
    if (!form.start_date || !form.end_date) return 0;
    return calculateWorkingDays(form.start_date, form.end_date, worksSaturday);
  }, [form.start_date, form.end_date, worksSaturday]);

  // Stats
  const todaySickCount = useMemo(() => {
    const today = new Date();
    return leaveRequests.filter(lr => {
      const start = parseISO(lr.start_date);
      const end = parseISO(lr.end_date);
      return isWithinInterval(today, { start, end }) && lr.status === 'approved';
    }).length;
  }, [leaveRequests]);

  const thisMonthSickCount = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return leaveRequests.filter(lr => {
      const start = parseISO(lr.start_date);
      return start >= monthStart && start <= monthEnd;
    }).length;
  }, [leaveRequests]);

  const resetForm = () => {
    setForm({
      employee_id: '',
      start_date: '',
      end_date: '',
      reason: '',
      status: 'pending',
    });
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditingItem(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: LeaveRequestWithEmployee) => {
    setForm({
      employee_id: item.employee_id,
      start_date: item.start_date,
      end_date: item.end_date,
      reason: item.reason || '',
      status: item.status,
    });
    setEditingItem(item);
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.start_date || !form.end_date) return;

    // Get works_saturday for the employee being edited
    const emp = employeeMap.get(form.employee_id);
    const empWorksSaturday = emp?.works_saturday ?? false;
    const days = calculateWorkingDays(form.start_date, form.end_date, empWorksSaturday);

    if (editingItem) {
      await updateLeave.mutateAsync({
        id: editingItem.id,
        start_date: form.start_date,
        end_date: form.end_date,
        days_requested: days,
        leave_type: 'bolovanje',
        reason: form.reason || undefined,
        status: form.status,
      });
    } else {
      await createLeave.mutateAsync({
        employee_id: form.employee_id,
        start_date: form.start_date,
        end_date: form.end_date,
        days_requested: days,
        leave_type: 'bolovanje',
        reason: form.reason || undefined,
      });
    }
    setIsAddOpen(false);
    resetForm();
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteLeave.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  // Calendar helpers
  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getLeaveForDay = (day: Date) => {
    return leaveRequests.filter(leave => {
      const start = parseISO(leave.start_date);
      const end = parseISO(leave.end_date);
      return isWithinInterval(day, { start, end });
    });
  };

  return (
    <MainLayout
      title="Bolovanja"
      subtitle="Pregled svih bolovanja zaposlenika"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trenutno na bolovanju</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{todaySickCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Bolovanja ovaj mjesec</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{thisMonthSickCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ukupno u {yearFilter}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{leaveRequests.length}</span>
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
              placeholder="Pretraži po imenu..."
              className="w-64"
            />
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Godina" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj bolovanje
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'calendar')}>
          <TabsList>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Kalendar
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
            ) : leaveRequests.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nema zapisa</h3>
                <p className="text-muted-foreground">Nema bolovanja za odabrane filtere</p>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zaposlenik</TableHead>
                        <TableHead>Od – Do</TableHead>
                        <TableHead>Radnih dana</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Napomena</TableHead>
                        <TableHead>Datum unosa</TableHead>
                        <TableHead className="text-right">Akcije</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.employee_name}</TableCell>
                          <TableCell>
                            {format(parseISO(item.start_date), 'dd.MM.yyyy', { locale: hr })} – {format(parseISO(item.end_date), 'dd.MM.yyyy', { locale: hr })}
                          </TableCell>
                          <TableCell>{item.days_requested}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {item.reason || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(parseISO(item.created_at), 'dd.MM.yyyy', { locale: hr })}
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
                              {hasFullAccess && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteId(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Calendar View */}
          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-lg">
                  {format(calendarMonth, 'LLLL yyyy', { locale: hr })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20 bg-muted/20 rounded" />
                  ))}
                  {daysInMonth.map((day) => {
                    const leaves = getLeaveForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const dayOfWeek = getDay(day);
                    const isSunday = dayOfWeek === 0;
                    const isSaturday = dayOfWeek === 6;
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`h-20 p-1 rounded border transition-colors ${
                          isToday 
                            ? 'border-primary bg-primary/5' 
                            : isSunday 
                              ? 'border-border/50 bg-muted/30'
                              : isSaturday
                                ? 'border-border/50 bg-muted/20'
                                : 'border-border/50 hover:border-border'
                        }`}
                      >
                        <div className={`text-xs font-medium ${isToday ? 'text-primary' : isSunday || isSaturday ? 'text-muted-foreground' : ''}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="mt-1 space-y-0.5 overflow-hidden">
                          {leaves.slice(0, 2).map((leave) => (
                            <div
                              key={leave.id}
                              className="text-[10px] px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 truncate"
                              title={leave.employee_name}
                            >
                              {leave.employee_name.split(' ')[0]}
                            </div>
                          ))}
                          {leaves.length > 2 && (
                            <div className="text-[10px] text-muted-foreground px-1">
                              +{leaves.length - 2} više
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Uredi bolovanje' : 'Dodaj bolovanje'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Zaposlenik</Label>
                <Select 
                  value={form.employee_id} 
                  onValueChange={(v) => setForm({ ...form, employee_id: v })}
                  disabled={!!editingItem}
                >
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Od</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Do</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              {form.start_date && form.end_date && (
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <span className="text-sm text-muted-foreground">Radnih dana: </span>
                  <span className="text-lg font-semibold text-primary">{calculatedDays}</span>
                </div>
              )}
              {editingItem && hasFullAccess && (
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Napomena</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Dijagnoza, broj doznake..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Odustani</Button>
              <Button 
                onClick={handleSubmit}
                disabled={!form.employee_id || !form.start_date || !form.end_date || createLeave.isPending || updateLeave.isPending}
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
              <AlertDialogTitle>Obriši bolovanje?</AlertDialogTitle>
              <AlertDialogDescription>
                Bolovanje će biti premješteno u kantu za smeće. Možete ga vratiti kasnije.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Odustani</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Obriši
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Bolovanja;
