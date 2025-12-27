import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContractArticleFormData } from '@/types/contractArticle';
import { cn } from '@/lib/utils';

interface ContractArticlesEditorProps {
  articles: ContractArticleFormData[];
  onArticlesChange: (articles: ContractArticleFormData[]) => void;
  placeholderValues?: Record<string, string>;
  onPlaceholderChange?: (key: string, value: string) => void;
}

export function ContractArticlesEditor({
  articles,
  onArticlesChange,
  placeholderValues = {},
  onPlaceholderChange,
}: ContractArticlesEditorProps) {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [editingArticle, setEditingArticle] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // Extract all unique placeholders from articles
  const placeholders = articles.reduce<string[]>((acc, article) => {
    const matches = article.content.match(/\{([^}]+)\}/g) || [];
    matches.forEach(match => {
      const key = match.slice(1, -1);
      if (!acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, []);

  const toggleArticle = (index: number) => {
    setExpandedArticle(expandedArticle === index ? null : index);
  };

  const toggleSelect = (index: number) => {
    const newArticles = [...articles];
    newArticles[index] = { ...newArticles[index], is_selected: !newArticles[index].is_selected };
    onArticlesChange(newArticles);
  };

  const moveArticle = (index: number, direction: 'up' | 'down') => {
    const newArticles = [...articles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= articles.length) return;
    
    [newArticles[index], newArticles[targetIndex]] = [newArticles[targetIndex], newArticles[index]];
    // Update article numbers
    newArticles.forEach((article, i) => {
      article.article_number = i + 1;
    });
    onArticlesChange(newArticles);
  };

  const startEditing = (index: number) => {
    setEditingArticle(index);
    setEditContent(articles[index].content);
  };

  const saveEdit = (index: number) => {
    const newArticles = [...articles];
    newArticles[index] = { ...newArticles[index], content: editContent };
    onArticlesChange(newArticles);
    setEditingArticle(null);
  };

  const cancelEdit = () => {
    setEditingArticle(null);
    setEditContent('');
  };

  const deleteArticle = (index: number) => {
    const newArticles = articles.filter((_, i) => i !== index);
    // Update article numbers
    newArticles.forEach((article, i) => {
      article.article_number = i + 1;
    });
    onArticlesChange(newArticles);
  };

  const addCustomArticle = () => {
    const newArticle: ContractArticleFormData = {
      article_number: articles.length + 1,
      title: 'NOVI ČLANAK',
      content: 'Unesite sadržaj članka...',
      is_selected: true,
    };
    onArticlesChange([...articles, newArticle]);
    setExpandedArticle(articles.length);
    setEditingArticle(articles.length);
    setEditContent(newArticle.content);
  };

  const placeholderLabels: Record<string, string> = {
    ukupna_cijena: 'Ukupna cijena (EUR)',
    predujam: 'Predujam (EUR)',
    ostatak: 'Ostatak (EUR)',
    adresa_kupca: 'Adresa kupca',
    datum_ugovora: 'Datum ugovora',
    mjesto_ugovora: 'Mjesto ugovora',
  };

  return (
    <div className="space-y-6">
      {/* Placeholder Values */}
      {placeholders.length > 0 && onPlaceholderChange && (
        <div className="bg-muted/30 rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-foreground">Dinamičke vrijednosti</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {placeholders.map(key => (
              <div key={key}>
                <Label htmlFor={key}>{placeholderLabels[key] || key}</Label>
                <Input
                  id={key}
                  value={placeholderValues[key] || ''}
                  onChange={(e) => onPlaceholderChange(key, e.target.value)}
                  placeholder={`Unesite ${placeholderLabels[key]?.toLowerCase() || key}`}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Članci ugovora ({articles.filter(a => a.is_selected).length} odabrano)</h3>
          <Button type="button" variant="outline" size="sm" onClick={addCustomArticle}>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj članak
          </Button>
        </div>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {articles.map((article, index) => (
              <div
                key={index}
                className={cn(
                  "border rounded-lg transition-colors",
                  article.is_selected ? "border-primary/50 bg-primary/5" : "border-border bg-card"
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-2 p-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Checkbox
                    checked={article.is_selected}
                    onCheckedChange={() => toggleSelect(index)}
                  />
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => toggleArticle(index)}
                  >
                    <span className="font-medium text-foreground">
                      Članak {article.article_number}. {article.title}
                    </span>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveArticle(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => moveArticle(index, 'down')}
                      disabled={index === articles.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleArticle(index)}
                    >
                      {expandedArticle === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedArticle === index && (
                  <div className="border-t border-border p-3 space-y-3">
                    {editingArticle === index ? (
                      <>
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                        />
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                            <X className="h-4 w-4 mr-1" />
                            Odustani
                          </Button>
                          <Button type="button" size="sm" onClick={() => saveEdit(index)}>
                            <Check className="h-4 w-4 mr-1" />
                            Spremi
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {article.content}
                        </p>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => startEditing(index)}
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Uredi
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => deleteArticle(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Obriši
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
