import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentTemplates, useDefaultTemplate } from '@/hooks/useDocumentTemplates';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useArticles } from '@/hooks/useArticles';
import { useEmployees } from '@/hooks/useEmployees';

interface QACheckResult {
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

const AdminQA = () => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<QACheckResult[]>([]);

  // Data hooks for checks
  const { data: documents, isError: documentsError } = useDocuments();
  const { data: clients, isError: clientsError } = useClients();
  const { data: articlesData, isError: articlesError } = useArticles({ pageSize: 10 });
  const { employees, isLoading: employeesLoading, error: employeesError } = useEmployees();
  
  // Template checks
  const { data: ponudaTemplates } = useDocumentTemplates('ponuda');
  const { data: defaultPonuda } = useDefaultTemplate('ponuda');
  const { data: racunTemplates } = useDocumentTemplates('racun');
  const { data: defaultRacun } = useDefaultTemplate('racun');
  const { data: otpremnicaTemplates } = useDocumentTemplates('otpremnica');
  const { data: defaultOtpremnica } = useDefaultTemplate('otpremnica');
  const { data: ugovorTemplates } = useDocumentTemplates('ugovor');
  const { data: defaultUgovor } = useDefaultTemplate('ugovor');
  const { data: nalogTemplates } = useDocumentTemplates('nalog-dostava-montaza');
  const { data: defaultNalog } = useDefaultTemplate('nalog-dostava-montaza');

  const runQAChecks = async () => {
    setIsRunning(true);
    const checks: QACheckResult[] = [];

    // 1. Auth check
    checks.push({
      name: 'Autentifikacija',
      category: 'Auth',
      status: user ? 'pass' : 'fail',
      message: user ? `Prijavljen kao ${user.email}` : 'Nije prijavljen',
    });

    // 2. Database connectivity
    try {
      const { error } = await supabase.from('documents').select('id').limit(1);
      checks.push({
        name: 'Baza podataka',
        category: 'Infrastruktura',
        status: error ? 'fail' : 'pass',
        message: error ? `Greška: ${error.message}` : 'Povezano',
      });
    } catch (e: any) {
      checks.push({
        name: 'Baza podataka',
        category: 'Infrastruktura',
        status: 'fail',
        message: `Iznimka: ${e.message}`,
      });
    }

    // 3. Documents module
    checks.push({
      name: 'Dokumenti - učitavanje',
      category: 'Dokumenti',
      status: documentsError ? 'fail' : 'pass',
      message: documentsError ? 'Greška pri učitavanju' : `${documents?.length || 0} dokumenata`,
    });

    // 4. Clients module  
    checks.push({
      name: 'Klijenti - učitavanje',
      category: 'Šifrarnici',
      status: clientsError ? 'fail' : 'pass',
      message: clientsError ? 'Greška pri učitavanju' : `${clients?.length || 0} klijenata`,
    });

    // 5. Articles module
    checks.push({
      name: 'Artikli - učitavanje',
      category: 'Šifrarnici',
      status: articlesError ? 'fail' : 'pass',
      message: articlesError ? 'Greška pri učitavanju' : `${articlesData?.articles?.length || 0} artikala`,
    });

    // 6. Employees module
    checks.push({
      name: 'Zaposlenici - učitavanje',
      category: 'Šifrarnici',
      status: employeesError ? 'fail' : 'pass',
      message: employeesError ? 'Greška pri učitavanju' : `${employees?.length || 0} zaposlenika`,
    });

    // 7. Template checks for each document type
    const templateChecks = [
      { type: 'Ponuda', templates: ponudaTemplates, defaultT: defaultPonuda },
      { type: 'Račun', templates: racunTemplates, defaultT: defaultRacun },
      { type: 'Otpremnica', templates: otpremnicaTemplates, defaultT: defaultOtpremnica },
      { type: 'Ugovor', templates: ugovorTemplates, defaultT: defaultUgovor },
      { type: 'Nalog', templates: nalogTemplates, defaultT: defaultNalog },
    ];

    templateChecks.forEach(({ type, templates, defaultT }) => {
      const hasTemplates = templates && templates.length > 0;
      const hasDefault = !!defaultT;
      
      checks.push({
        name: `${type} - predlošci`,
        category: 'Predlošci',
        status: hasDefault ? 'pass' : hasTemplates ? 'warning' : 'warning',
        message: hasDefault 
          ? `Zadani: ${defaultT?.name}` 
          : hasTemplates 
            ? `${templates?.length} predložaka (bez zadanog)`
            : 'Nema predložaka (koristi se fallback)',
        details: hasDefault ? undefined : 'Preporuka: Postavite zadani predložak',
      });
    });

    // 8. Company settings check
    try {
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      checks.push({
        name: 'Postavke tvrtke',
        category: 'Postavke',
        status: error ? 'fail' : settings ? 'pass' : 'warning',
        message: error 
          ? `Greška: ${error.message}` 
          : settings?.company_name 
            ? `Tvrtka: ${settings.company_name}`
            : 'Postavke nisu konfigurirane',
      });
    } catch (e: any) {
      checks.push({
        name: 'Postavke tvrtke',
        category: 'Postavke',
        status: 'fail',
        message: `Iznimka: ${e.message}`,
      });
    }

    // 9. Trash functionality check (soft delete)
    try {
      const { data: trashedDocs, error } = await supabase
        .from('documents')
        .select('id')
        .not('deleted_at', 'is', null)
        .limit(5);
      
      checks.push({
        name: 'Kanta za smeće',
        category: 'Funkcionalnosti',
        status: error ? 'fail' : 'pass',
        message: error 
          ? `Greška: ${error.message}` 
          : `${trashedDocs?.length || 0} obrisanih dokumenata`,
      });
    } catch (e: any) {
      checks.push({
        name: 'Kanta za smeće',
        category: 'Funkcionalnosti',
        status: 'fail',
        message: `Iznimka: ${e.message}`,
      });
    }

    // 10. Leave requests check
    try {
      const { error } = await supabase
        .from('employee_leave_requests')
        .select('id')
        .limit(1);
      
      checks.push({
        name: 'Godišnji odmori',
        category: 'HR',
        status: error ? 'fail' : 'pass',
        message: error ? `Greška: ${error.message}` : 'Funkcionalno',
      });
    } catch (e: any) {
      checks.push({
        name: 'Godišnji odmori',
        category: 'HR',
        status: 'fail',
        message: `Iznimka: ${e.message}`,
      });
    }

    // 11. Sick leave check
    try {
      const { error } = await supabase
        .from('employee_sick_leaves')
        .select('id')
        .limit(1);
      
      checks.push({
        name: 'Bolovanja',
        category: 'HR',
        status: error ? 'fail' : 'pass',
        message: error ? `Greška: ${error.message}` : 'Funkcionalno',
      });
    } catch (e: any) {
      checks.push({
        name: 'Bolovanja',
        category: 'HR',
        status: 'fail',
        message: `Iznimka: ${e.message}`,
      });
    }

    // 12. Work clothing check
    try {
      const { error } = await supabase
        .from('employee_work_clothing')
        .select('id')
        .limit(1);
      
      checks.push({
        name: 'Radna odjeća',
        category: 'HR',
        status: error ? 'fail' : 'pass',
        message: error ? `Greška: ${error.message}` : 'Funkcionalno',
      });
    } catch (e: any) {
      checks.push({
        name: 'Radna odjeća',
        category: 'HR',
        status: 'fail',
        message: `Iznimka: ${e.message}`,
      });
    }

    setResults(checks);
    setIsRunning(false);
  };

  const getStatusIcon = (status: QACheckResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <CheckCircle2 className="h-5 w-5 text-yellow-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: QACheckResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="default" className="bg-success">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">WARN</Badge>;
      default:
        return <Badge variant="secondary">PENDING</Badge>;
    }
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, QACheckResult[]>);

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warnCount = results.filter(r => r.status === 'warning').length;

  return (
    <MainLayout title="QA Provjera" subtitle="Provjera zdravlja aplikacije">
      <div className="space-y-6">
        {/* Action buttons */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runQAChecks} 
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : results.length > 0 ? (
              <RefreshCw className="mr-2 h-5 w-5" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            {isRunning ? 'Provjeravam...' : results.length > 0 ? 'Ponovi provjeru' : 'Pokreni QA provjeru'}
          </Button>

          {results.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {passCount} pass
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4 text-destructive" />
                {failCount} fail
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                {warnCount} warn
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(groupedResults).map(([category, categoryResults]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>
                    {categoryResults.filter(r => r.status === 'pass').length}/{categoryResults.length} provjera prošlo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryResults.map((result, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{result.name}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{result.message}</p>
                          {result.details && (
                            <p className="text-xs text-yellow-600 mt-1">{result.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !isRunning && (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pokrenite QA provjeru</h3>
              <p className="text-muted-foreground">
                Kliknite gumb "Pokreni QA provjeru" za provjeru zdravlja aplikacije
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminQA;
