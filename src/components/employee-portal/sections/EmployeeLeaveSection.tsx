import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2
} from 'lucide-react';
import { format, differenceInBusinessDays } from 'date-fns';
import { hr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLeaveEntitlements, useLeaveRequests } from '@/hooks/useEmployees';
import { toast } from 'sonner';

interface EmployeeLeaveSectionProps {
  employeeId: string;
  canRequest: boolean;
}

export function EmployeeLeaveSection({ employeeId, canRequest }: EmployeeLeaveSectionProps) {
  const currentYear = new Date().getFullYear();
  const { entitlements, isLoading: entitlementsLoading } = useLeaveEntitlements(employeeId);
  const { requests, isLoading: requestsLoading, create: createRequest } = useLeaveRequests(employeeId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentEntitlement = entitlements?.find(e => e.year === currentYear);
  const remainingDays = currentEntitlement 
    ? (currentEntitlement.total_days + (currentEntitlement.carried_over_days || 0)) - currentEntitlement.used_days
    : 0;

  const handleSubmitRequest = async () => {
    if (!startDate || !endDate) {
      toast.error('Odaberite datume');
      return;
    }

    const daysRequested = differenceInBusinessDays(endDate, startDate) + 1;
    
    if (daysRequested > remainingDays) {
      toast.error('Nemate dovoljno preostalih dana');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequest.mutateAsync({
        employee_id: employeeId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        days_requested: daysRequested,
        reason,
        status: 'pending',
        leave_type: 'godišnji',
      });
      toast.success('Zahtjev uspješno poslan');
      setIsDialogOpen(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setReason('');
    } catch (err: any) {
      toast.error(err.message || 'Greška pri slanju zahtjeva');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Odobren</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Odbijen</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Na čekanju</Badge>;
    }
  };

  const isLoading = entitlementsLoading || requestsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Godišnji odmor {currentYear}</CardTitle>
          <CardDescription>Pregled stanja godišnjeg odmora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{currentEntitlement?.total_days || 0}</p>
              <p className="text-sm text-muted-foreground">Ukupno dana</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{currentEntitlement?.carried_over_days || 0}</p>
              <p className="text-sm text-muted-foreground">Preneseno</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{currentEntitlement?.used_days || 0}</p>
              <p className="text-sm text-muted-foreground">Iskorišteno</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-2xl font-bold text-primary">{remainingDays}</p>
              <p className="text-sm text-muted-foreground">Preostalo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Request Button */}
      {canRequest && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Novi zahtjev
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novi zahtjev za godišnji odmor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Od datuma</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd.MM.yyyy.', { locale: hr }) : 'Odaberi'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} locale={hr} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Do datuma</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd.MM.yyyy.', { locale: hr }) : 'Odaberi'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} locale={hr} disabled={(date) => startDate ? date < startDate : false} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {startDate && endDate && (
                <p className="text-sm text-muted-foreground">
                  Broj radnih dana: <span className="font-medium">{differenceInBusinessDays(endDate, startDate) + 1}</span>
                </p>
              )}
              <div className="space-y-2">
                <Label>Razlog (opcionalno)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Unesite razlog..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Odustani</Button>
                <Button onClick={handleSubmitRequest} disabled={isSubmitting || !startDate || !endDate}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Pošalji zahtjev
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Moji zahtjevi</CardTitle>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(new Date(request.start_date), 'dd.MM.yyyy.', { locale: hr })} - {format(new Date(request.end_date), 'dd.MM.yyyy.', { locale: hr })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.days_requested} dana • {request.leave_type}
                    </p>
                    {request.reason && <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nemate zahtjeva za godišnji odmor</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
