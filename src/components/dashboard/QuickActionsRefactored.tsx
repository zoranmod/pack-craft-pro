import { useNavigate } from 'react-router-dom';
import { FileText, Truck, Plus, FileSignature, ClipboardList, Receipt, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const pinnedActions = [
  { label: 'Nova ponuda', icon: FileText, href: '/documents/new?type=ponuda' },
  { label: 'Nova otpremnica', icon: Truck, href: '/documents/new?type=otpremnica' },
];

const dropdownActions = [
  { label: 'Ponuda', icon: FileText, href: '/documents/new?type=ponuda' },
  { label: 'Ugovor', icon: FileSignature, href: '/documents/new?type=ugovor' },
  { label: 'Otpremnica', icon: Truck, href: '/documents/new?type=otpremnica' },
  { label: 'Nalog dostava + montaža', icon: ClipboardList, href: '/documents/new?type=nalog-dostava-montaza' },
  { label: 'Račun', icon: Receipt, href: '/documents/new?type=racun' },
];

export function QuickActionsRefactored() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Pinned buttons */}
      {pinnedActions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          className="h-9 px-3 bg-card hover:bg-muted/50 border-border transition-colors"
          onClick={() => navigate(action.href)}
        >
          <action.icon className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}

      {/* Dropdown for all document types */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="h-9 px-3"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Novi dokument</span>
            <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {dropdownActions.map((action) => (
            <DropdownMenuItem
              key={action.href}
              onClick={() => navigate(action.href)}
              className="cursor-pointer"
            >
              <action.icon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
