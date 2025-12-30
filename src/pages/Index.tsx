import { FileText, Package, Truck, Users, Plus, FileSignature, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
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

const Index = () => {
  const navigate = useNavigate();
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
    pendingDocuments: documents.filter(d => ['draft', 'sent', 'pending'].includes(d.status)).length,
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
    <MainLayout title="Početna">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Dobro došli, {userName}!
        </h1>
      </div>

      {/* Stats Grid - 4 columns */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
          href="/documents?status=pending"
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

      {/* Quick Actions - Button Row */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Brze akcije</h2>
        <div className="flex flex-wrap gap-3">
          {quickActionButtons.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-11 px-5 bg-card hover:bg-accent/50 border-border hover:border-primary/40 transition-all"
              onClick={() => navigate(action.href)}
            >
              <action.icon className="h-4 w-4 mr-2 text-primary" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Documents & Activities - Side by Side */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr] mb-8">
        <RecentDocuments documents={documents} maxHeight="360px" />
        <ActivityLogList limit={15} maxHeight="360px" />
      </div>

      {/* Bottom Sections - Deadlines & Analytics */}
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <DeadlinesSection />
        <AnalyticsSection />
      </div>
    </MainLayout>
  );
};

export default Index;
