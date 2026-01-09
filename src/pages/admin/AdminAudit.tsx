import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  FileWarning,
  HardDrive,
  Loader2,
  Play,
  RefreshCw,
  Trash2,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTrashItems } from '@/hooks/useTrash';

interface AuditResult {
  category: string;
  name: string;
  status: 'ok' | 'warning' | 'error' | 'info';
  message: string;
  action?: string;
  details?: string;
}

const AdminAudit = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AuditResult[]>([]);
  const { data: trashedDocuments } = useTrashItems('documents');

  const runAudit = async () => {
    setIsRunning(true);
    const auditResults: AuditResult[] = [];

    // 1. Check for large number of soft-deleted items
    try {
      const { count: deletedDocs } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .not('deleted_at', 'is', null);

      const { count: deletedClients } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .not('deleted_at', 'is', null);

      const { count: deletedArticles } = await supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .not('deleted_at', 'is', null);

      const totalDeleted = (deletedDocs || 0) + (deletedClients || 0) + (deletedArticles || 0);

      auditResults.push({
        category: 'Baza podataka',
        name: 'Soft-deleted zapisi',
        status: totalDeleted > 100 ? 'warning' : 'ok',
        message: `${totalDeleted} zapisa u košu (${deletedDocs || 0} dok, ${deletedClients || 0} klijenti, ${deletedArticles || 0} artikli)`,
        details: totalDeleted > 100 ? 'Razmislite o trajnom brisanju starih zapisa' : undefined,
        action: totalDeleted > 0 ? 'Očisti koš' : undefined,
      });
    } catch (error) {
      auditResults.push({
        category: 'Baza podataka',
        name: 'Soft-deleted zapisi',
        status: 'error',
        message: 'Greška pri provjeri',
      });
    }

    // 2. Check document templates
    try {
      const { data: templates, error } = await supabase
        .from('document_templates')
        .select('document_type, is_default');
      
      if (!error && templates) {
        const types = ['ponuda', 'racun', 'otpremnica', 'ugovor', 'nalog-dostava-montaza'];
        const missingDefaults = types.filter(type => 
          !templates.some(t => t.document_type === type && t.is_default)
        );

        auditResults.push({
          category: 'Predlošci',
          name: 'Zadani predlošci',
          status: missingDefaults.length > 0 ? 'warning' : 'ok',
          message: missingDefaults.length > 0 
            ? `${missingDefaults.length} tipova bez zadanog predloška`
            : 'Svi tipovi imaju zadani predložak',
          details: missingDefaults.length > 0 
            ? `Nedostaju: ${missingDefaults.join(', ')}`
            : undefined,
        });
      }
    } catch (error) {
      auditResults.push({
        category: 'Predlošci',
        name: 'Zadani predlošci',
        status: 'error',
        message: 'Greška pri provjeri predložaka',
      });
    }

    // 3. Check company settings
    try {
      const { data: settings, error } = await supabase
        .from('company_settings')
        .select('*')
        .maybeSingle();

      const missingFields: string[] = [];
      if (settings) {
        if (!settings.company_name) missingFields.push('naziv tvrtke');
        if (!settings.oib) missingFields.push('OIB');
        if (!settings.iban) missingFields.push('IBAN');
        if (!settings.address) missingFields.push('adresa');
      }

      auditResults.push({
        category: 'Postavke',
        name: 'Podaci tvrtke',
        status: !settings ? 'warning' : missingFields.length > 0 ? 'warning' : 'ok',
        message: !settings 
          ? 'Postavke tvrtke nisu konfigurirane'
          : missingFields.length > 0 
            ? `Nedostaju: ${missingFields.join(', ')}`
            : 'Svi osnovni podaci popunjeni',
      });
    } catch (error) {
      auditResults.push({
        category: 'Postavke',
        name: 'Podaci tvrtke',
        status: 'error',
        message: 'Greška pri provjeri postavki',
      });
    }

    // 4. Check for employees without permissions
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .is('deleted_at', null);

      const { data: permissions } = await supabase
        .from('employee_permissions')
        .select('employee_id');

      const employeeIds = employees?.map(e => e.id) || [];
      const permissionEmployeeIds = permissions?.map(p => p.employee_id) || [];
      const missingPermissions = employeeIds.filter(id => !permissionEmployeeIds.includes(id));

      auditResults.push({
        category: 'Korisnici',
        name: 'Dozvole zaposlenika',
        status: missingPermissions.length > 0 ? 'warning' : 'ok',
        message: missingPermissions.length > 0 
          ? `${missingPermissions.length} zaposlenika bez definiranih dozvola`
          : 'Svi zaposlenici imaju dozvole',
      });
    } catch (error) {
      auditResults.push({
        category: 'Korisnici',
        name: 'Dozvole zaposlenika',
        status: 'error',
        message: 'Greška pri provjeri dozvola',
      });
    }

    // 5. Check for orphaned document items
    try {
      const { count: totalItems } = await supabase
        .from('document_items')
        .select('id', { count: 'exact', head: true });

      auditResults.push({
        category: 'Baza podataka',
        name: 'Stavke dokumenata',
        status: 'info',
        message: `${totalItems || 0} stavki dokumenata u bazi`,
      });
    } catch (error) {
      auditResults.push({
        category: 'Baza podataka',
        name: 'Stavke dokumenata',
        status: 'error',
        message: 'Greška pri provjeri stavki',
      });
    }

    // 6. Public holidays check
    try {
      const currentYear = new Date().getFullYear();
      const { count } = await supabase
        .from('public_holidays')
        .select('id', { count: 'exact', head: true })
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`);

      auditResults.push({
        category: 'Kalendar',
        name: 'Blagdani',
        status: (count || 0) < 10 ? 'warning' : 'ok',
        message: `${count || 0} blagdana u ${currentYear}`,
        details: (count || 0) < 10 ? 'Moguće da nedostaju neki blagdani' : undefined,
      });
    } catch (error) {
      auditResults.push({
        category: 'Kalendar',
        name: 'Blagdani',
        status: 'error',
        message: 'Greška pri provjeri blagdana',
      });
    }

    // 7. Storage bucket check (info only)
    auditResults.push({
      category: 'Pohrana',
      name: 'Storage bucketi',
      status: 'info',
      message: 'Bucketi: employee-documents, company-logos, database-backups',
    });

    setResults(auditResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: AuditResult['status']) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <FileWarning className="h-5 w-5 text-destructive" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: AuditResult['status']) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-success">OK</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">UPOZORENJE</Badge>;
      case 'error':
        return <Badge variant="destructive">GREŠKA</Badge>;
      case 'info':
        return <Badge variant="secondary">INFO</Badge>;
    }
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, AuditResult[]>);

  const okCount = results.filter(r => r.status === 'ok').length;
  const warnCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <MainLayout title="Audit & Cleanup" subtitle="Provjera zdravlja i optimizacija sustava">
      <div className="space-y-6">
        {/* Action bar */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={runAudit} 
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
            {isRunning ? 'Provjeravam...' : results.length > 0 ? 'Ponovi provjeru' : 'Pokreni audit'}
          </Button>

          {results.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-success" />
                {okCount} ok
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                {warnCount} upozorenja
              </span>
              <span className="flex items-center gap-1">
                <FileWarning className="h-4 w-4 text-destructive" />
                {errorCount} grešaka
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
                    {categoryResults.filter(r => r.status === 'ok').length}/{categoryResults.length} provjera u redu
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryResults.map((result, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{result.name}</span>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">{result.message}</p>
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
              <HardDrive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Pokrenite audit</h3>
              <p className="text-muted-foreground">
                Kliknite "Pokreni audit" za provjeru zdravlja sustava i preporuke za optimizaciju
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
            <CardDescription>Česte operacije održavanja</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Isprazni koš ({trashedDocuments?.length || 0})
              </Button>
              <Button variant="outline" disabled>
                <HardDrive className="mr-2 h-4 w-4" />
                Očisti cache
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Ove akcije su trenutno samo za prikaz. Implementacija dolazi u budućim verzijama.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminAudit;
