import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Users, CalendarDays, FileText, Home, LogOut, BedDouble } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/apartmani', label: 'Dashboard', icon: Home },
  { to: '/apartmani/jedinice', label: 'Jedinice', icon: BedDouble },
  { to: '/apartmani/rezervacije', label: 'Rezervacije', icon: CalendarDays },
  { to: '/apartmani/gosti', label: 'Gosti', icon: Users },
  { to: '/apartmani/dokumenti', label: 'Dokumenti', icon: FileText },
];

interface ApartmentLayoutProps {
  children: ReactNode;
  title: string;
}

export function ApartmentLayout({ children, title }: ApartmentLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Apartmani Špoljar</span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                location.pathname === item.to
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="h-4 w-4 mr-2" />
            Odjava
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b flex items-center px-6">
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
