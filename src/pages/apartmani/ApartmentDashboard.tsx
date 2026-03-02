import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { useApartmentReservations } from '@/hooks/useApartmentReservations';
import { useApartmentUnits } from '@/hooks/useApartmentUnits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isToday, parseISO } from 'date-fns';
import { CalendarDays, BedDouble, Users, ArrowRightLeft } from 'lucide-react';
import { getGuestDisplayName } from '@/types/apartment';

export default function ApartmentDashboard() {
  const { ownerUserId } = useApartmentAuth();
  const { units } = useApartmentUnits(ownerUserId);
  const { reservations } = useApartmentReservations(ownerUserId);

  const today = format(new Date(), 'yyyy-MM-dd');
  const activeReservations = reservations.filter(r => r.status === 'reserved' || r.status === 'checked_in');
  const todayCheckIns = reservations.filter(r => r.check_in === today);
  const todayCheckOuts = reservations.filter(r => r.check_out === today);
  const occupiedUnitIds = activeReservations
    .filter(r => r.check_in <= today && r.check_out > today)
    .map(r => r.unit_id);
  const occupiedCount = new Set(occupiedUnitIds).size;

  return (
    <ApartmentLayout title="Dashboard">
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno jedinica</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{units.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Zauzeto danas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{occupiedCount} / {units.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-in danas</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayCheckIns.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Check-out danas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{todayCheckOuts.length}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Današnji check-in</CardTitle></CardHeader>
          <CardContent>
            {todayCheckIns.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema check-in-ova za danas</p>
            ) : (
              <div className="space-y-2">
                {todayCheckIns.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>{r.guest ? getGuestDisplayName(r.guest) : 'Nepoznat gost'}</span>
                    <Badge variant="outline">{r.unit?.name}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Današnji check-out</CardTitle></CardHeader>
          <CardContent>
            {todayCheckOuts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nema check-out-ova za danas</p>
            ) : (
              <div className="space-y-2">
                {todayCheckOuts.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span>{r.guest ? getGuestDisplayName(r.guest) : 'Nepoznat gost'}</span>
                    <Badge variant="outline">{r.unit?.name}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ApartmentLayout>
  );
}
