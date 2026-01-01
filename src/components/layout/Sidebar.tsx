import { useState, useEffect } from 'react';
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
  Shirt,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useCompanySettings } from '@/hooks/useSettings';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

// Grouped navigation
const navGroups: NavGroup[] = [
  {
    id: 'main',
    label: '',
    items: [
      { icon: LayoutDashboard, label: 'Početna', path: '/' },
    ],
  },
  {
    id: 'dokumenti',
    label: 'Dokumenti',
    items: [
      { icon: FileText, label: 'Svi dokumenti', path: '/documents' },
      { icon: FileText, label: 'Ponude', path: '/ponude' },
      { icon: FileSignature, label: 'Ugovori', path: '/ugovori' },
      { icon: Package, label: 'Otpremnice', path: '/otpremnice' },
      { icon: Truck, label: 'Nalozi', path: '/nalozi' },
      { icon: Receipt, label: 'Računi', path: '/racuni' },
    ],
  },
  {
    id: 'sifrarnici',
    label: 'Šifrarnici',
    items: [
      { icon: PackageSearch, label: 'Artikli', path: '/articles' },
      { icon: Users, label: 'Klijenti', path: '/clients' },
      { icon: Truck, label: 'Dobavljači', path: '/dobavljaci' },
      { icon: UsersRound, label: 'Zaposlenici', path: '/employees' },
    ],
  },
  {
    id: 'pregledi',
    label: 'Pregledi',
    items: [
      { icon: Palmtree, label: 'Godišnji odmori', path: '/godisnji-odmori' },
      { icon: Shirt, label: 'Radna odjeća', path: '/radna-odjeca' },
      { icon: Calendar, label: 'Kalendar', path: '/kalendar' },
    ],
  },
];

// Bottom items (above settings)
const bottomItems: NavItem[] = [
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
  
  // Track expanded groups - default all expanded
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dokumenti: true,
    sifrarnici: true,
    pregledi: true,
  });

  // Auto-expand group containing active route
  useEffect(() => {
    navGroups.forEach(group => {
      if (group.label && group.items.some(item => 
        item.path === '/' 
          ? location.pathname === '/'
          : location.pathname === item.path || location.pathname.startsWith(item.path + '/')
      )) {
        setExpandedGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [location.pathname]);
  
  const defaultLogo = theme === 'dark' ? logoDark : logoLight;
  const logo = companySettings?.logo_url || defaultLogo;
  const companyName = companySettings?.company_name || 'Akord';

  const handleLinkClick = () => {
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isActive = (path: string) => {
    const currentFullPath = location.pathname + location.search;
    return path === '/' 
      ? location.pathname === '/'
      : path.includes('?')
        ? currentFullPath === path
        : location.pathname === path;
  };

  const NavItem = ({ item }: { item: NavItem }) => (
    <Link
      to={item.path}
      onClick={handleLinkClick}
      className={cn(
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all duration-150",
        isActive(item.path)
          ? "bg-primary text-primary-foreground shadow-sm dark:bg-zinc-800/70 dark:text-zinc-100 dark:border-l-2 dark:border-yellow-500/60"
          : "text-muted-foreground hover:bg-accent hover:text-foreground dark:hover:bg-zinc-800/40 dark:hover:text-zinc-100"
      )}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Compact Logo Header */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Company logo" className="h-6 w-6 object-contain" />
          <span className="font-semibold text-sm text-foreground truncate">{companyName}</span>
        </div>
        {isMobile && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        {navGroups.map((group) => {
          if (!group.label) {
            // Ungrouped items (Početna, Kanta za smeće)
            return (
              <div key={group.id} className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </div>
            );
          }

          // Grouped items with collapsible
          return (
            <Collapsible
              key={group.id}
              open={expandedGroups[group.id]}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors">
                <span>{group.label}</span>
                {expandedGroups[group.id] ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-0.5 mt-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.path} item={item} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </nav>

      {/* Bottom Items (Trash) */}
      <div className="px-2 py-1.5 space-y-0.5">
        {bottomItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Compact Settings Footer */}
      <div className="border-t border-border/50 px-2 py-2">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
            isActive('/settings')
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4 flex-shrink-0" />
          <span>Postavke</span>
        </Link>
      </div>
    </div>
  );

  // Mobile: use Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-56">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-48 bg-card border-r border-border shadow-card">
      {sidebarContent}
    </aside>
  );
}
