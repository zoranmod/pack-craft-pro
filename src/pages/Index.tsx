import { FileText, FileEdit, Truck, Users } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { DeadlinesSection } from '@/components/dashboard/DeadlinesSection';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection';
import { RemindersWidget } from '@/components/dashboard/RemindersWidget';
import { HRStatsSection } from '@/components/dashboard/HRStatsSection';
import { useDocuments } from '@/hooks/useDocuments';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useSettings';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { useYearFilter } from '@/hooks/useYearFilter';

const Index = () => {
  const { data: documents = [], isLoading } = useDocuments();
  const { data: clients = [] } = useClients();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const { sections, toggleSection } = useDashboardPreferences();
  const { filterByYear, yearLabel, selectedYear } = useYearFilter();
  
  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
    }
    return user?.email?.split('@')[0] || 'korisnik';
  };
  
  const userName = getDisplayName();

  // Filter documents by selected year
  const filteredDocuments = documents.filter(doc => filterByYear(doc.date));

  const stats = {
    totalDocuments: filteredDocuments.length,
    draftDocuments: filteredDocuments.filter(d => d.status === 'draft').length,
    completedThisMonth: filteredDocuments.filter(d => ['accepted', 'completed'].includes(d.status)).length,
    totalClients: clients.length,
  };

  const yearSuffix = selectedYear !== 'all' ? ` (${selectedYear})` : '';

  return (
    <MainLayout title="Početna" showGlobalSearch>
      {/* Greeting */}
      <PageHeader 
        title={`Dobro došli, ${userName}!`}
        className="mb-5 -mt-1"
      />

      {/* Collapsible Summary Section */}
      <CollapsibleSection
        title={`Sažetak${yearSuffix}`}
        isOpen={sections.summary}
        onToggle={() => toggleSection('summary')}
        className="mb-6"
      >
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Ukupno dokumenata"
            value={isLoading ? '...' : stats.totalDocuments}
            icon={FileText}
            trend={{ value: 12, isPositive: true }}
            href={`/documents?year=${selectedYear}`}
          />
          <StatCard
            title="U pripremi"
            value={isLoading ? '...' : stats.draftDocuments}
            icon={FileEdit}
            href={`/documents?status=draft&year=${selectedYear}`}
          />
          <StatCard
            title="Završeno"
            value={isLoading ? '...' : stats.completedThisMonth}
            icon={Truck}
            trend={{ value: 8, isPositive: true }}
            href={`/documents?status=completed&year=${selectedYear}`}
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
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <CollapsibleSection
          title={`Nedavni dokumenti${yearSuffix}`}
          isOpen={sections.recentDocuments}
          onToggle={() => toggleSection('recentDocuments')}
        >
          <div className="h-[280px]">
            <RecentDocuments documents={filteredDocuments} />
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection
          title="Aktivnosti"
          isOpen={sections.activities}
          onToggle={() => toggleSection('activities')}
        >
          <div className="h-[280px]">
            <ActivityLogList limit={12} />
          </div>
        </CollapsibleSection>
      </div>

      {/* Reminders Section */}
      <div className="mb-6">
        <RemindersWidget />
      </div>

      {/* HR Stats Section */}
      <div className="mb-6">
        <HRStatsSection />
      </div>

      {/* Bottom Sections - Deadlines & Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CollapsibleSection
          title={`Rokovi i isporuke${yearSuffix}`}
          isOpen={sections.deadlines}
          onToggle={() => toggleSection('deadlines')}
        >
          <div className="h-[280px]">
            <DeadlinesSection documents={filteredDocuments} />
          </div>
        </CollapsibleSection>
        
        <CollapsibleSection
          title={`Analitika${yearSuffix}`}
          isOpen={sections.analytics}
          onToggle={() => toggleSection('analytics')}
        >
          <div className="h-[280px]">
            <AnalyticsSection documents={filteredDocuments} />
          </div>
        </CollapsibleSection>
      </div>
    </MainLayout>
  );
};

export default Index;
