import { FileText, Package, Truck, Wrench } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { mockDocuments } from '@/data/mockDocuments';

const Index = () => {
  const stats = {
    totalDocuments: mockDocuments.length,
    pendingDocuments: mockDocuments.filter(d => d.status === 'pending').length,
    completedThisMonth: mockDocuments.filter(d => d.status === 'completed').length,
    totalRevenue: mockDocuments.reduce((sum, d) => sum + d.totalAmount, 0),
  };

  return (
    <MainLayout 
      title="Nadzorna ploča" 
      subtitle="Pregled i upravljanje dokumentima"
    >
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Ukupno dokumenata"
          value={stats.totalDocuments}
          icon={FileText}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Na čekanju"
          value={stats.pendingDocuments}
          icon={Package}
          subtitle="Dokumenata za obradu"
        />
        <StatCard
          title="Završeno ovaj mjesec"
          value={stats.completedThisMonth}
          icon={Truck}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Ukupni promet"
          value={`${stats.totalRevenue.toLocaleString('hr-HR')} €`}
          icon={Wrench}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentDocuments documents={mockDocuments} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
