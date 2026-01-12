import { ConversionReportData } from '@/hooks/useReports';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, FileText, ScrollText, Truck, Receipt, Loader2 } from 'lucide-react';

interface ConversionReportProps {
  data: ConversionReportData | undefined;
  isLoading: boolean;
}

export function ConversionReport({ data, isLoading }: ConversionReportProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nema podataka za prikaz</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main conversion rate */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Stopa prihvaćenih ponuda</p>
              <p className="text-3xl font-bold text-primary">{data.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {data.acceptedQuotes} od {data.totalQuotes} ponuda prihvaćeno
              </p>
            </div>
          </div>
          <Progress value={data.conversionRate} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Conversion breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <ScrollText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pretvoreno u ugovore</p>
                <p className="text-2xl font-bold">{data.convertedToContract}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Truck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pretvoreno u otpremnice</p>
                <p className="text-2xl font-bold">{data.convertedToDelivery}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pretvoreno u račune</p>
                <p className="text-2xl font-bold">{data.convertedToInvoice}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-4 w-4 text-blue-600" />
          <span className="font-medium">Ukupno ponuda: {data.totalQuotes}</span>
        </div>
        <p className="text-muted-foreground">
          Od ukupno {data.totalQuotes} ponuda, {data.acceptedQuotes} je prihvaćeno ({data.conversionRate.toFixed(1)}%).
          Iz ponuda je kreirano {data.convertedToContract} ugovora, {data.convertedToDelivery} otpremnica i {data.convertedToInvoice} računa.
        </p>
      </div>
    </div>
  );
}
