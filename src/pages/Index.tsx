import { FileText, Package, Truck, Wrench } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { ActivityLogList } from '@/components/activity/ActivityLogList';
import { useDocuments } from '@/hooks/useDocuments';

const Index = () => {
  const { data: documents = [], isLoading } = useDocuments();

  const stats = {
    totalDocuments: documents.length,
    pendingDocuments: documents.filter(d => d.status === 'pending').length,
    completedThisMonth: documents.filter(d => d.status === 'completed').length,
    totalRevenue: documents
      .filter(d => d.type !== 'ponuda')
      .reduce((sum, d) => sum + d.totalAmount, 0),
  };

  return (
    <MainLayout 
      title="Početna stranica" 
      subtitle="Dobrodošli u sustav"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
          title="Završeno ovaj mjesec"
          value={isLoading ? '...' : stats.completedThisMonth}
          icon={Truck}
          trend={{ value: 8, isPositive: true }}
          href="/documents?status=completed"
        />
        <StatCard
          title="Ukupni promet"
          value={isLoading ? '...' : `${stats.totalRevenue.toLocaleString('hr-HR')} €`}
          icon={Wrench}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDocuments documents={documents} />
        <ActivityLogList limit={20} maxHeight="350px" />
      </div>
    </MainLayout>
  );
};

export default Index;
