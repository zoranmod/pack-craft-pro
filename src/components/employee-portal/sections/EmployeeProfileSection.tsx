import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Employee } from '@/types/employee';

interface EmployeeProfileSectionProps {
  employee: Employee;
}

export function EmployeeProfileSection({ employee }: EmployeeProfileSectionProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'dd.MM.yyyy.', { locale: hr });
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium truncate">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {employee.first_name} {employee.last_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{employee.position || 'Zaposlenik'}</Badge>
                <Badge variant={employee.status === 'aktivan' ? 'default' : 'secondary'}>
                  {employee.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Osobni podaci</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={Mail} label="Email" value={employee.email} />
          <InfoItem icon={Phone} label="Telefon" value={employee.phone} />
          <InfoItem icon={Calendar} label="Datum rođenja" value={formatDate(employee.date_of_birth)} />
          <InfoItem icon={CreditCard} label="OIB" value={employee.oib} />
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Adresa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={MapPin} label="Adresa" value={employee.address} />
          <InfoItem icon={MapPin} label="Grad" value={employee.city} />
          <InfoItem icon={MapPin} label="Poštanski broj" value={employee.postal_code} />
        </CardContent>
      </Card>

      {/* Employment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Podaci o zaposlenju</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={Building2} label="Odjel" value={employee.department} />
          <InfoItem icon={Briefcase} label="Pozicija" value={employee.position} />
          <InfoItem icon={Calendar} label="Početak rada" value={formatDate(employee.employment_start_date)} />
          <InfoItem icon={Calendar} label="Završetak rada" value={formatDate(employee.employment_end_date)} />
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Vrsta zaposlenja</p>
              <Badge variant="outline" className="mt-1">
                {employee.employment_type === 'stalni' ? 'Stalni radni odnos' : 
                 employee.employment_type === 'ugovor' ? 'Ugovor o radu' : 
                 employee.employment_type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {employee.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Napomene</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{employee.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
