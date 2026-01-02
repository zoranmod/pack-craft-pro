import { Calendar } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useYearFilter, YearFilter } from '@/hooks/useYearFilter';

export function YearSelector() {
  const { selectedYear, setYear, availableYears } = useYearFilter();

  const handleChange = (value: string) => {
    const parsed: YearFilter = value === 'all' ? 'all' : parseInt(value, 10);
    setYear(parsed);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={String(selectedYear)} onValueChange={handleChange}>
        <SelectTrigger className="w-[130px] h-10 bg-background border-border text-sm">
          <SelectValue placeholder="Odaberi godinu" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Sve godine</SelectItem>
          {availableYears.map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
