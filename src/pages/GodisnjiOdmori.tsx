import { useState, useMemo, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameDay, isWithinInterval, parseISO, getDay, isSaturday } from 'date-fns';
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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, List, Plus, Search, X, Edit, Trash2, Users, CalendarDays, ChevronLeft, ChevronRight, AlertCircle, CalendarIcon } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useEmployees } from '@/hooks/useEmployees';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import {
  useAllLeaveRequests,
  useCreateLeaveRequest,
  useUpdateLeaveRequest,
  useDeleteLeaveRequest,
  useTodayAbsences,
  useWeekAbsences,
  useMonthPlanned,
  LeaveRequestWithEmployee,
  useExcludedDates,
  useSaveExcludedDates,
} from '@/hooks/useLeaveOverview';
import { calculateWorkingDays, getSaturdaysInRange, getWeekdaysInRange, ExcludedDate } from '@/lib/workingDays';
import type { Employee } from '@/types/employee';

const LEAVE_TYPES = [
  { value: 'godišnji', label: 'Godišnji odmor' },
  { value: 'bolovanje', label: 'Bolovanje' },
  { value: 'neplaćeno', label: 'Neplaćeni dopust' },
  { value: 'ostalo', label: 'Ostalo' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Na čekanju' },
  { value: 'approved', label: 'Odobren' },
  { value: 'rejected', label: 'Odbijen' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'approved':
      return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Odobren</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Odbijen</Badge>;
    case 'pending':
    default:
      return <Badge variant="secondary">Na čekanju</Badge>;
  }
};

const getLeaveTypeLabel = (type: string) => {
  return LEAVE_TYPES.find(t => t.value === type)?.label || type;
};

const GodisnjiOdmori = () => {
  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [yearFilter, setYearFilter] = useState<string>(currentYear.toString());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveRequestWithEmployee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<{ date: Date; leaves: LeaveRequestWithEmployee[] } | null>(null);

  // Form state
  const [form, setForm] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    leave_type: 'godišnji',
    reason: '',
    status: 'pending',
  });

  // Excluded dates state: Map<dateString, { excluded: boolean, reason: 'neradna_subota' | 'neradni_dan' }>
  const [saturdayExclusions, setSaturdayExclusions] = useState<Map<string, boolean>>(new Map());
  const [weekdayExclusions, setWeekdayExclusions] = useState<Set<string>>(new Set());
  
  // Ref to track if user has manually modified Saturday exclusions
  const userModifiedSaturdays = useRef(false);

  // Data hooks
  const { employees } = useEmployees();
  const { hasFullAccess } = useCurrentEmployee();
  const { data: leaveRequests = [], isLoading } = useAllLeaveRequests({
    year: yearFilter !== 'all' ? parseInt(yearFilter) : undefined,
    status: statusFilter,
    leaveType: typeFilter,
    search: debouncedSearch,
  });
  const createLeave = useCreateLeaveRequest();
  const updateLeave = useUpdateLeaveRequest();
  const deleteLeave = useDeleteLeaveRequest();
  const saveExcludedDates = useSaveExcludedDates();
  const { data: existingExcludedDates = [] } = useExcludedDates(editingItem?.id);
  const { data: todayAbsent = 0 } = useTodayAbsences();
  const { data: weekAbsent = 0 } = useWeekAbsences();
  const { data: monthPlanned = 0 } = useMonthPlanned();

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

  // Get Saturdays and weekdays in the selected date range
  const saturdaysInRange = useMemo(() => {
    if (!form.start_date || !form.end_date) return [];
    return getSaturdaysInRange(form.start_date, form.end_date);
  }, [form.start_date, form.end_date]);

  const weekdaysInRange = useMemo(() => {
    if (!form.start_date || !form.end_date) return [];
    return getWeekdaysInRange(form.start_date, form.end_date);
  }, [form.start_date, form.end_date]);

  // Build excluded dates array from current selections
  const currentExcludedDates = useMemo((): ExcludedDate[] => {
    const excluded: ExcludedDate[] = [];
    
    // Handle Saturday exclusions based on employee's works_saturday setting
    saturdayExclusions.forEach((isNonWorking, dateStr) => {
      if (worksSaturday) {
        // Employee normally works Saturdays
        // If marked as non-working, add neradna_subota exclusion
        if (isNonWorking) {
          excluded.push({ date: dateStr, reason: 'neradna_subota' });
        }
        // If working (isNonWorking = false), no exclusion needed (default behavior)
      } else {
        // Employee normally does NOT work Saturdays
        // If marked as working (isNonWorking = false), add radna_subota exclusion to override
        if (!isNonWorking) {
          excluded.push({ date: dateStr, reason: 'radna_subota' });
        }
        // If non-working (isNonWorking = true), no exclusion needed (default behavior)
      }
    });
    
    // Add excluded weekdays (neradni dan)
    weekdayExclusions.forEach(dateStr => {
      excluded.push({ date: dateStr, reason: 'neradni_dan' });
    });
    
    return excluded;
  }, [saturdayExclusions, weekdayExclusions, worksSaturday]);

  // Check if any neradni_dan is selected
  const hasNeradniDan = weekdayExclusions.size > 0;

  // Validation: napomena required if neradni_dan selected
  const napomenaError = hasNeradniDan && form.reason.trim().length < 10
    ? 'Molimo unesite razlog za označene neradne dane (min. 10 znakova).'
    : '';

  // Calculate working days based on selected employee and excluded dates
  const calculatedDays = useMemo(() => {
    if (!form.start_date || !form.end_date) return 0;
    return calculateWorkingDays(form.start_date, form.end_date, worksSaturday, currentExcludedDates);
  }, [form.start_date, form.end_date, worksSaturday, currentExcludedDates]);

  // Initialize Saturday exclusions when dates change or employee changes
  useEffect(() => {
    // Skip re-initialization if user has manually modified Saturday exclusions
    if (userModifiedSaturdays.current) return;
    
    if (!form.start_date || !form.end_date) {
      setSaturdayExclusions(new Map());
      return;
    }
    
    const saturdays = getSaturdaysInRange(form.start_date, form.end_date);
    const newExclusions = new Map<string, boolean>();
    
    // Default based on employee's works_saturday setting
    saturdays.forEach(dateStr => {
      // Check if there's an existing exclusion for this Saturday (only in edit mode)
      const existingNeradna = editingItem ? existingExcludedDates.find(ed => ed.date === dateStr && ed.reason === 'neradna_subota') : null;
      const existingRadna = editingItem ? existingExcludedDates.find(ed => ed.date === dateStr && ed.reason === 'radna_subota') : null;
      
      if (existingNeradna) {
        // Explicitly marked as non-working
        newExclusions.set(dateStr, true);
      } else if (existingRadna) {
        // Explicitly marked as working (for employee who doesn't normally work Saturdays)
        newExclusions.set(dateStr, false);
      } else {
        // Default based on employee's works_saturday setting
        // If employee works Saturdays, default to working (false = not excluded)
        // If employee doesn't work Saturdays, default to non-working (true = excluded)
        newExclusions.set(dateStr, !worksSaturday);
      }
    });
    
    setSaturdayExclusions(newExclusions);
  }, [form.start_date, form.end_date, worksSaturday, existingExcludedDates, editingItem]);

  // Initialize weekday exclusions when editing
  useEffect(() => {
    if (editingItem && existingExcludedDates.length > 0) {
      const weekdayExcl = new Set<string>();
      existingExcludedDates.forEach(ed => {
        if (ed.reason === 'neradni_dan') {
          weekdayExcl.add(ed.date);
        }
      });
      setWeekdayExclusions(weekdayExcl);
    }
  }, [editingItem, existingExcludedDates]);

  const resetForm = () => {
    userModifiedSaturdays.current = false;
    setForm({
      employee_id: '',
      start_date: '',
      end_date: '',
      leave_type: 'godišnji',
      reason: '',
      status: 'pending',
    });
    setSaturdayExclusions(new Map());
    setWeekdayExclusions(new Set());
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
      leave_type: item.leave_type,
      reason: item.reason || '',
      status: item.status,
    });
    // Reset exclusions - they will be populated by useEffect when existingExcludedDates loads
    setSaturdayExclusions(new Map());
    setWeekdayExclusions(new Set());
    setEditingItem(item);
    setIsAddOpen(true);
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    await updateLeave.mutateAsync({
      id,
      status: newStatus,
    });
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.start_date || !form.end_date) return;
    
    // Validate napomena if neradni_dan is selected
    if (hasNeradniDan && form.reason.trim().length < 10) {
      return; // Don't submit - validation error shown in UI
    }

    // Get works_saturday for the employee being edited
    const emp = employeeMap.get(form.employee_id);
    const empWorksSaturday = emp?.works_saturday ?? false;
    const days = calculateWorkingDays(form.start_date, form.end_date, empWorksSaturday, currentExcludedDates);

    let leaveRequestId: string;

    if (editingItem) {
      await updateLeave.mutateAsync({
        id: editingItem.id,
        start_date: form.start_date,
        end_date: form.end_date,
        days_requested: days,
        leave_type: form.leave_type,
        reason: form.reason || undefined,
        status: form.status,
      });
      leaveRequestId = editingItem.id;
    } else {
      const result = await createLeave.mutateAsync({
        employee_id: form.employee_id,
        start_date: form.start_date,
        end_date: form.end_date,
        days_requested: days,
        leave_type: form.leave_type,
        reason: form.reason || undefined,
      });
      leaveRequestId = result.id;
    }

    // Save excluded dates
    if (currentExcludedDates.length > 0 || editingItem) {
      await saveExcludedDates.mutateAsync({
        leaveRequestId,
        excludedDates: currentExcludedDates,
      });
    }

    setIsAddOpen(false);
    resetForm();
    setEditingItem(null);
  };

  const toggleSaturdayExclusion = (dateStr: string) => {
    userModifiedSaturdays.current = true;
    setSaturdayExclusions(prev => {
      const next = new Map(prev);
      next.set(dateStr, !prev.get(dateStr));
      return next;
    });
  };

  const toggleWeekdayExclusion = (dateStr: string) => {
    setWeekdayExclusions(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
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
      title="Godišnji odmori"
      subtitle="Pregled svih godišnjih odmora i odsustava"
    >
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Danas odsutni</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{todayAbsent}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Odsutni ovaj tjedan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{weekAbsent}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Planirano ovaj mjesec</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{monthPlanned}</span>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj godišnji
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
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nema zapisa</h3>
                <p className="text-muted-foreground">Nema godišnjih odmora za odabrane filtere</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Zaposlenik</TableHead>
                        <TableHead>Od – Do</TableHead>
                        <TableHead>Radnih dana</TableHead>
                        <TableHead>Tip</TableHead>
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
                          <TableCell>{getLeaveTypeLabel(item.leave_type)}</TableCell>
                          <TableCell>
                            {hasFullAccess ? (
                              <Select
                                value={item.status}
                                onValueChange={(newStatus) => handleQuickStatusChange(item.id, newStatus)}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue>
                                    {getStatusBadge(item.status)}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    <Badge variant="secondary">Na čekanju</Badge>
                                  </SelectItem>
                                  <SelectItem value="approved">
                                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Odobren</Badge>
                                  </SelectItem>
                                  <SelectItem value="rejected">
                                    <Badge variant="destructive">Odbijen</Badge>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              getStatusBadge(item.status)
                            )}
                          </TableCell>
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
                        className={`h-20 p-1 rounded border cursor-pointer hover:border-primary/50 transition-colors ${
                          isSunday 
                            ? 'bg-muted/40' 
                            : isSaturday 
                              ? 'bg-muted/30' 
                              : 'bg-card'
                        } ${isToday ? 'border-primary' : 'border-border/50'}`}
                        onClick={() => leaves.length > 0 && setSelectedDayDetail({ date: day, leaves })}
                      >
                        <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary' : isSunday ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {leaves.slice(0, 2).map((leave) => (
                            <div
                              key={leave.id}
                              className={`text-[10px] px-1 py-0.5 rounded truncate ${
                                leave.status === 'approved'
                                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                  : leave.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-red-500/20 text-red-700 dark:text-red-400'
                              }`}
                              title={`${leave.employee_name} - ${getLeaveTypeLabel(leave.leave_type)}`}
                            >
                              {leave.employee_first_name} {leave.employee_last_name.charAt(0)}.
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
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Uredi godišnji' : 'Dodaj godišnji'}</DialogTitle>
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
                        {emp.works_saturday && <span className="text-muted-foreground ml-2">(radna sub.)</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Od *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.start_date 
                        ? format(parseISO(form.start_date), 'dd.MM.yyyy.', { locale: hr })
                        : 'Odaberi datum'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.start_date ? parseISO(form.start_date) : undefined}
                      onSelect={(date) => {
                        userModifiedSaturdays.current = false;
                        setForm(prev => ({ 
                          ...prev, 
                          start_date: date ? format(date, 'yyyy-MM-dd') : '' 
                        }));
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Do *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !form.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.end_date 
                        ? format(parseISO(form.end_date), 'dd.MM.yyyy.', { locale: hr })
                        : 'Odaberi datum'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={form.end_date ? parseISO(form.end_date) : undefined}
                      onSelect={(date) => {
                        userModifiedSaturdays.current = false;
                        setForm(prev => ({ 
                          ...prev, 
                          end_date: date ? format(date, 'yyyy-MM-dd') : '' 
                        }));
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Working days calculation */}
            {form.start_date && form.end_date && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">
                  Radnih dana: <strong className="text-primary">{calculatedDays}</strong>
                  {saturdayExclusions.size > 0 && (
                    <span className="text-muted-foreground ml-2">
                      ({Array.from(saturdayExclusions.values()).filter(v => !v).length} radnih subota)
                    </span>
                  )}
                  {weekdayExclusions.size > 0 && (
                    <span className="text-muted-foreground ml-2">
                      (izuzeto {weekdayExclusions.size} neradnih dana)
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Saturday toggles - only for godišnji type */}
            {form.leave_type === 'godišnji' && saturdaysInRange.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Subote u periodu</Label>
                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                  {saturdaysInRange.map((dateStr) => {
                    const isNonWorking = saturdayExclusions.get(dateStr) ?? !worksSaturday;
                    return (
                      <div key={dateStr} className="flex items-center justify-between py-1">
                        <span className="text-sm">
                          {format(parseISO(dateStr), 'EEEE, dd.MM.yyyy', { locale: hr })}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${isNonWorking ? 'text-muted-foreground' : 'text-primary font-medium'}`}>
                            {isNonWorking ? 'Neradna' : 'Radna'}
                          </span>
                          <Switch
                            checked={!isNonWorking}
                            onCheckedChange={() => toggleSaturdayExclusion(dateStr)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weekday exclusions (neradni dan) - only for godišnji type */}
            {form.leave_type === 'godišnji' && weekdaysInRange.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Izuzmi datume (neradni dani)</Label>
                <p className="text-xs text-muted-foreground">Označite dane koji neće biti odbijeni od godišnjeg odmora</p>
                <div className="bg-muted/30 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
                  {weekdaysInRange.map((dateStr) => {
                    const isExcluded = weekdayExclusions.has(dateStr);
                    return (
                      <div key={dateStr} className="flex items-center gap-2 py-1">
                        <Checkbox
                          id={`weekday-${dateStr}`}
                          checked={isExcluded}
                          onCheckedChange={() => toggleWeekdayExclusion(dateStr)}
                        />
                        <label
                          htmlFor={`weekday-${dateStr}`}
                          className={`text-sm cursor-pointer ${isExcluded ? 'text-primary font-medium' : ''}`}
                        >
                          {format(parseISO(dateStr), 'EEEE, dd.MM.yyyy', { locale: hr })}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Tip</Label>
              <Select value={form.leave_type} onValueChange={(v) => setForm(prev => ({ ...prev, leave_type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editingItem && hasFullAccess && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm(prev => ({ ...prev, status: v }))}>
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
            <div className="space-y-2">
              <Label>
                Napomena
                {hasNeradniDan && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Textarea
                value={form.reason}
                onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={hasNeradniDan ? "Unesite razlog za označene neradne dane..." : "Opcijska napomena..."}
                className={napomenaError ? 'border-destructive' : ''}
              />
              {napomenaError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{napomenaError}</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Odustani</Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !form.start_date || 
                !form.end_date || 
                (!editingItem && !form.employee_id) || 
                !!napomenaError ||
                createLeave.isPending || 
                updateLeave.isPending ||
                saveExcludedDates.isPending
              }
            >
              {editingItem ? 'Spremi' : 'Dodaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Day Detail Modal */}
      <Dialog open={!!selectedDayDetail} onOpenChange={() => setSelectedDayDetail(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDayDetail && format(selectedDayDetail.date, 'EEEE, dd. MMMM yyyy.', { locale: hr })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {selectedDayDetail?.leaves.map((leave) => (
              <div
                key={leave.id}
                className={`p-3 rounded-lg border ${
                  leave.status === 'approved'
                    ? 'bg-green-500/10 border-green-500/30'
                    : leave.status === 'pending'
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{leave.employee_name}</span>
                  {getStatusBadge(leave.status)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {getLeaveTypeLabel(leave.leave_type)} • {format(parseISO(leave.start_date), 'dd.MM.', { locale: hr })} - {format(parseISO(leave.end_date), 'dd.MM.yyyy.', { locale: hr })}
                </div>
                {leave.reason && (
                  <div className="text-sm text-muted-foreground mt-1 italic">
                    {leave.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši godišnji odmor?</AlertDialogTitle>
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

export default GodisnjiOdmori;
