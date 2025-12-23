import { Link } from 'react-router-dom';
import { FilePlus, Package, Truck, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    icon: FilePlus,
    label: 'Nova ponuda',
    description: 'Kreiraj novu ponudu za klijenta',
    path: '/documents/new?type=ponuda',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Package,
    label: 'Nova otpremnica',
    description: 'Dokumentiraj isporuku robe',
    path: '/documents/new?type=otpremnica',
    color: 'bg-success/10 text-success',
  },
  {
    icon: Truck,
    label: 'Nalog za dostavu',
    description: 'Organiziraj dostavu proizvoda',
    path: '/documents/new?type=nalog-dostava',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Wrench,
    label: 'Nalog za montažu',
    description: 'Planiraj montažne radove',
    path: '/documents/new?type=nalog-montaza',
    color: 'bg-primary/10 text-primary',
  },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
      <h2 className="font-semibold text-foreground mb-4">Brze akcije</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="group flex flex-col gap-2 rounded-lg border border-border p-4 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
          >
            <div className={cn("inline-flex h-10 w-10 items-center justify-center rounded-lg", action.color)}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
