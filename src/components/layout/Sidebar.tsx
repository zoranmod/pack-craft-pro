import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  Truck, 
  Settings,
  Package,
  Users,
  PackageSearch,
  UserCircle,
  FileSignature,
  Receipt,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const menuItems = [
  // Početna
  { icon: LayoutDashboard, label: 'Početna stranica', path: '/' },
  
  // Dokumenti - pregled
  { icon: FileText, label: 'Svi dokumenti', path: '/documents' },
  
  // Dokumenti - kreiranje (logičan poslovni tok: ponuda → ugovor → otpremnica → dostava → račun)
  { icon: FilePlus, label: 'Nova ponuda', path: '/documents/new?type=ponuda' },
  { icon: FileSignature, label: 'Novi ugovor', path: '/contracts/new' },
  { icon: Package, label: 'Nova otpremnica', path: '/documents/new?type=otpremnica' },
  { icon: Truck, label: 'Nalog za dostavu i montažu', path: '/documents/new?type=nalog-dostava-montaza' },
  { icon: Receipt, label: 'Novi račun', path: '/documents/new?type=racun' },
  
  // Matični podaci
  { icon: Users, label: 'Klijenti', path: '/clients' },
  { icon: PackageSearch, label: 'Artikli', path: '/articles' },
  { icon: UserCircle, label: 'Zaposlenici', path: '/employees' },
];

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  const logo = theme === 'dark' ? logoDark : logoLight;

  const handleLinkClick = () => {
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Akord logo" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-foreground">Akord</span>
        </div>
        {isMobile && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const currentFullPath = location.pathname + location.search;
          const isActive = item.path === '/' 
            ? location.pathname === '/'
            : item.path.includes('?')
              ? currentFullPath === item.path
              : location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="border-t border-border p-3">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5 flex-shrink-0" />
          <span>Postavke</span>
        </Link>
      </div>
    </div>
  );

  // Mobile: use Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar (always expanded)
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-52 bg-card border-r border-border shadow-card">
      {sidebarContent}
    </aside>
  );
}
