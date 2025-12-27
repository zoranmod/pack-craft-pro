import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Employee } from '@/types/employee';
import { User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';

interface EmployeeInfoTabProps {
  employee: Employee;
}

export function EmployeeInfoTab({ employee }: EmployeeInfoTabProps) {
  const formatDate = (date?: string) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}.`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            Osobni podaci
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ime</p>
              <p className="font-medium">{employee.first_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prezime</p>
              <p className="font-medium">{employee.last_name}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">OIB</p>
            <p className="font-medium">{employee.oib || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Datum rođenja</p>
            <p className="font-medium">{formatDate(employee.date_of_birth)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            Kontakt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{employee.phone || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{employee.email || '-'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            Adresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{employee.address || '-'}</p>
          <p>
            {employee.postal_code} {employee.city}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5" />
            Zaposlenje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pozicija</p>
              <p className="font-medium">{employee.position || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Odjel</p>
              <p className="font-medium">{employee.department || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vrsta ugovora</p>
            <p className="font-medium capitalize">{employee.employment_type}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Datum zaposlenja</p>
              <p className="font-medium">{formatDate(employee.employment_start_date)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Datum prestanka</p>
              <p className="font-medium">{formatDate(employee.employment_end_date)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {employee.notes && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Napomene</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
