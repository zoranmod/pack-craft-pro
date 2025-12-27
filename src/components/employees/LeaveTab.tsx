import { useState } from 'react';
import { Plus, Check, X, Clock, CalendarIcon } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useLeaveEntitlements, useLeaveRequests } from '@/hooks/useEmployees';
import { formatDateHR, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

interface LeaveTabProps {
  employeeId: string;
}

export function LeaveTab({ employeeId }: LeaveTabProps) {
  const { entitlements, create: createEntitlement, update: updateEntitlement } = useLeaveEntitlements(employeeId);
  const { requests, create: createRequest, update: updateRequest, remove: removeRequest } = useLeaveRequests(employeeId);
  
  const [isEntitlementOpen, setIsEntitlementOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [entitlementForm, setEntitlementForm] = useState({ year: new Date().getFullYear(), total_days: 20 });
  const [requestForm, setRequestForm] = useState({
    start_date: '',
    end_date: '',
    days_requested: 1,
    leave_type: 'godišnji',
    reason: '',
  });

  const currentYear = new Date().getFullYear();
  const currentEntitlement = entitlements.find((e) => e.year === currentYear);
  const remainingDays = currentEntitlement 
    ? currentEntitlement.total_days - currentEntitlement.used_days 
    : 0;

  const handleCreateEntitlement = async () => {
    await createEntitlement.mutateAsync({
      employee_id: employeeId,
      year: entitlementForm.year,
      total_days: entitlementForm.total_days,
      used_days: 0,
    });
    setIsEntitlementOpen(false);
    setEntitlementForm({ year: currentYear, total_days: 20 });
  };

  const handleCreateRequest = async () => {
    await createRequest.mutateAsync({
      employee_id: employeeId,
      ...requestForm,
      status: 'pending',
    });
    setIsRequestOpen(false);
    setRequestForm({ start_date: '', end_date: '', days_requested: 1, leave_type: 'godišnji', reason: '' });
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Ukupno dana ({currentYear})</p>
              <p className="text-3xl font-bold">{currentEntitlement?.total_days ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Iskorišteno</p>
              <p className="text-3xl font-bold">{currentEntitlement?.used_days ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Preostalo</p>
              <p className="text-3xl font-bold text-primary">{remainingDays}</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Ukupno dana</TableHead>
                <TableHead>Iskorišteno</TableHead>
                <TableHead>Preostalo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entitlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nema unesenih prava na godišnji
                  </TableCell>
                </TableRow>
              ) : (
                entitlements.map((ent) => (
                  <TableRow key={ent.id}>
                    <TableCell className="font-medium">{ent.year}</TableCell>
                    <TableCell>{ent.total_days}</TableCell>
                    <TableCell>{ent.used_days}</TableCell>
                    <TableCell className="font-medium text-primary">
                      {ent.total_days - ent.used_days}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Zahtjevi za godišnji odmor</CardTitle>
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
                <TableHead>Dana</TableHead>
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
                      {req.status === 'pending' && (
                        <div className="flex gap-1">
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
                        </div>
                      )}
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
            <div>
              <Label>Godina</Label>
              <Input
                type="number"
                value={entitlementForm.year}
                onChange={(e) => setEntitlementForm({ ...entitlementForm, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>Ukupno dana</Label>
              <Input
                type="number"
                value={entitlementForm.total_days}
                onChange={(e) => setEntitlementForm({ ...entitlementForm, total_days: parseInt(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEntitlementOpen(false)}>Odustani</Button>
              <Button onClick={handleCreateEntitlement}>Dodaj</Button>
            </div>
          </div>
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
                      onSelect={(date) => setRequestForm({ 
                        ...requestForm, 
                        start_date: date ? format(date, 'yyyy-MM-dd') : '' 
                      })}
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
                      onSelect={(date) => setRequestForm({ 
                        ...requestForm, 
                        end_date: date ? format(date, 'yyyy-MM-dd') : '' 
                      })}
                      locale={hr}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Broj dana</Label>
                <Input
                  type="number"
                  value={requestForm.days_requested}
                  onChange={(e) => setRequestForm({ ...requestForm, days_requested: parseInt(e.target.value) })}
                />
              </div>
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
            </div>
            <div>
              <Label>Razlog</Label>
              <Textarea
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRequestOpen(false)}>Odustani</Button>
              <Button onClick={handleCreateRequest}>Kreiraj zahtjev</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
