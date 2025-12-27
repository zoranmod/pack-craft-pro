import { useState, useEffect } from 'react';
import { Save, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useEmployeePermissions, defaultPermissions, permissionTemplates } from '@/hooks/useEmployeePermissions';
import type { EmployeePermissions } from '@/types/employee';

interface EmployeePermissionsTabProps {
  employeeId: string;
  hasAccount: boolean;
}

type PermissionKey = keyof Omit<EmployeePermissions, 'id' | 'employee_id' | 'created_at' | 'updated_at'>;

const permissionLabels: Record<PermissionKey, { label: string; description: string; category: string }> = {
  can_view_documents: { label: 'Pregled dokumenata', description: 'Može pregledavati dokumente', category: 'Dokumenti' },
  can_create_documents: { label: 'Kreiranje dokumenata', description: 'Može kreirati nove dokumente', category: 'Dokumenti' },
  can_edit_documents: { label: 'Uređivanje dokumenata', description: 'Može uređivati postojeće dokumente', category: 'Dokumenti' },
  can_manage_employees: { label: 'Upravljanje zaposlenicima', description: 'Može dodavati i uređivati zaposlenike', category: 'Zaposlenici' },
  can_request_leave: { label: 'Zahtjev za godišnji', description: 'Može slati zahtjeve za godišnji odmor', category: 'Godišnji i bolovanja' },
  can_approve_leave: { label: 'Odobravanje godišnjeg', description: 'Može odobravati zahtjeve za godišnji', category: 'Godišnji i bolovanja' },
  can_request_sick_leave: { label: 'Prijava bolovanja', description: 'Može prijavljivati bolovanja', category: 'Godišnji i bolovanja' },
  can_view_work_clothing: { label: 'Pregled radne odjeće', description: 'Može pregledavati radnu odjeću', category: 'Radna odjeća' },
  can_view_articles: { label: 'Pregled artikala', description: 'Može pregledavati artikle', category: 'Artikli' },
  can_edit_articles: { label: 'Uređivanje artikala', description: 'Može uređivati artikle', category: 'Artikli' },
  can_view_clients: { label: 'Pregled klijenata', description: 'Može pregledavati klijente', category: 'Klijenti' },
  can_edit_clients: { label: 'Uređivanje klijenata', description: 'Može uređivati klijente', category: 'Klijenti' },
  can_view_settings: { label: 'Pregled postavki', description: 'Može pregledavati postavke', category: 'Postavke' },
  can_edit_settings: { label: 'Uređivanje postavki', description: 'Može uređivati postavke', category: 'Postavke' },
};

export function EmployeePermissionsTab({ employeeId, hasAccount }: EmployeePermissionsTabProps) {
  const { permissions, isLoading, upsert } = useEmployeePermissions(employeeId);
  const [formData, setFormData] = useState<Record<PermissionKey, boolean>>(
    defaultPermissions as Record<PermissionKey, boolean>
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (permissions) {
      const data: Record<PermissionKey, boolean> = {} as Record<PermissionKey, boolean>;
      (Object.keys(permissionLabels) as PermissionKey[]).forEach((key) => {
        data[key] = permissions[key] ?? false;
      });
      setFormData(data);
    }
  }, [permissions]);

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (templateKey && permissionTemplates[templateKey as keyof typeof permissionTemplates]) {
      setFormData(permissionTemplates[templateKey as keyof typeof permissionTemplates].permissions as Record<PermissionKey, boolean>);
    }
  };

  const handlePermissionChange = (key: PermissionKey, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }));
    setSelectedTemplate(''); // Clear template selection when manually changing
  };

  const handleSave = async () => {
    await upsert.mutateAsync({
      employee_id: employeeId,
      ...formData,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!hasAccount) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nije moguće postaviti dozvole</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              Zaposlenik prvo mora imati kreiran korisnički račun kako bi mu se mogle dodijeliti dozvole za pristup sustavu.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group permissions by category
  const categories = [...new Set(Object.values(permissionLabels).map((p) => p.category))];

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Predlošci dozvola</CardTitle>
          <CardDescription>Odaberite predložak za brzo postavljanje dozvola</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-full md:w-80">
              <SelectValue placeholder="Odaberite predložak..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(permissionTemplates).map(([key, template]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span>{template.name}</span>
                    <span className="text-xs text-muted-foreground">{template.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Permission Categories */}
      {categories.map((category) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-base">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(permissionLabels) as [PermissionKey, typeof permissionLabels[PermissionKey]][])
                .filter(([, info]) => info.category === category)
                .map(([key, info]) => (
                  <div key={key} className="flex items-start space-x-3">
                    <Checkbox
                      id={key}
                      checked={formData[key]}
                      onCheckedChange={(checked) => handlePermissionChange(key, checked as boolean)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={key} className="cursor-pointer">
                        {info.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {upsert.isPending ? 'Spremanje...' : 'Spremi dozvole'}
        </Button>
      </div>
    </div>
  );
}
