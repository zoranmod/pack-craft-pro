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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Thermometer,
  Loader2
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { hr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useSickLeaves } from '@/hooks/useEmployees';
import { toast } from 'sonner';

interface EmployeeSickLeaveSectionProps {
  employeeId: string;
  canRequest: boolean;
}

const sickLeaveTypes = [
  { value: 'bolovanje', label: 'Bolovanje' },
  { value: 'njega_djeteta', label: 'Njega djeteta' },
  { value: 'trudnička', label: 'Trudnička bolovanja' },
  { value: 'ozljeda_na_radu', label: 'Ozljeda na radu' },
  { value: 'profesionalna_bolest', label: 'Profesionalna bolest' },
];

export function EmployeeSickLeaveSection({ employeeId, canRequest }: EmployeeSickLeaveSectionProps) {
  const { sickLeaves, isLoading, create: createSickLeave } = useSickLeaves(employeeId);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [sickLeaveType, setSickLeaveType] = useState('bolovanje');
  const [documentNumber, setDocumentNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRequest = async () => {
    if (!startDate) {
      toast.error('Odaberite početni datum');
      return;
    }

    const daysCount = endDate ? differenceInDays(endDate, startDate) + 1 : null;

    setIsSubmitting(true);
    try {
      await createSickLeave.mutateAsync({
        employee_id: employeeId,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        days_count: daysCount,
        sick_leave_type: sickLeaveType,
        document_number: documentNumber || null,
        notes: notes || null,
      });
      toast.success('Bolovanje uspješno prijavljeno');
      setIsDialogOpen(false);
      setStartDate(undefined);
      setEndDate(undefined);
      setSickLeaveType('bolovanje');
      setDocumentNumber('');
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Greška pri prijavi bolovanja');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const currentYear = new Date().getFullYear();
  const thisYearSickLeaves = sickLeaves?.filter(sl => new Date(sl.start_date).getFullYear() === currentYear) || [];
  const totalDaysThisYear = thisYearSickLeaves.reduce((sum, sl) => sum + (sl.days_count || 0), 0);
  const activeSickLeave = sickLeaves?.find(sl => !sl.end_date || new Date(sl.end_date) >= new Date());

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
          <CardTitle>Bolovanje {currentYear}</CardTitle>
          <CardDescription>Pregled evidencije bolovanja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{thisYearSickLeaves.length}</p>
              <p className="text-sm text-muted-foreground">Broj bolovanja</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{totalDaysThisYear}</p>
              <p className="text-sm text-muted-foreground">Ukupno dana</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg sm:col-span-1 col-span-2">
              {activeSickLeave ? (
                <>
                  <Badge className="bg-orange-500 mb-1">Aktivno</Badge>
                  <p className="text-sm text-muted-foreground">
                    od {format(new Date(activeSickLeave.start_date), 'dd.MM.yyyy.', { locale: hr })}
                  </p>
                </>
              ) : (
                <>
                  <Badge variant="secondary" className="mb-1">Neaktivno</Badge>
                  <p className="text-sm text-muted-foreground">Nema aktivnog bolovanja</p>
                </>
              )}
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
              Prijavi bolovanje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Prijava bolovanja</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vrsta bolovanja</Label>
                <Select value={sickLeaveType} onValueChange={setSickLeaveType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sickLeaveTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <Label>Do datuma (opcionalno)</Label>
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
              <div className="space-y-2">
                <Label>Broj dokumenta (opcionalno)</Label>
                <Input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="Npr. doznaka br. 123" />
              </div>
              <div className="space-y-2">
                <Label>Napomene (opcionalno)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dodatne napomene..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Odustani</Button>
                <Button onClick={handleSubmitRequest} disabled={isSubmitting || !startDate}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Prijavi bolovanje
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sick Leaves List */}
      <Card>
        <CardHeader>
          <CardTitle>Evidencija bolovanja</CardTitle>
        </CardHeader>
        <CardContent>
          {sickLeaves && sickLeaves.length > 0 ? (
            <div className="space-y-3">
              {sickLeaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Thermometer className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {format(new Date(leave.start_date), 'dd.MM.yyyy.', { locale: hr })}
                        {leave.end_date && ` - ${format(new Date(leave.end_date), 'dd.MM.yyyy.', { locale: hr })}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sickLeaveTypes.find(t => t.value === leave.sick_leave_type)?.label || leave.sick_leave_type}
                        {leave.days_count && ` • ${leave.days_count} dana`}
                      </p>
                      {leave.document_number && (
                        <p className="text-xs text-muted-foreground mt-1">Dokument: {leave.document_number}</p>
                      )}
                    </div>
                  </div>
                  {!leave.end_date && <Badge className="bg-orange-500">Aktivno</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nemate evidencije bolovanja</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
