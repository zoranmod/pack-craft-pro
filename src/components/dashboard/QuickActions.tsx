import { Link } from 'react-router-dom';
import { FilePlus, FileText, Package, Truck, Wrench, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: FilePlus,
    label: 'Nova ponuda',
    path: '/documents/new?type=ponuda',
  },
  {
    icon: FileText,
    label: 'Novi ugovor',
    path: '/contracts/new',
  },
  {
    icon: Package,
    label: 'Nova otpremnica',
    path: '/documents/new?type=otpremnica',
  },
  {
    icon: Truck,
    label: 'Nalog za dostavu i montažu',
    path: '/documents/new?type=nalog-dostava',
  },
  {
    icon: Plus,
    label: 'Novi dokument',
    path: '/documents/new',
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.path}
          to={action.path}
          className={cn(
            "inline-flex items-center gap-2 px-3 py-2 rounded-md",
            "bg-card border border-border text-sm font-medium text-foreground",
            "hover:border-primary/30 hover:bg-accent transition-all duration-150"
          )}
        >
          <action.icon className="h-4 w-4 text-primary" />
          <span>{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
