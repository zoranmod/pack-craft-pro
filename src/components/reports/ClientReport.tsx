import { formatCurrency } from '@/lib/utils';
import { documentTypeLabels } from '@/types/document';
import { ClientReportData } from '@/hooks/useReports';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ClientReportProps {
  data: ClientReportData[] | undefined;
  isLoading: boolean;
}

export function ClientReport({ data, isLoading }: ClientReportProps) {
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
    <div className="space-y-4">
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Klijent</TableHead>
              <TableHead className="text-center">Dokumenti</TableHead>
              <TableHead className="text-right">Ukupno</TableHead>
              <TableHead>Po tipu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((client) => (
              <TableRow key={client.clientName}>
                <TableCell className="font-medium">{client.clientName}</TableCell>
                <TableCell className="text-center">{client.totalDocuments}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(client.totalAmount)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(client.documentsByType).map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {documentTypeLabels[type as keyof typeof documentTypeLabels] || type}: {count}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground text-right">
        Ukupno klijenata: {data.length} | 
        Ukupna vrijednost: {formatCurrency(data.reduce((sum, c) => sum + c.totalAmount, 0))}
      </div>
    </div>
  );
}
