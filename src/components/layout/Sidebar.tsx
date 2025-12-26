import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  Truck, 
  Wrench, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Nadzorna ploča', path: '/' },
  { icon: FileText, label: 'Svi dokumenti', path: '/documents' },
  { icon: FilePlus, label: 'Nova ponuda', path: '/documents/new?type=ponuda' },
  { icon: Package, label: 'Nova otpremnica', path: '/documents/new?type=otpremnica' },
  { icon: Truck, label: 'Nalog za dostavu', path: '/documents/new?type=nalog-dostava' },
  { icon: Wrench, label: 'Nalog za montažu', path: '/documents/new?type=nalog-montaza' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 shadow-card",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">DocuFlow</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
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
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="border-t border-border p-3">
          <Link
            to="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Settings className={cn("h-5 w-5 flex-shrink-0", collapsed && "mx-auto")} />
            {!collapsed && <span>Postavke</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
