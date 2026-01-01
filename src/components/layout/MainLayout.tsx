import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showGlobalSearch?: boolean;
}

export function MainLayout({ children, title, subtitle, showGlobalSearch = false }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className={isMobile ? "" : "pl-48 transition-all duration-300"}>
        <Header 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setSidebarOpen(true)}
          showMenuButton={isMobile}
          showGlobalSearch={showGlobalSearch}
        />
        <main className={`${isMobile ? 'p-4' : 'px-5 py-5 2xl:px-6'} animate-fade-in`}>
          {children}
        </main>
      </div>
    </div>
  );
}
