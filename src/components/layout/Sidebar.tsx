import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  Stethoscope,
  Plus,
  ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logoLight from '@/assets/logo.png';
import logoDark from '@/assets/logo-dark.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useCompanySettings } from '@/hooks/useSettings';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const documentTypes = [
  { label: 'Ponuda', icon: FileText, href: '/documents/new?type=ponuda' },
  { label: 'Ugovor', icon: FileSignature, href: '/documents/new?type=ugovor' },
  { label: 'Otpremnica', icon: Truck, href: '/documents/new?type=otpremnica' },
  { label: 'Nalog dostava + montaža', icon: ClipboardList, href: '/documents/new?type=nalog-dostava-montaza' },
  { label: 'Račun', icon: Receipt, href: '/documents/new?type=racun' },
];

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
      { icon: Stethoscope, label: 'Bolovanja', path: '/bolovanja' },
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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const { data: companySettings } = useCompanySettings();
  const [newDocMenuOpen, setNewDocMenuOpen] = useState(false);
  
  const STORAGE_KEY = 'sidebar-expanded-groups';
  
  // Initialize state from localStorage or default
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Invalid JSON, ignore
    }
    
    // First load: auto-open only the group containing current route
    const initialState: Record<string, boolean> = {
      dokumenti: false,
      sifrarnici: false,
      pregledi: false,
    };
    
    navGroups.forEach(group => {
      if (group.items.some(item => 
        location.pathname === item.path || location.pathname.startsWith(item.path + '/')
      )) {
        initialState[group.id] = true;
      }
    });
    
    return initialState;
  });

  // Persist to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedGroups));
    } catch (e) {
      // localStorage unavailable
    }
  }, [expandedGroups]);
  
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
        "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
        isActive(item.path)
          ? "bg-secondary text-foreground border-l-2 border-primary ml-[-1px] dark:bg-secondary"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-muted/60"
      )}
    >
      <item.icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors duration-150",
        isActive(item.path) ? "text-primary" : "group-hover:text-foreground"
      )} />
      <span className="truncate">{item.label}</span>
    </Link>
  );

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo Header - aligned with nav typography */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-border">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Company logo" className="h-5 w-5 object-contain shrink-0" />
          <span className="text-[13px] font-semibold text-foreground truncate leading-tight">{companyName}</span>
        </div>
        {isMobile && (
          <button
            onClick={() => onOpenChange?.(false)}
            className="p-1.5 rounded-md hover:bg-muted/70 dark:hover:bg-muted/60 transition-colors duration-150 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto space-y-0.5">
        {/* Početna - always first and visible */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
            isActive('/')
              ? "bg-secondary text-foreground border-l-2 border-primary ml-[-1px] dark:bg-secondary"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-muted/60"
          )}
        >
          <LayoutDashboard className={cn(
            "h-4 w-4 flex-shrink-0 transition-colors duration-150",
            isActive('/') && "text-primary"
          )} />
          <span className="truncate">Početna</span>
        </Link>

        {/* Novi dokument - always visible, above DOKUMENTI section */}
        <div className="pt-2">
          <DropdownMenu modal={false} open={newDocMenuOpen} onOpenChange={setNewDocMenuOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 w-full rounded-md px-2.5 py-2 text-[13px] font-medium transition-all",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    )}
                  >
                    <Plus className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Novi dokument</span>
                    <ChevronDown className="h-3.5 w-3.5 ml-auto opacity-70" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden">
                Novi dokument
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" side="right" className="w-56">
              {documentTypes.map((docType) => (
                <DropdownMenuItem
                  key={docType.href}
                  onClick={() => {
                    navigate(docType.href);
                    setNewDocMenuOpen(false);
                    if (isMobile && onOpenChange) {
                      onOpenChange(false);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <docType.icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{docType.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Grouped navigation sections */}
        {navGroups.map((group) => (
          <Collapsible
            key={group.id}
            open={expandedGroups[group.id]}
            onOpenChange={() => toggleGroup(group.id)}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full px-2 py-1.5 mt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors duration-150">
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
        ))}
      </nav>

      {/* Bottom Items (Trash) */}
      <div className="px-2 py-1.5 space-y-0.5">
        {bottomItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* Compact Settings Footer */}
      <div className="border-t border-border px-2 py-2">
        <Link
          to="/settings"
          onClick={handleLinkClick}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
            isActive('/settings')
              ? "bg-secondary text-foreground border-l-2 border-primary ml-[-1px]"
              : "text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:hover:bg-muted/60"
          )}
        >
          <Settings className={cn("h-4 w-4 flex-shrink-0 transition-colors duration-150", isActive('/settings') && "text-primary")} />
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

  // Desktop: fixed sidebar - pointer-events-auto ensures clicks always work
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-48 bg-card border-r border-border pointer-events-auto">
      {sidebarContent}
    </aside>
  );
}
