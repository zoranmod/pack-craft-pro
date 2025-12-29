import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

export interface Appliance {
  id: string;
  name: string;
  warrantyMonths: number;
}

interface AppliancesEditorProps {
  appliances: Appliance[];
  onChange: (appliances: Appliance[]) => void;
}

export function AppliancesEditor({ appliances, onChange }: AppliancesEditorProps) {
  const addAppliance = () => {
    onChange([
      ...appliances,
      { id: crypto.randomUUID(), name: '', warrantyMonths: 24 },
    ]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    onChange(
      appliances.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      )
    );
  };

  const removeAppliance = (id: string) => {
    onChange(appliances.filter((a) => a.id !== id));
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Ugradbeni aparati</span>
          <Button onClick={addAppliance} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Dodaj aparat
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appliances.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nema ugradbenih aparata. Kliknite "Dodaj aparat" za unos.
          </p>
        ) : (
          appliances.map((appliance) => (
            <div
              key={appliance.id}
              className="flex items-end gap-4 p-4 border rounded-lg bg-muted/30"
            >
              <div className="flex-1">
                <Label htmlFor={`name-${appliance.id}`}>Naziv aparata</Label>
                <Input
                  id={`name-${appliance.id}`}
                  value={appliance.name}
                  onChange={(e) => updateAppliance(appliance.id, 'name', e.target.value)}
                  placeholder="npr. Bosch perilica posuđa"
                  className="mt-1.5"
                />
              </div>
              <div className="w-32">
                <Label htmlFor={`warranty-${appliance.id}`}>Garancija (mj.)</Label>
                <Input
                  id={`warranty-${appliance.id}`}
                  type="number"
                  min={0}
                  value={appliance.warrantyMonths}
                  onChange={(e) =>
                    updateAppliance(appliance.id, 'warrantyMonths', parseInt(e.target.value) || 0)
                  }
                  className="mt-1.5"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAppliance(appliance.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        
        {appliances.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Pregled za ugovor:</p>
            <ul className="text-sm space-y-1">
              {appliances.filter(a => a.name).map((appliance) => (
                <li key={appliance.id}>
                  • {appliance.name} (garancija: {appliance.warrantyMonths} mjeseci)
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
