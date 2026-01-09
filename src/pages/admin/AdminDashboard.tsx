import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Package, 
  Settings, 
  Calendar, 
  Shield, 
  CheckSquare,
  Trash2,
  LayoutTemplate,
  UserCog
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useEmployees } from '@/hooks/useEmployees';
import { useArticles } from '@/hooks/useArticles';
import { useYearFilter } from '@/hooks/useYearFilter';

const AdminDashboard = () => {
  const { selectedYear } = useYearFilter();
  const { data: documents } = useDocuments();
  const { data: clients } = useClients();
  const { data: suppliers } = useSuppliers();
  const { employees } = useEmployees();
  const { data: articlesData } = useArticles({ pageSize: 1000 });

  // Filter documents by selected year if needed
  const currentYearDocs = selectedYear === 'all' 
    ? documents 
    : documents?.filter(d => new Date(d.date).getFullYear() === selectedYear);

  const stats = [
    { label: 'Dokumenti', value: currentYearDocs?.length || 0, icon: FileText, suffix: selectedYear !== 'all' ? ` (${selectedYear})` : '' },
    { label: 'Klijenti', value: clients?.length || 0, icon: Users },
    { label: 'Dobavljači', value: suppliers?.length || 0, icon: Package },
    { label: 'Zaposlenici', value: employees?.length || 0, icon: UserCog },
    { label: 'Artikli', value: articlesData?.articles?.length || 0, icon: Package },
  ];

  const quickActions = [
    { label: 'Upravljaj predlošcima', icon: LayoutTemplate, href: '/admin/templates', description: 'Predlošci dokumenata' },
    { label: 'Korisnici i ovlasti', icon: Shield, href: '/admin/users', description: 'Upravljanje korisnicima' },
    { label: 'Blagdani', icon: Calendar, href: '/admin/holidays', description: 'Neradni dani' },
    { label: 'QA provjera', icon: CheckSquare, href: '/admin/qa', description: 'Zdravlje aplikacije' },
    { label: 'Audit/Cleanup', icon: Trash2, href: '/admin/audit', description: 'Optimizacija' },
    { label: 'Postavke', icon: Settings, href: '/admin/settings', description: 'Globalne postavke' },
  ];

  return (
    <MainLayout title="Admin Panel" subtitle="Centralizirano upravljanje aplikacijom">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-5">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}{stat.suffix || ''}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Brze akcije</CardTitle>
            <CardDescription>Pristup ključnim admin funkcijama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <action.icon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status sustava</CardTitle>
            <CardDescription>Brzi pregled zdravlja aplikacije</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm">Svi sustavi operativni</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/qa">Pokreni QA provjeru</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
