import { FileText, Package, Truck, Wrench } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
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
        />
        <StatCard
          title="Na čekanju"
          value={isLoading ? '...' : stats.pendingDocuments}
          icon={Package}
          subtitle="Dokumenata za obradu"
        />
        <StatCard
          title="Završeno ovaj mjesec"
          value={isLoading ? '...' : stats.completedThisMonth}
          icon={Truck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Ukupni promet"
          value={isLoading ? '...' : `${stats.totalRevenue.toLocaleString('hr-HR')} €`}
          icon={Wrench}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Main Content */}
      <RecentDocuments documents={documents} />
    </MainLayout>
  );
};

export default Index;
