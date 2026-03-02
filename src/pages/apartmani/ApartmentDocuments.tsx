import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function ApartmentDocuments() {
  return (
    <ApartmentLayout title="Dokumenti">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">Ponude i računi</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Generisanje ponuda i računa iz rezervacija — dolazi uskoro.
          </p>
        </CardContent>
      </Card>
    </ApartmentLayout>
  );
}
