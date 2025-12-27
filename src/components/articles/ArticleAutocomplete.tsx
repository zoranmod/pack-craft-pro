import { useState, useRef, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useArticles, Article } from '@/hooks/useArticles';

interface ArticleAutocompleteProps {
  onSelect: (article: Article) => void;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function ArticleAutocomplete({ 
  onSelect, 
  value = '', 
  onChange,
  placeholder = 'Naziv stavke' 
}: ArticleAutocompleteProps) {
  const [search, setSearch] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const { data: articles = [], isLoading } = useArticles();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(search.toLowerCase()) ||
    (article.code && article.code.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (article: Article) => {
    setSearch(article.name);
    setIsOpen(false);
    onSelect(article);
  };

  const handleChange = (newValue: string) => {
    setSearch(newValue);
    setIsOpen(true);
    onChange?.(newValue);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        value={search}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />

      {isOpen && search.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Učitavanje...
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="py-1">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  type="button"
                  onClick={() => handleSelect(article)}
                  className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-start gap-3"
                >
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate">{article.name}</span>
                      <span className="text-sm text-primary font-medium whitespace-nowrap">
                        {article.price.toLocaleString('hr-HR', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {article.code && `Šifra: ${article.code} • `}
                      {article.unit} • PDV: {article.pdv}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Nema pronađenih artikala
            </div>
          )}
        </div>
      )}
    </div>
  );
}
