import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Truck, 
  Settings,
  Users,
  PackageSearch,
  FileSignature,
  Receipt,
  X,
  Calendar,
  Package,
  UsersRound,
  Trash2,
  Palmtree,
  Shirt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useCompanySettings } from '@/hooks/useSettings';

// Module-based sidebar navigation (list views only, no creation actions)
const menuItems = [
  { icon: LayoutDashboard, label: 'Početna', path: '/' },
  { icon: FileText, label: 'Svi dokumenti', path: '/documents' },
  { icon: FileText, label: 'Ponude', path: '/ponude' },
  { icon: FileSignature, label: 'Ugovori', path: '/ugovori' },
  { icon: Package, label: 'Otpremnice', path: '/otpremnice' },
  { icon: Truck, label: 'Nalozi dostave i montaže', path: '/nalozi' },
  { icon: Receipt, label: 'Računi', path: '/racuni' },
  { icon: PackageSearch, label: 'Artikli', path: '/articles' },
  { icon: Users, label: 'Klijenti', path: '/clients' },
  { icon: Truck, label: 'Dobavljači', path: '/dobavljaci' },
  { icon: UsersRound, label: 'Zaposlenici', path: '/employees' },
  { icon: Palmtree, label: 'Godišnji odmori', path: '/godisnji-odmori' },
  { icon: Shirt, label: 'Radna odjeća', path: '/radna-odjeca' },
  { icon: Calendar, label: 'Kalendar', path: '/kalendar' },
  { icon: Trash2, label: 'Kanta za smeće', path: '/trash' },
];

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const { data: companySettings } = useCompanySettings();
  
  // Use company logo from settings if available, otherwise fall back to default
  const defaultLogo = theme === 'dark' ? logoDark : logoLight;
  const logo = companySettings?.logo_url || defaultLogo;
  const companyName = companySettings?.company_name || 'Akord';

  const handleLinkClick = () => {
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Company logo" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-foreground">{companyName}</span>
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
                  ? "bg-primary text-primary-foreground shadow-sm dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-l-2 dark:border-yellow-500/60"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100"
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
