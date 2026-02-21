import { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDocumentTags, useAddDocumentTag, useRemoveDocumentTag, useAvailableTagNames } from '@/hooks/useDocumentTags';
import { cn } from '@/lib/utils';

interface DocumentTagsProps {
  documentId: string;
  readonly?: boolean;
}

export function DocumentTags({ documentId, readonly = false }: DocumentTagsProps) {
  const { data: tags = [] } = useDocumentTags(documentId);
  const addTag = useAddDocumentTag();
  const removeTag = useRemoveDocumentTag();
  const availableNames = useAvailableTagNames();
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const existingTagNames = tags.map(t => t.tag_name);
  const suggestions = availableNames.filter(
    name => !existingTagNames.includes(name) && name.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsAdding(false);
        setInputValue('');
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addTag.mutateAsync({ documentId, tagName: trimmed });
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(inputValue);
    }
    if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" ref={wrapperRef}>
      {tags.map(tag => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-xs gap-1 pr-1"
        >
          <Tag className="h-3 w-3" />
          {tag.tag_name}
          {!readonly && (
            <button
              onClick={() => removeTag.mutate({ tagId: tag.id, documentId })}
              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}

      {!readonly && (
        isAdding ? (
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Naziv taga..."
              className="h-7 w-32 text-xs"
            />
            {showSuggestions && suggestions.length > 0 && inputValue && (
              <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-md max-h-32 overflow-auto">
                {suggestions.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleAdd(name)}
                    className="w-full px-2 py-1.5 text-left text-xs hover:bg-accent transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Tag
          </Button>
        )
      )}
    </div>
  );
}
