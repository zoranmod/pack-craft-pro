import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({ 
  title, 
  isOpen, 
  onToggle, 
  children,
  className 
}: CollapsibleSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle} className={className}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 w-full text-left group mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h2>
          <ChevronDown className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
