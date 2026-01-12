import { Link } from 'react-router-dom';
import { Users, Stethoscope, Palmtree, FileWarning, Loader2, ChevronRight } from 'lucide-react';
import { useHRStats } from '@/hooks/useHRStats';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function HRStatsSection() {
  const { data: stats, isLoading } = useHRStats();

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">HR Pregled</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!stats || stats.totalEmployees === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">HR Pregled</h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nema podataka o zaposlenicima
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">HR Pregled</h3>
        </div>
        <Link 
          to="/employees" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          Svi zaposlenici
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sick leaves */}
        <Card className={cn(
          'border',
          stats.activeSickLeaves > 0 
            ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20' 
            : 'border-border'
        )}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                stats.activeSickLeaves > 0 
                  ? 'bg-amber-100 dark:bg-amber-900/30' 
                  : 'bg-muted'
              )}>
                <Stethoscope className={cn(
                  'h-5 w-5',
                  stats.activeSickLeaves > 0 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSickLeaves}</p>
                <p className="text-xs text-muted-foreground">Na bolovanju</p>
              </div>
            </div>
            {stats.employeesOnSickLeave.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {stats.employeesOnSickLeave.slice(0, 3).map((name, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                  {stats.employeesOnSickLeave.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{stats.employeesOnSickLeave.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming leaves */}
        <Card className={cn(
          'border',
          stats.upcomingLeaves > 0 
            ? 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20' 
            : 'border-border'
        )}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                stats.upcomingLeaves > 0 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-muted'
              )}>
                <Palmtree className={cn(
                  'h-5 w-5',
                  stats.upcomingLeaves > 0 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.upcomingLeaves}</p>
                <p className="text-xs text-muted-foreground">Nadolazeći GO</p>
              </div>
            </div>
            {stats.employeesOnLeave.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {stats.employeesOnLeave.slice(0, 3).map((name, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {name}
                    </Badge>
                  ))}
                  {stats.employeesOnLeave.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{stats.employeesOnLeave.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expiring documents */}
        <Card className={cn(
          'border',
          stats.expiringDocuments > 0 
            ? 'border-destructive/30 bg-destructive/5' 
            : 'border-border'
        )}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                stats.expiringDocuments > 0 
                  ? 'bg-destructive/10' 
                  : 'bg-muted'
              )}>
                <FileWarning className={cn(
                  'h-5 w-5',
                  stats.expiringDocuments > 0 
                    ? 'text-destructive' 
                    : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.expiringDocuments}</p>
                <p className="text-xs text-muted-foreground">Dokumenti ističu</p>
              </div>
            </div>
            {stats.expiringDocumentsList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
                {stats.expiringDocumentsList.slice(0, 2).map((doc, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-muted-foreground">{doc.employeeName}:</span>{' '}
                    <span className="font-medium">{doc.documentName}</span>{' '}
                    <Badge variant={doc.daysUntilExpiry <= 7 ? 'destructive' : 'outline'} className="text-xs ml-1">
                      {doc.daysUntilExpiry}d
                    </Badge>
                  </div>
                ))}
                {stats.expiringDocumentsList.length > 2 && (
                  <Link to="/employees" className="text-xs text-primary hover:underline">
                    +{stats.expiringDocumentsList.length - 2} više
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
