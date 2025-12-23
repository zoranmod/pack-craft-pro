import { Building2, User, Bell, Shield, Database } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
  return (
    <MainLayout 
      title="Postavke" 
      subtitle="Upravljajte postavkama aplikacije"
    >
      <div className="max-w-3xl space-y-8">
        {/* Company Info */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Podaci o tvrtki</h2>
              <p className="text-sm text-muted-foreground">Informacije koje se prikazuju na dokumentima</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="companyName">Naziv tvrtke</Label>
              <Input id="companyName" defaultValue="Vaša tvrtka d.o.o." className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Adresa</Label>
              <Input id="address" defaultValue="Ulica 123, 10000 Zagreb" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="oib">OIB</Label>
              <Input id="oib" defaultValue="12345678901" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input id="iban" defaultValue="HR1234567890123456789" className="mt-1.5" />
            </div>
          </div>
          
          <div className="mt-6">
            <Button>Spremi promjene</Button>
          </div>
        </div>

        {/* User Profile */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Korisnički profil</h2>
              <p className="text-sm text-muted-foreground">Vaši osobni podaci</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="firstName">Ime</Label>
              <Input id="firstName" defaultValue="Ivan" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="lastName">Prezime</Label>
              <Input id="lastName" defaultValue="Horvat" className="mt-1.5" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="ivan@tvrtka.hr" className="mt-1.5" />
            </div>
          </div>
          
          <div className="mt-6">
            <Button>Spremi promjene</Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Obavijesti</h2>
              <p className="text-sm text-muted-foreground">Upravljajte obavijestima</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email obavijesti</p>
                <p className="text-sm text-muted-foreground">Primajte obavijesti emailom</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Novi dokumenti</p>
                <p className="text-sm text-muted-foreground">Obavijest o novim dokumentima</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Podsjetnici</p>
                <p className="text-sm text-muted-foreground">Podsjetnici za dokumente na čekanju</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Podaci</h2>
              <p className="text-sm text-muted-foreground">Upravljanje podacima aplikacije</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button variant="outline">Izvezi sve dokumente</Button>
            <p className="text-sm text-muted-foreground">
              Preuzmite sve svoje dokumente u ZIP formatu
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
