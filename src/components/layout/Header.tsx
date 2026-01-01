import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, Menu, Sun, Moon, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { usePWAInstall } from '@/hooks/usePWAInstall';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Force close user menu on route change to prevent stuck overlays
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
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
    <header className="sticky top-0 z-50 grid grid-cols-[auto_1fr_auto] items-center h-14 px-4 md:px-6 bg-card border-b border-border gap-4">
      {/* Left section: Menu + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="h-10 w-10 shrink-0">
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Page title only */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-muted-foreground truncate leading-tight">{subtitle}</p>}
        </div>
      </div>

      {/* Center section: Global Search - centered */}
      <div className="hidden md:flex justify-center">
        {showGlobalSearch && (
          <div className="relative w-full max-w-[520px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Pretraži dokumente"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-9 pr-10 h-10 bg-background border-border text-sm"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Očisti pretragu"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Right section: Actions - flush right */}
      <div className="flex items-center gap-1 justify-end">
        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="h-10 w-10"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* User Dropdown - modal={false} prevents scroll locking that can block sidebar */}
        <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen} modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-muted">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                <User className="h-4 w-4 text-muted-foreground" />
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
                <DropdownMenuItem onClick={() => { setUserMenuOpen(false); installApp(); }}>
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
