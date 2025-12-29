import { useState } from 'react';
import { format, parse } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { cn } from '@/lib/utils';
interface ContractHeaderData {
  title: string;
  place: string;
  date: string;
  seller: {
    name: string;
    address: string;
    oib: string;
    iban: string;
  };
  buyer: {
    name: string;
    address: string;
    oib: string;
    phone: string;
    email: string;
  };
}

interface ContractHeaderEditorProps {
  data: ContractHeaderData;
  onChange: (data: ContractHeaderData) => void;
}

export function ContractHeaderEditor({ data, onChange }: ContractHeaderEditorProps) {
  const updateField = (path: string, value: string) => {
    const keys = path.split('.');
    const newData = { ...data };
    
    if (keys.length === 1) {
      (newData as any)[keys[0]] = value;
    } else if (keys.length === 2) {
      (newData as any)[keys[0]] = { ...(newData as any)[keys[0]], [keys[1]]: value };
    }
    
    onChange(newData);
  };

  const handleClientSelect = (client: any) => {
    onChange({
      ...data,
      buyer: {
        name: client.name || '',
        address: `${client.address || ''}, ${client.postal_code || ''} ${client.city || ''}`.trim().replace(/^,\s*/, ''),
        oib: client.oib || '',
        phone: client.phone || '',
        email: client.email || '',
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title and Date */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Osnovni podaci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Naslov ugovora</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="UGOVOR O KUPOPRODAJI"
              className="mt-1.5 text-lg font-semibold"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="place">Mjesto sklapanja</Label>
              <Input
                id="place"
                value={data.place}
                onChange={(e) => updateField('place', e.target.value)}
                placeholder="Zagreb"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Datum sklapanja</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1.5",
                      !data.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.date
                      ? format(new Date(data.date), "dd.MM.yyyy.", { locale: hr })
                      : "Odaberi datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.date ? new Date(data.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        updateField('date', date.toISOString().split('T')[0]);
                      }
                    }}
                    locale={hr}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Prodavatelj</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seller-name">Naziv tvrtke</Label>
            <Input
              id="seller-name"
              value={data.seller.name}
              onChange={(e) => updateField('seller.name', e.target.value)}
              placeholder="Naziv tvrtke d.o.o."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="seller-address">Adresa</Label>
            <Input
              id="seller-address"
              value={data.seller.address}
              onChange={(e) => updateField('seller.address', e.target.value)}
              placeholder="Ulica i broj, Poštanski broj Grad"
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="seller-oib">OIB</Label>
              <Input
                id="seller-oib"
                value={data.seller.oib}
                onChange={(e) => updateField('seller.oib', e.target.value)}
                placeholder="12345678901"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="seller-iban">IBAN</Label>
              <Input
                id="seller-iban"
                value={data.seller.iban}
                onChange={(e) => updateField('seller.iban', e.target.value)}
                placeholder="HR1234567890123456789"
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buyer */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Kupac</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Odaberi klijenta</Label>
            <div className="mt-1.5">
              <ClientAutocomplete onSelect={handleClientSelect} />
            </div>
          </div>
          <div>
            <Label htmlFor="buyer-name">Ime i prezime / Naziv</Label>
            <Input
              id="buyer-name"
              value={data.buyer.name}
              onChange={(e) => updateField('buyer.name', e.target.value)}
              placeholder="Ime i prezime kupca"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="buyer-address">Adresa</Label>
            <Input
              id="buyer-address"
              value={data.buyer.address}
              onChange={(e) => updateField('buyer.address', e.target.value)}
              placeholder="Ulica i broj, Poštanski broj Grad"
              className="mt-1.5"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="buyer-oib">OIB</Label>
              <Input
                id="buyer-oib"
                value={data.buyer.oib}
                onChange={(e) => updateField('buyer.oib', e.target.value)}
                placeholder="12345678901"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="buyer-phone">Telefon</Label>
              <Input
                id="buyer-phone"
                value={data.buyer.phone}
                onChange={(e) => updateField('buyer.phone', e.target.value)}
                placeholder="+385 99 123 4567"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="buyer-email">Email</Label>
              <Input
                id="buyer-email"
                type="email"
                value={data.buyer.email}
                onChange={(e) => updateField('buyer.email', e.target.value)}
                placeholder="email@primjer.hr"
                className="mt-1.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
