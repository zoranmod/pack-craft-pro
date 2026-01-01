import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Menu, Sun, Moon, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useCompanySettings } from '@/hooks/useSettings';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  showGlobalSearch?: boolean;
}

export function Header({ title, subtitle, onMenuClick, showMenuButton, showGlobalSearch = false }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isInstallable, installApp } = usePWAInstall();
  const { data: companySettings } = useCompanySettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const companyName = companySettings?.company_name || 'Akord d.o.o.';

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/documents?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center h-14 px-4 md:px-6 bg-card border-b border-border">
      {/* Left section: Menu + Brand + Title */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-9 w-9 shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Brand name - hidden on mobile, visible on desktop */}
        <span className="hidden lg:inline-block text-sm font-medium text-muted-foreground shrink-0">
          {companyName}
        </span>
        
        {/* Separator - hidden on mobile */}
        <span className="hidden lg:inline-block text-border select-none">/</span>
        
        {/* Page title */}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate leading-9">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate -mt-1">{subtitle}</p>}
        </div>
      </div>

      {/* Center section: Global Search */}
      {showGlobalSearch && (
        <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Pretraži dokumente"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-9 pr-9 h-9 bg-background border-border text-sm"
            />
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Right section: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-muted">
              <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center border border-border">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            {isInstallable && (
              <>
                <DropdownMenuItem onClick={installApp}>
                  <Download className="h-4 w-4 mr-2" />
                  Instaliraj aplikaciju
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Odjava
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
