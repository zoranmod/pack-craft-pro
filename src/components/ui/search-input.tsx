import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Pretraži...",
  className,
  inputClassName,
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={cn("pl-9 pr-9", inputClassName)}
      />
      {value && (
        <button
          type="button"
          aria-label="Očisti pretragu"
          className="absolute right-2 flex items-center justify-center w-6 h-6 rounded-sm hover:bg-muted/50"
          onClick={() => onChange('')}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
