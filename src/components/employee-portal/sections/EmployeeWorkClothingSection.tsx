import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shirt, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { useWorkClothing } from '@/hooks/useEmployees';

interface EmployeeWorkClothingSectionProps {
  employeeId: string;
}

const conditionLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  novo: { label: 'Novo', variant: 'default' },
  dobro: { label: 'Dobro', variant: 'secondary' },
  rabljeno: { label: 'Rabljeno', variant: 'secondary' },
  za_zamjenu: { label: 'Za zamjenu', variant: 'destructive' },
};

export function EmployeeWorkClothingSection({ employeeId }: EmployeeWorkClothingSectionProps) {
  const { clothing, isLoading } = useWorkClothing(employeeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group by active (not returned) and returned
  const activeClothing = clothing?.filter(c => !c.return_date) || [];
  const returnedClothing = clothing?.filter(c => c.return_date) || [];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Radna odjeća</CardTitle>
          <CardDescription>Pregled zadužene radne odjeće i opreme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{activeClothing.length}</p>
              <p className="text-sm text-muted-foreground">Aktivnih zaduženja</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{activeClothing.reduce((sum, c) => sum + c.quantity, 0)}</p>
              <p className="text-sm text-muted-foreground">Ukupno komada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Clothing */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivna zaduženja</CardTitle>
        </CardHeader>
        <CardContent>
          {activeClothing.length > 0 ? (
            <div className="space-y-3">
              {activeClothing.map((item) => {
                const condition = conditionLabels[item.condition] || { label: item.condition, variant: 'secondary' as const };
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shirt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.item_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Količina: {item.quantity}
                          {item.size && ` • Veličina: ${item.size}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Zaduženo: {format(new Date(item.assigned_date), 'dd.MM.yyyy.', { locale: hr })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={condition.variant}>{condition.label}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nemate aktivnih zaduženja</p>
          )}
        </CardContent>
      </Card>

      {/* Returned Clothing */}
      {returnedClothing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vraćena oprema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {returnedClothing.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shirt className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Količina: {item.quantity}
                        {item.size && ` • Veličina: ${item.size}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Vraćeno: {format(new Date(item.return_date!), 'dd.MM.yyyy.', { locale: hr })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Vraćeno</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
