import { FileText, FileEdit, Truck, Users, Plus, FileSignature, ClipboardList, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { DeadlinesSection } from '@/components/dashboard/DeadlinesSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const Index = () => {
  const navigate = useNavigate();
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { data: documents = [], isLoading } = useDocuments();
  const { data: clients = [] } = useClients();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  
  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    }
    return user?.email?.split('@')[0] || 'korisnik';
  };
  
  const userName = getDisplayName();

  const stats = {
    totalDocuments: documents.length,
    draftDocuments: documents.filter(d => d.status === 'draft').length,
    completedThisMonth: documents.filter(d => ['accepted', 'completed'].includes(d.status)).length,
    totalClients: clients.length,
  };

  const quickActionButtons = [
    { label: 'Nova ponuda', icon: FileText, href: '/documents/new?type=ponuda' },
    { label: 'Novi ugovor', icon: FileSignature, href: '/documents/new?type=ugovor' },
    { label: 'Nova otpremnica', icon: Truck, href: '/documents/new?type=otpremnica' },
    { label: 'Nalog dostava + montaža', icon: ClipboardList, href: '/documents/new?type=nalog-dostava-montaza' },
    { label: 'Novi dokument', icon: Plus, href: '/documents/new' },
  ];

  return (
    <MainLayout title="Početna" showGlobalSearch>
      {/* Greeting */}
      <PageHeader 
        title={`Dobro došli, ${userName}!`}
        className="mb-5 -mt-1"
      />

      {/* Collapsible Summary Section */}
      <Collapsible open={isSummaryOpen} onOpenChange={setIsSummaryOpen} className="mb-7">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 w-full text-left group mb-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sažetak</h2>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isSummaryOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Ukupno dokumenata"
              value={isLoading ? '...' : stats.totalDocuments}
              icon={FileText}
              trend={{ value: 12, isPositive: true }}
              href="/documents"
            />
            <StatCard
              title="U pripremi"
              value={isLoading ? '...' : stats.draftDocuments}
              icon={FileEdit}
              href="/documents?status=draft"
            />
            <StatCard
              title="Završeno"
              value={isLoading ? '...' : stats.completedThisMonth}
              icon={Truck}
              trend={{ value: 8, isPositive: true }}
              href="/documents?status=completed"
            />
            <StatCard
              title="Klijenti"
              value={isLoading ? '...' : stats.totalClients}
              icon={Users}
              trend={{ value: 5, isPositive: true }}
              href="/clients"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Actions - Button Row */}
      <div className="mb-7">
        <h2 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Brze akcije</h2>
        <div className="flex flex-wrap gap-3">
          {quickActionButtons.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-12 px-5 bg-card hover:bg-card border-border hover:border-muted-foreground/40 transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] shadow-[0_1px_4px_rgba(0,0,0,0.06)] rounded-xl"
              onClick={() => navigate(action.href)}
            >
              <action.icon className="h-4 w-4 mr-2.5 text-primary" />
              <span className="font-medium text-[14px]">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Documents & Activities - Side by Side */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mb-7">
        <RecentDocuments documents={documents} maxHeight="340px" />
        <ActivityLogList limit={12} maxHeight="340px" />
      </div>

      {/* Bottom Sections - Deadlines & Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DeadlinesSection />
        <AnalyticsSection />
      </div>
    </MainLayout>
  );
};

export default Index;
