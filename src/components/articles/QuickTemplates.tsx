import { Zap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useArticleTemplates, Article } from '@/hooks/useArticles';
import { cn } from '@/lib/utils';

interface QuickTemplatesProps {
  onSelectTemplate: (template: Article) => void;
  className?: string;
}

export function QuickTemplates({ onSelectTemplate, className }: QuickTemplatesProps) {
  const { data: templates = [], isLoading } = useArticleTemplates();

  if (isLoading) {
    return null;
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4" />
        <span>Brze šablone</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectTemplate(template)}
            className="gap-1.5 h-8 text-xs hover:bg-primary/10 hover:border-primary/50"
          >
            <Plus className="h-3 w-3" />
            {template.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
