import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileCheck, Info } from 'lucide-react';
import { DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { formatDateHR } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TemplateDebugIndicatorProps {
  template: DocumentTemplate | null;
  templateSource: 'document' | 'default' | 'fallback';
  isLoading?: boolean;
  className?: string;
}

/**
 * Admin-only debug indicator showing which template is being used.
 * Shows warning badge when using fallback defaults.
 */
export function TemplateDebugIndicator({
  template,
  templateSource,
  isLoading,
  className = '',
}: TemplateDebugIndicatorProps) {
  if (isLoading) {
    return (
      <Badge variant="outline" className={`text-xs ${className}`}>
        <Info className="h-3 w-3 mr-1" />
        Učitavam predložak...
      </Badge>
    );
  }

  if (templateSource === 'fallback' || !template) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="destructive" className={`text-xs cursor-help ${className}`}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            Koristi se zadani predložak (nije postavljen aktivni)
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Nije pronađen aktivni predložak za ovaj tip dokumenta.</p>
          <p className="text-muted-foreground text-xs mt-1">
            Postavite zadani predložak u Postavke → Predlošci dokumenata
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const sourceLabel = templateSource === 'document' 
    ? 'Predložak dokumenta' 
    : 'Zadani predložak';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`text-xs cursor-help ${className}`}>
          <FileCheck className="h-3 w-3 mr-1" />
          {sourceLabel}: {template.name}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p><strong>Predložak:</strong> {template.name}</p>
          <p><strong>ID:</strong> {template.id.slice(0, 8)}...</p>
          <p><strong>Ažurirano:</strong> {formatDateHR(template.updated_at)}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {templateSource === 'document' 
              ? 'Ovaj dokument koristi specifično odabrani predložak'
              : 'Koristi se zadani predložak za ovaj tip dokumenta'}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
