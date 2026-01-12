import { useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import { MonthlyReportData } from '@/hooks/useReports';
import { documentTypeLabels } from '@/types/document';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MonthlyReportProps {
  data: MonthlyReportData[] | undefined;
  isLoading: boolean;
  year: number;
}

const monthNames: Record<string, string> = {
  'January': 'Siječanj',
  'February': 'Veljača',
  'March': 'Ožujak',
  'April': 'Travanj',
  'May': 'Svibanj',
  'June': 'Lipanj',
  'July': 'Srpanj',
  'August': 'Kolovoz',
  'September': 'Rujan',
  'October': 'Listopad',
  'November': 'Studeni',
  'December': 'Prosinac',
};

export function MonthlyReport({ data, isLoading, year }: MonthlyReportProps) {
  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(m => ({
      name: monthNames[m.monthLabel] || m.monthLabel,
      ponuda: m.byType['ponuda'] || 0,
      ugovor: m.byType['ugovor'] || 0,
      otpremnica: (m.byType['otpremnica'] || 0) + (m.byType['nalog-dostava-montaza'] || 0),
      racun: m.byType['racun'] || 0,
      total: m.totalAmount,
    }));
  }, [data]);

  const totals = useMemo(() => {
    if (!data) return { documents: 0, amount: 0 };
    return {
      documents: data.reduce((sum, m) => sum + m.totalDocuments, 0),
      amount: data.reduce((sum, m) => sum + m.totalAmount, 0),
    };
  }, [data]);

  const handleExport = () => {
    if (!data) return;
    
    const headers = ['Mjesec', 'Dokumenti', 'Iznos', 'Ponude', 'Ugovori', 'Otpremnice', 'Računi'];
    const rows = data.map(m => [
      monthNames[m.monthLabel] || m.monthLabel,
      m.totalDocuments,
      m.totalAmount.toFixed(2),
      m.byType['ponuda'] || 0,
      m.byType['ugovor'] || 0,
      (m.byType['otpremnica'] || 0) + (m.byType['nalog-dostava-montaza'] || 0),
      m.byType['racun'] || 0,
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mjesecni-izvjestaj-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nema podataka za prikaz</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="ponuda" name="Ponude" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ugovor" name="Ugovori" fill="hsl(271, 91%, 65%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="otpremnica" name="Otpremnice" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="racun" name="Računi" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Izvezi CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Mjesec</TableHead>
              <TableHead className="text-center">Dokumenti</TableHead>
              <TableHead className="text-right">Iznos</TableHead>
              <TableHead className="text-center">Ponude</TableHead>
              <TableHead className="text-center">Ugovori</TableHead>
              <TableHead className="text-center">Otpremnice</TableHead>
              <TableHead className="text-center">Računi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((month) => (
              <TableRow key={month.month}>
                <TableCell className="font-medium">
                  {monthNames[month.monthLabel] || month.monthLabel}
                </TableCell>
                <TableCell className="text-center">{month.totalDocuments}</TableCell>
                <TableCell className="text-right">{formatCurrency(month.totalAmount)}</TableCell>
                <TableCell className="text-center">{month.byType['ponuda'] || 0}</TableCell>
                <TableCell className="text-center">{month.byType['ugovor'] || 0}</TableCell>
                <TableCell className="text-center">
                  {(month.byType['otpremnica'] || 0) + (month.byType['nalog-dostava-montaza'] || 0)}
                </TableCell>
                <TableCell className="text-center">{month.byType['racun'] || 0}</TableCell>
              </TableRow>
            ))}
            {/* Totals row */}
            <TableRow className="bg-muted/30 font-medium">
              <TableCell>Ukupno</TableCell>
              <TableCell className="text-center">{totals.documents}</TableCell>
              <TableCell className="text-right">{formatCurrency(totals.amount)}</TableCell>
              <TableCell className="text-center">
                {data.reduce((s, m) => s + (m.byType['ponuda'] || 0), 0)}
              </TableCell>
              <TableCell className="text-center">
                {data.reduce((s, m) => s + (m.byType['ugovor'] || 0), 0)}
              </TableCell>
              <TableCell className="text-center">
                {data.reduce((s, m) => s + (m.byType['otpremnica'] || 0) + (m.byType['nalog-dostava-montaza'] || 0), 0)}
              </TableCell>
              <TableCell className="text-center">
                {data.reduce((s, m) => s + (m.byType['racun'] || 0), 0)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
