import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showGlobalSearch?: boolean;
}

export function MainLayout({ children, title, subtitle, showGlobalSearch = false }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useKeyboardShortcuts();

  // Defensive cleanup: in rare cases Radix layers can leave pointer-events locked after fast route changes.
  useEffect(() => {
    const raf = window.requestAnimationFrame(() => {
      if (document.body.style.pointerEvents) {
        document.body.style.pointerEvents = '';
      }
      if (document.documentElement.style.pointerEvents) {
        document.documentElement.style.pointerEvents = '';
      }
    });

    return () => window.cancelAnimationFrame(raf);
  }, [location.pathname]);

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
