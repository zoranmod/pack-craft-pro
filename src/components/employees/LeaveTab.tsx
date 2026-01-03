import { useState } from 'react';
import { Plus, Check, X, Clock, CalendarIcon, ArrowRight, Edit2, Shield, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { generateAndDownloadLeaveRequestPdf, ExcludedDateInfo } from '@/lib/leaveRequestPdfGenerator';
import { supabase } from '@/integrations/supabase/client';
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
  DialogFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useLeaveEntitlements, useLeaveRequests, useEmployee } from '@/hooks/useEmployees';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { formatDateHR, cn } from '@/lib/utils';
import { calculateWorkingDays, calculateLeaveBalance } from '@/lib/workingDays';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

interface LeaveTabProps {
  employeeId: string;
}

export function LeaveTab({ employeeId }: LeaveTabProps) {
  const { entitlements, create: createEntitlement, update: updateEntitlement } = useLeaveEntitlements(employeeId);
  const { requests, create: createRequest, update: updateRequest, remove: removeRequest } = useLeaveRequests(employeeId);
  const { data: employee } = useEmployee(employeeId);
  const { isAdmin, hasFullAccess } = useCurrentEmployee();
  
  const [isEntitlementOpen, setIsEntitlementOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false);
  const [entitlementForm, setEntitlementForm] = useState({ 
    year: new Date().getFullYear(), 
    total_days: 20,
    carried_over_days: 0,
    manual_adjustment_days: 0,
  });
  const [balanceForm, setBalanceForm] = useState({
    carried_over_days: 0,
    manual_adjustment_days: 0,
  });
  const [editingEntitlementId, setEditingEntitlementId] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({
    start_date: '',
    end_date: '',
    days_requested: 0,
    leave_type: 'godišnji',
    reason: '',
  });

  const currentYear = new Date().getFullYear();
  const currentEntitlement = entitlements.find((e) => e.year === currentYear);
  
  const balance = currentEntitlement 
    ? calculateLeaveBalance(
        currentEntitlement.total_days,
        currentEntitlement.carried_over_days || 0,
        currentEntitlement.manual_adjustment_days || 0,
        currentEntitlement.used_days
      )
    : { fund: 0, carriedOver: 0, adjustment: 0, used: 0, remaining: 0 };

  const worksSaturday = employee?.works_saturday ?? false;

  // Auto-calculate days when dates change
  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    const newForm = { ...requestForm, [field]: value };
    if (newForm.start_date && newForm.end_date) {
      newForm.days_requested = calculateWorkingDays(newForm.start_date, newForm.end_date, worksSaturday);
    }
    setRequestForm(newForm);
  };

  const handleCreateEntitlement = async () => {
    await createEntitlement.mutateAsync({
      employee_id: employeeId,
      year: entitlementForm.year,
      total_days: entitlementForm.total_days,
      used_days: 0,
      carried_over_days: entitlementForm.carried_over_days,
      manual_adjustment_days: entitlementForm.manual_adjustment_days,
    });
    setIsEntitlementOpen(false);
    setEntitlementForm({ year: currentYear, total_days: 20, carried_over_days: 0, manual_adjustment_days: 0 });
  };

  const handleOpenEditBalance = (entitlement: typeof entitlements[0]) => {
    if (!hasFullAccess) {
      toast.error('Samo administratori mogu uređivati prenesene dane i korekcije.');
      return;
    }
    setEditingEntitlementId(entitlement.id);
    setBalanceForm({
      carried_over_days: entitlement.carried_over_days || 0,
      manual_adjustment_days: entitlement.manual_adjustment_days || 0,
    });
    setIsEditBalanceOpen(true);
  };

  const handleSaveBalance = async () => {
    if (!editingEntitlementId) return;
    await updateEntitlement.mutateAsync({
      id: editingEntitlementId,
      carried_over_days: balanceForm.carried_over_days,
      manual_adjustment_days: balanceForm.manual_adjustment_days,
    });
    setIsEditBalanceOpen(false);
    setEditingEntitlementId(null);
  };

  const handleCarryOver = async () => {
    if (!hasFullAccess) {
      toast.error('Samo administratori mogu prenositi dane.');
      return;
    }
    const previousYear = currentYear - 1;
    const previousEntitlement = entitlements.find((e) => e.year === previousYear);
    
    if (!previousEntitlement) {
      toast.error(`Nema prava za godinu ${previousYear}`);
      return;
    }

    const remainingFromPrevious = previousEntitlement.total_days + 
      (previousEntitlement.carried_over_days || 0) + 
      (previousEntitlement.manual_adjustment_days || 0) - 
      previousEntitlement.used_days;
    
    if (remainingFromPrevious <= 0) {
      toast.error('Nema preostalih dana za prijenos');
      return;
    }

    if (currentEntitlement) {
      await updateEntitlement.mutateAsync({
        id: currentEntitlement.id,
        carried_over_days: (currentEntitlement.carried_over_days || 0) + remainingFromPrevious,
      });
    } else {
      await createEntitlement.mutateAsync({
        employee_id: employeeId,
        year: currentYear,
        total_days: 20,
        used_days: 0,
        carried_over_days: remainingFromPrevious,
        manual_adjustment_days: 0,
      });
    }
    
    toast.success(`Preneseno ${remainingFromPrevious} dana iz ${previousYear}`);
  };

  const handleCreateRequest = async () => {
    const days = calculateWorkingDays(requestForm.start_date, requestForm.end_date, worksSaturday);
    await createRequest.mutateAsync({
      employee_id: employeeId,
      ...requestForm,
      days_requested: days,
      status: 'pending',
    });
    setIsRequestOpen(false);
    setRequestForm({ start_date: '', end_date: '', days_requested: 0, leave_type: 'godišnji', reason: '' });
  };

  const handleApprove = async (id: string, daysRequested: number) => {
    await updateRequest.mutateAsync({ id, status: 'approved', approved_at: new Date().toISOString() });
    if (currentEntitlement) {
      await updateEntitlement.mutateAsync({
        id: currentEntitlement.id,
        used_days: currentEntitlement.used_days + daysRequested,
      });
    }
  };

  const handleReject = async (id: string) => {
    await updateRequest.mutateAsync({ id, status: 'rejected' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" />Odobreno</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Odbijeno</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Na čekanju</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Fond ({currentYear})</p>
              <p className="text-3xl font-bold">{balance.fund}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Preneseni</p>
              <p className="text-3xl font-bold text-orange-500">+{balance.carriedOver}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Korekcija</p>
              <p className={cn("text-3xl font-bold", balance.adjustment >= 0 ? "text-blue-500" : "text-red-500")}>
                {balance.adjustment >= 0 ? '+' : ''}{balance.adjustment}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Iskorišteno</p>
              <p className="text-3xl font-bold">-{balance.used}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Preostalo</p>
              <p className="text-3xl font-bold text-primary">{balance.remaining}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Controls */}
      {hasFullAccess && entitlements.some(e => e.year === currentYear - 1) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Prijenos dana iz prošle godine</p>
                <p className="text-sm text-muted-foreground">
                  Prenesite neiskorištene dane iz {currentYear - 1} u {currentYear}
                </p>
              </div>
              <Button variant="outline" onClick={handleCarryOver}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Prenesi dane
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entitlements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Prava na godišnji odmor</CardTitle>
          <Button size="sm" onClick={() => setIsEntitlementOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj godinu
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Godina</TableHead>
                <TableHead>Fond</TableHead>
                <TableHead>Preneseni</TableHead>
                <TableHead>Korekcija</TableHead>
                <TableHead>Iskorišteno</TableHead>
                <TableHead>Preostalo</TableHead>
                {hasFullAccess && <TableHead>Akcije</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entitlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={hasFullAccess ? 7 : 6} className="text-center text-muted-foreground">
                    Nema unesenih prava na godišnji
                  </TableCell>
                </TableRow>
              ) : (
                entitlements.map((ent) => {
                  const entBalance = calculateLeaveBalance(
                    ent.total_days,
                    ent.carried_over_days || 0,
                    ent.manual_adjustment_days || 0,
                    ent.used_days
                  );
                  return (
                    <TableRow key={ent.id}>
                      <TableCell className="font-medium">{ent.year}</TableCell>
                      <TableCell>{ent.total_days}</TableCell>
                      <TableCell className="text-orange-500">+{ent.carried_over_days || 0}</TableCell>
                      <TableCell className={cn(entBalance.adjustment >= 0 ? "text-blue-500" : "text-red-500")}>
                        {entBalance.adjustment >= 0 ? '+' : ''}{entBalance.adjustment}
                      </TableCell>
                      <TableCell>{ent.used_days}</TableCell>
                      <TableCell className="font-medium text-primary">{entBalance.remaining}</TableCell>
                      {hasFullAccess && (
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleOpenEditBalance(ent)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Zahtjevi za godišnji odmor</CardTitle>
            {worksSaturday && (
              <Badge variant="outline" className="text-xs">
                Radna subota
              </Badge>
            )}
          </div>
          <Button size="sm" onClick={() => setIsRequestOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novi zahtjev
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Radnih dana</TableHead>
                <TableHead>Vrsta</TableHead>
                <TableHead>Razlog</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nema zahtjeva za godišnji
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      {formatDateHR(req.start_date)} - {formatDateHR(req.end_date)}
                    </TableCell>
                    <TableCell>{req.days_requested}</TableCell>
                    <TableCell className="capitalize">{req.leave_type}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{req.reason || '-'}</TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          title="Preuzmi PDF"
                          onClick={async () => {
                            if (employee) {
                              try {
                                // Fetch excluded dates for this leave request
                                const { data: excludedDates } = await supabase
                                  .from('leave_request_excluded_dates')
                                  .select('date, reason')
                                  .eq('leave_request_id', req.id)
                                  .is('deleted_at', null);
                                
                                const reqWithExcluded = {
                                  ...req,
                                  excluded_dates: (excludedDates || []) as ExcludedDateInfo[],
                                };
                                await generateAndDownloadLeaveRequestPdf(reqWithExcluded, employee);
                                toast.success('PDF zahtjeva je uspješno generiran');
                              } catch (error) {
                                toast.error('Greška pri generiranju PDF-a');
                              }
                            }
                          }}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        {req.status === 'pending' && hasFullAccess && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-500 hover:text-green-600"
                              onClick={() => handleApprove(req.id, req.days_requested)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleReject(req.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Entitlement Dialog */}
      <Dialog open={isEntitlementOpen} onOpenChange={setIsEntitlementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj pravo na godišnji</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Godina</Label>
                <Input
                  type="number"
                  value={entitlementForm.year}
                  onChange={(e) => setEntitlementForm({ ...entitlementForm, year: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Fond dana</Label>
                <Input
                  type="number"
                  value={entitlementForm.total_days}
                  onChange={(e) => setEntitlementForm({ ...entitlementForm, total_days: parseInt(e.target.value) })}
                />
              </div>
            </div>
            {hasFullAccess && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preneseni dani</Label>
                  <Input
                    type="number"
                    value={entitlementForm.carried_over_days}
                    onChange={(e) => setEntitlementForm({ ...entitlementForm, carried_over_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Korekcija +/-</Label>
                  <Input
                    type="number"
                    value={entitlementForm.manual_adjustment_days}
                    onChange={(e) => setEntitlementForm({ ...entitlementForm, manual_adjustment_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEntitlementOpen(false)}>Odustani</Button>
            <Button onClick={handleCreateEntitlement}>Dodaj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Balance Dialog (Admin Only) */}
      <Dialog open={isEditBalanceOpen} onOpenChange={setIsEditBalanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Uredi saldo (Admin)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Preneseni dani</Label>
              <Input
                type="number"
                value={balanceForm.carried_over_days}
                onChange={(e) => setBalanceForm({ ...balanceForm, carried_over_days: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">Dani preneseni iz prethodne godine</p>
            </div>
            <div>
              <Label>Korekcija +/-</Label>
              <Input
                type="number"
                value={balanceForm.manual_adjustment_days}
                onChange={(e) => setBalanceForm({ ...balanceForm, manual_adjustment_days: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">Ručna prilagodba (npr. raniji povratak +2, ili odbitak -1)</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBalanceOpen(false)}>Odustani</Button>
            <Button onClick={handleSaveBalance}>Spremi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Request Dialog */}
      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novi zahtjev za godišnji</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Od datuma</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !requestForm.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {requestForm.start_date ? formatDateHR(requestForm.start_date) : 'Odaberi datum'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={requestForm.start_date ? new Date(requestForm.start_date) : undefined}
                      onSelect={(date) => handleDateChange('start_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      locale={hr}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Do datuma</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !requestForm.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {requestForm.end_date ? formatDateHR(requestForm.end_date) : 'Odaberi datum'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={requestForm.end_date ? new Date(requestForm.end_date) : undefined}
                      onSelect={(date) => handleDateChange('end_date', date ? format(date, 'yyyy-MM-dd') : '')}
                      locale={hr}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {requestForm.start_date && requestForm.end_date && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">
                  Radnih dana: <strong className="text-primary">{requestForm.days_requested}</strong>
                  {worksSaturday && <span className="text-muted-foreground ml-2">(uključuje subote)</span>}
                </p>
              </div>
            )}
            <div>
              <Label>Vrsta</Label>
              <Select
                value={requestForm.leave_type}
                onValueChange={(v) => setRequestForm({ ...requestForm, leave_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="godišnji">Godišnji odmor</SelectItem>
                  <SelectItem value="slobodan_dan">Slobodan dan</SelectItem>
                  <SelectItem value="plaćeni_dopust">Plaćeni dopust</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Razlog</Label>
              <Textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestOpen(false)}>Odustani</Button>
            <Button onClick={handleCreateRequest} disabled={!requestForm.start_date || !requestForm.end_date}>
              Kreiraj zahtjev
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
