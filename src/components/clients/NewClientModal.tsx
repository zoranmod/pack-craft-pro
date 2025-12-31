import { useState } from 'react';
import { Building2, User, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export interface NewClientData {
  name: string;
  client_type: 'company' | 'private';
  oib?: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
}

interface NewClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialName: string;
  onSave: (data: NewClientData) => Promise<void>;
  isLoading?: boolean;
}

export function NewClientModal({
  open,
  onOpenChange,
  initialName,
  onSave,
  isLoading = false,
}: NewClientModalProps) {
  const [clientType, setClientType] = useState<'company' | 'private'>('company');
  const [name, setName] = useState(initialName);
  const [oib, setOib] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  // Reset form when modal opens with new name
  useState(() => {
    setName(initialName);
    setClientType('company');
    setOib('');
    setAddress('');
    setPhone('');
    setEmail('');
    setContactPerson('');
  });

  const handleSave = async () => {
    if (!name.trim()) return;

    await onSave({
      name: name.trim(),
      client_type: clientType,
      oib: oib.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      contact_person: contactPerson.trim() || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset form on close
        setName(initialName);
        setClientType('company');
        setOib('');
        setAddress('');
        setPhone('');
        setEmail('');
        setContactPerson('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Novi klijent</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Client Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tip klijenta</Label>
            <RadioGroup
              value={clientType}
              onValueChange={(value) => setClientType(value as 'company' | 'private')}
              className="grid grid-cols-2 gap-3"
            >
              <label
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  clientType === 'company'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <RadioGroupItem value="company" id="company" className="sr-only" />
                <Building2 className={cn(
                  "h-5 w-5",
                  clientType === 'company' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  clientType === 'company' ? "text-primary" : "text-foreground"
                )}>
                  Pravna osoba
                </span>
              </label>
              <label
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  clientType === 'private'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                <RadioGroupItem value="private" id="private" className="sr-only" />
                <User className={cn(
                  "h-5 w-5",
                  clientType === 'private' ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "font-medium",
                  clientType === 'private' ? "text-primary" : "text-foreground"
                )}>
                  Privatna osoba
                </span>
              </label>
            </RadioGroup>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="client-name">
              {clientType === 'company' ? 'Naziv tvrtke' : 'Ime i prezime'}
            </Label>
            <Input
              id="client-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={clientType === 'company' ? 'Unesite naziv tvrtke...' : 'Unesite ime i prezime...'}
            />
          </div>

          {/* Conditional Fields based on client type */}
          {clientType === 'company' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="oib">OIB (opcionalno)</Label>
                <Input
                  id="oib"
                  value={oib}
                  onChange={(e) => setOib(e.target.value)}
                  placeholder="12345678901"
                  maxLength={11}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresa (opcionalno)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ulica i kućni broj"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">Kontakt osoba (opcionalno)</Label>
                <Input
                  id="contact-person"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Ime kontakt osobe"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon (opcionalno)</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+385..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcionalno)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@primjer.hr"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresa (opcionalno)</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ulica i kućni broj"
                />
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Ostale podatke možete naknadno unijeti u sekciji Klijenti.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Odustani
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Spremam...
              </>
            ) : (
              'Spremi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
