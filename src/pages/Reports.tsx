import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useYearFilter } from '@/hooks/useYearFilter';
import { useClientReport, useConversionReport, useMonthlyReport } from '@/hooks/useReports';
import { ClientReport } from '@/components/reports/ClientReport';
import { ConversionReport } from '@/components/reports/ConversionReport';
import { MonthlyReport } from '@/components/reports/MonthlyReport';
import { Users, TrendingUp, Calendar } from 'lucide-react';

export default function Reports() {
  const { selectedYear, yearLabel } = useYearFilter();
  const [activeTab, setActiveTab] = useState('clients');

  // Only pass year filter if it's a number (not 'all')
  const filters = typeof selectedYear === 'number' ? { year: selectedYear } : undefined;
  
  const { data: clientData, isLoading: isLoadingClients } = useClientReport(filters);
  const { data: conversionData, isLoading: isLoadingConversion } = useConversionReport(filters);
  const { data: monthlyData, isLoading: isLoadingMonthly } = useMonthlyReport(filters);

  const displayYear = typeof selectedYear === 'number' ? selectedYear : new Date().getFullYear();

  return (
    <MainLayout title="Izvještaji" subtitle={`Pregled statistika i izvještaja za ${yearLabel}`}>
      <div className="space-y-6">

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Klijenti</span>
            </TabsTrigger>
            <TabsTrigger value="conversion" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Konverzija</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Mjesečno</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Izvještaj po klijentima
                </CardTitle>
                <CardDescription>
                  Pregled svih dokumenata i iznosa grupiranih po klijentima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ClientReport data={clientData} isLoading={isLoadingClients} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Stopa konverzije ponuda
                </CardTitle>
                <CardDescription>
                  Analiza uspješnosti ponuda i konverzije u druge tipove dokumenata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ConversionReport data={conversionData} isLoading={isLoadingConversion} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Mjesečni izvještaj
                </CardTitle>
                <CardDescription>
                  Pregled dokumenata i iznosa po mjesecima s mogućnošću izvoza
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyReport 
                  data={monthlyData} 
                  isLoading={isLoadingMonthly} 
                  year={displayYear}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
