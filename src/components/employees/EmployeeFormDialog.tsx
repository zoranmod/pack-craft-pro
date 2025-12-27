import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { useEmployees } from '@/hooks/useEmployees';
import { formatDateHR, cn } from '@/lib/utils';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Employee } from '@/types/employee';

const formSchema = z.object({
  first_name: z.string().min(1, 'Ime je obavezno'),
  last_name: z.string().min(1, 'Prezime je obavezno'),
  oib: z.string().optional(),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postal_code: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Neispravan email').optional().or(z.literal('')),
  employment_start_date: z.string().min(1, 'Datum zaposlenja je obavezan'),
  employment_end_date: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  employment_type: z.string().min(1, 'Vrsta ugovora je obavezna'),
  status: z.string().min(1, 'Status je obavezan'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee;
}

export function EmployeeFormDialog({ open, onOpenChange, employee }: EmployeeFormDialogProps) {
  const { createEmployee, updateEmployee } = useEmployees();
  const isEditing = !!employee;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      oib: '',
      date_of_birth: '',
      address: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      employment_start_date: format(new Date(), 'yyyy-MM-dd'),
      employment_end_date: '',
      position: '',
      department: '',
      employment_type: 'stalni',
      status: 'aktivan',
      notes: '',
    },
  });

  useEffect(() => {
    if (employee) {
      form.reset({
        first_name: employee.first_name,
        last_name: employee.last_name,
        oib: employee.oib || '',
        date_of_birth: employee.date_of_birth || '',
        address: employee.address || '',
        city: employee.city || '',
        postal_code: employee.postal_code || '',
        phone: employee.phone || '',
        email: employee.email || '',
        employment_start_date: employee.employment_start_date,
        employment_end_date: employee.employment_end_date || '',
        position: employee.position || '',
        department: employee.department || '',
        employment_type: employee.employment_type,
        status: employee.status,
        notes: employee.notes || '',
      });
    } else {
      form.reset({
        first_name: '',
        last_name: '',
        oib: '',
        date_of_birth: '',
        address: '',
        city: '',
        postal_code: '',
        phone: '',
        email: '',
        employment_start_date: format(new Date(), 'yyyy-MM-dd'),
        employment_end_date: '',
        position: '',
        department: '',
        employment_type: 'stalni',
        status: 'aktivan',
        notes: '',
      });
    }
  }, [employee, form, open]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && employee) {
      await updateEmployee.mutateAsync({ 
        id: employee.id, 
        ...values,
        oib: values.oib || undefined,
        date_of_birth: values.date_of_birth || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        postal_code: values.postal_code || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        employment_end_date: values.employment_end_date || undefined,
        position: values.position || undefined,
        department: values.department || undefined,
        notes: values.notes || undefined,
      });
    } else {
      await createEmployee.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        employment_start_date: values.employment_start_date,
        employment_type: values.employment_type,
        status: values.status,
        oib: values.oib || undefined,
        date_of_birth: values.date_of_birth || undefined,
        address: values.address || undefined,
        city: values.city || undefined,
        postal_code: values.postal_code || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        employment_end_date: values.employment_end_date || undefined,
        position: values.position || undefined,
        department: values.department || undefined,
        notes: values.notes || undefined,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Uredi zaposlenika' : 'Novi zaposlenik'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ime *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prezime *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="oib"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>OIB</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={11} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum rođenja</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? formatDateHR(field.value) : 'Odaberi datum'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          locale={hr}
                          className="pointer-events-auto"
                          captionLayout="dropdown-buttons"
                          fromYear={1940}
                          toYear={new Date().getFullYear()}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresa</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poštanski broj</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pozicija</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Odjel</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vrsta ugovora *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberi vrstu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="stalni">Stalni</SelectItem>
                        <SelectItem value="određeno">Na određeno</SelectItem>
                        <SelectItem value="honorarno">Honorarno</SelectItem>
                        <SelectItem value="studentski">Studentski ugovor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberi status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aktivan">Aktivan</SelectItem>
                        <SelectItem value="neaktivan">Neaktivan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employment_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum zaposlenja *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? formatDateHR(field.value) : 'Odaberi datum'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          locale={hr}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employment_end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum prestanka</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? formatDateHR(field.value) : 'Odaberi datum'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          locale={hr}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Napomene</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Odustani
              </Button>
              <Button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending}>
                {isEditing ? 'Spremi' : 'Dodaj'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
