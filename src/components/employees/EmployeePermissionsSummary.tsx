import { Shield, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployeePermissions } from '@/hooks/useEmployeePermissions';
import type { EmployeePermissions } from '@/types/employee';

interface EmployeePermissionsSummaryProps {
  employeeId: string;
  hasAccount: boolean;
}

type PermissionKey = keyof Omit<EmployeePermissions, 'id' | 'employee_id' | 'created_at' | 'updated_at'>;

const permissionLabels: Record<PermissionKey, { label: string; category: string }> = {
  can_view_documents: { label: 'Pregled dokumenata', category: 'Dokumenti' },
  can_create_documents: { label: 'Kreiranje dokumenata', category: 'Dokumenti' },
  can_edit_documents: { label: 'Uređivanje dokumenata', category: 'Dokumenti' },
  can_manage_employees: { label: 'Upravljanje zaposlenicima', category: 'Zaposlenici' },
  can_request_leave: { label: 'Zahtjev za godišnji', category: 'Godišnji' },
  can_approve_leave: { label: 'Odobravanje godišnjeg', category: 'Godišnji' },
  can_request_sick_leave: { label: 'Prijava bolovanja', category: 'Bolovanja' },
  can_view_work_clothing: { label: 'Pregled radne odjeće', category: 'Oprema' },
  can_view_articles: { label: 'Pregled artikala', category: 'Artikli' },
  can_edit_articles: { label: 'Uređivanje artikala', category: 'Artikli' },
  can_view_clients: { label: 'Pregled klijenata', category: 'Klijenti' },
  can_edit_clients: { label: 'Uređivanje klijenata', category: 'Klijenti' },
  can_view_settings: { label: 'Pregled postavki', category: 'Postavke' },
  can_edit_settings: { label: 'Uređivanje postavki', category: 'Postavke' },
};

export function EmployeePermissionsSummary({ employeeId, hasAccount }: EmployeePermissionsSummaryProps) {
  const { permissions, isLoading } = useEmployeePermissions(employeeId);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!hasAccount) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Dozvole
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Zaposlenik nema kreiran korisnički račun.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!permissions) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Dozvole
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dozvole još nisu postavljene za ovog zaposlenika.
          </p>
        </CardContent>
      </Card>
    );
  }

  const enabledPermissions = (Object.entries(permissionLabels) as [PermissionKey, typeof permissionLabels[PermissionKey]][])
    .filter(([key]) => permissions[key] === true);

  const disabledPermissions = (Object.entries(permissionLabels) as [PermissionKey, typeof permissionLabels[PermissionKey]][])
    .filter(([key]) => permissions[key] !== true);

  // Check if this is an admin user
  const isAdmin = permissions.can_manage_employees;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Dozvole
          {isAdmin && (
            <Badge variant="default" className="ml-2">
              Administrator
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {enabledPermissions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Omogućeno</p>
            <div className="flex flex-wrap gap-2">
              {enabledPermissions.map(([key, info]) => (
                <Badge key={key} variant="secondary" className="flex items-center gap-1">
                  <Check className="h-3 w-3 text-green-600" />
                  {info.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {disabledPermissions.length > 0 && enabledPermissions.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Onemogućeno</p>
            <div className="flex flex-wrap gap-2">
              {disabledPermissions.map(([key, info]) => (
                <Badge key={key} variant="outline" className="flex items-center gap-1 text-muted-foreground">
                  <X className="h-3 w-3" />
                  {info.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {enabledPermissions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nema omogućenih dozvola za ovog zaposlenika.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
