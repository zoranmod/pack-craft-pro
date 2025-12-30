import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Menu, Sun, Moon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 pl-4 pr-3 md:pr-6 backdrop-blur-xl bg-white/70 dark:bg-[#0d0d0d]/60 supports-[backdrop-filter]:bg-white/50 dark:supports-[backdrop-filter]:bg-black/40 border-b border-white/20 dark:border-white/10 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
          {showMenuButton && (
            <Button variant="ghost" size="icon" onClick={onMenuClick}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-base md:text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Search - only shown when enabled, triggers on Enter */}
          {showGlobalSearch && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pretraži dokumente"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-56 pl-9 pr-9 h-9 bg-card border-border text-sm"
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
          )}

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
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-accent dark:hover:bg-zinc-800">
                <div className="h-7 w-7 rounded-full bg-primary dark:bg-zinc-700 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary-foreground dark:text-white" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
                {user?.email}
              </div>
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
