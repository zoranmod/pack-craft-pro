import { FileText, FileEdit, Truck, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { DeadlinesSection } from '@/components/dashboard/DeadlinesSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useSettings';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';

const Index = () => {
  const { data: documents = [], isLoading } = useDocuments();
  const { data: clients = [] } = useClients();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { sections, toggleSection } = useDashboardPreferences();
  
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

  return (
    <MainLayout title="Početna" showGlobalSearch>
      {/* Greeting */}
      <PageHeader 
        title={`Dobro došli, ${userName}!`}
        className="mb-5 -mt-1"
      />

      {/* Collapsible Summary Section */}
      <CollapsibleSection
        title="Sažetak"
        isOpen={sections.summary}
        onToggle={() => toggleSection('summary')}
        className="mb-6"
      >
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
      </CollapsibleSection>

      {/* Recent Documents & Activities - Side by Side */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] mb-6">
        <CollapsibleSection
          title="Nedavni dokumenti"
          isOpen={sections.recentDocuments}
          onToggle={() => toggleSection('recentDocuments')}
        >
          <RecentDocuments documents={documents} maxHeight="205px" />
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Aktivnosti"
          isOpen={sections.activities}
          onToggle={() => toggleSection('activities')}
        >
          <ActivityLogList limit={12} maxHeight="205px" />
        </CollapsibleSection>
      </div>

      {/* Bottom Sections - Deadlines & Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CollapsibleSection
          title="Rokovi i isporuke"
          isOpen={sections.deadlines}
          onToggle={() => toggleSection('deadlines')}
        >
          <DeadlinesSection />
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Analitika"
          isOpen={sections.analytics}
          onToggle={() => toggleSection('analytics')}
        >
          <AnalyticsSection />
        </CollapsibleSection>
      </div>
    </MainLayout>
  );
};

export default Index;
