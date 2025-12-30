import { FileText, Package, Truck } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { data: documents = [], isLoading } = useDocuments();
  const { user } = useAuth();
  
  // Extract user name from email (before @) as fallback
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'korisnik';

  const stats = {
    totalDocuments: documents.length,
    pendingDocuments: documents.filter(d => ['draft', 'sent', 'pending'].includes(d.status)).length,
    completedThisMonth: documents.filter(d => ['accepted', 'completed'].includes(d.status)).length,
  };

  return (
    <MainLayout 
      title="Početna" 
      subtitle={`Dobro došli, ${userName}!`}
    >
      {/* Stats Grid */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 mb-4">
        <StatCard
          title="Ukupno dokumenata"
          value={isLoading ? '...' : stats.totalDocuments}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
          href="/documents"
        />
        <StatCard
          title="Na čekanju"
          value={isLoading ? '...' : stats.pendingDocuments}
          icon={Package}
          subtitle="Dokumenata za obradu"
          href="/documents?status=pending"
        />
        <StatCard
          title="Završeno"
          value={isLoading ? '...' : stats.completedThisMonth}
          icon={Truck}
          trend={{ value: 8, isPositive: true }}
          href="/documents?status=completed"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-2">Brze akcije</h2>
        <QuickActions />
      </div>

      {/* Main Content - Side by side */}
      <div className="grid gap-3 lg:grid-cols-2">
        <RecentDocuments documents={documents} maxHeight="400px" />
        <ActivityLogList limit={20} maxHeight="400px" />
      </div>
    </MainLayout>
  );
};

export default Index;
