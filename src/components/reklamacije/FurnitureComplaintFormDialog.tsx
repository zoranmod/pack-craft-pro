import { useEffect, useState } from 'react';
import { format, parse, isValid } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  FurnitureComplaint,
  FurnitureComplaintInput,
  FurnitureComplaintStatus,
  useSaveFurnitureComplaint,
} from '@/hooks/useFurnitureComplaints';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: FurnitureComplaint | null;
}

const today = () => new Date().toISOString().slice(0, 10);

const toDate = (s: string | null | undefined): Date | undefined => {
  if (!s) return undefined;
  const d = parse(s, 'yyyy-MM-dd', new Date());
  return isValid(d) ? d : undefined;
};
const toIso = (d: Date | undefined): string | null =>
  d ? format(d, 'yyyy-MM-dd') : null;

function HrDatePicker({
  value,
  onChange,
  allowClear = false,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  allowClear?: boolean;
}) {
  const date = toDate(value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'dd.MM.yyyy.', { locale: hr }) : <span>Odaberi datum</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(toIso(d) ?? (allowClear ? null : value))}
          initialFocus
          className={cn('p-3 pointer-events-auto')}
        />
        {allowClear && value && (
          <div className="p-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => onChange(null)}
            >
              Ukloni datum
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function FurnitureComplaintFormDialog({ open, onOpenChange, editing }: Props) {
  const save = useSaveFurnitureComplaint();
  const [form, setForm] = useState<FurnitureComplaintInput>({
    customer_name: '',
    customer_location: '',
    customer_phone: '',
    description: '',
    entry_date: today(),
    deadline_date: null,
    status: 'otvoreno',
  });

  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          customer_name: editing.customer_name,
          customer_location: editing.customer_location ?? '',
          customer_phone: editing.customer_phone ?? '',
          description: editing.description ?? '',
          entry_date: editing.entry_date,
          deadline_date: editing.deadline_date,
          status: editing.status,
        });
      } else {
        setForm({
          customer_name: '',
          customer_location: '',
          customer_phone: '',
          description: '',
          entry_date: today(),
          deadline_date: null,
          status: 'otvoreno',
        });
      }
    }
  }, [open, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) return;
    await save.mutateAsync({ ...form, id: editing?.id });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Uredi reklamaciju' : 'Dodaj reklamaciju'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Ime i prezime *</Label>
            <Input
              required
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lokacija kupca</Label>
              <Input
                value={form.customer_location ?? ''}
                onChange={(e) => setForm({ ...form, customer_location: e.target.value })}
              />
            </div>
            <div>
              <Label>Broj telefona</Label>
              <Input
                value={form.customer_phone ?? ''}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Opis reklamacije</Label>
            <Textarea
              rows={4}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Datum upisa</Label>
              <HrDatePicker
                value={form.entry_date}
                onChange={(v) => setForm({ ...form, entry_date: v ?? today() })}
              />
            </div>
            <div>
              <Label>Rok za rješavanje</Label>
              <HrDatePicker
                value={form.deadline_date}
                onChange={(v) => setForm({ ...form, deadline_date: v })}
                allowClear
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as FurnitureComplaintStatus })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="otvoreno">Otvoreno</SelectItem>
                  <SelectItem value="u_tijeku">U tijeku</SelectItem>
                  <SelectItem value="rijeseno">Riješeno</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Odustani
            </Button>
            <Button type="submit" disabled={save.isPending}>Spremi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}