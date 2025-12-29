import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Bell, Database, Loader2, Upload, X, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import {
  useCompanySettings,
  useSaveCompanySettings,
  useUserProfile,
  useSaveUserProfile,
  useUploadCompanyLogo,
} from '@/hooks/useSettings';

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Company settings
  const { data: companyData, isLoading: companyLoading } = useCompanySettings();
  const saveCompany = useSaveCompanySettings();
  const uploadLogo = useUploadCompanyLogo();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [company, setCompany] = useState({
    company_name: '',
    address: '',
    oib: '',
    iban: '',
    logo_url: '',
  });

  // User profile
  const { data: profileData, isLoading: profileLoading } = useUserProfile();
  const saveProfile = useSaveUserProfile();
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
  });

  // Sync with fetched data
  useEffect(() => {
    if (companyData) {
      setCompany({
        company_name: companyData.company_name || '',
        address: companyData.address || '',
        oib: companyData.oib || '',
        iban: companyData.iban || '',
        logo_url: companyData.logo_url || '',
      });
    }
  }, [companyData]);

  useEffect(() => {
    if (profileData) {
      setProfile({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
      });
    }
  }, [profileData]);

  const handleSaveCompany = () => {
    saveCompany.mutate(company);
  };

  const handleSaveProfile = () => {
    saveProfile.mutate(profile);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return; // Max 2MB
      }
      uploadLogo.mutate(file, {
        onSuccess: (url) => {
          setCompany({ ...company, logo_url: url });
        },
      });
    }
  };

  const handleRemoveLogo = () => {
    setCompany({ ...company, logo_url: '' });
  };

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
          
          {companyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Logo Upload */}
              <div className="mb-6">
                <Label>Logo tvrtke</Label>
                <div className="mt-2 flex items-center gap-4">
                  {company.logo_url ? (
                    <div className="relative">
                      <img 
                        src={company.logo_url} 
                        alt="Logo tvrtke" 
                        className="h-20 w-20 object-contain rounded-lg border border-border bg-muted"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadLogo.isPending}
                    >
                      {uploadLogo.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {company.logo_url ? 'Promijeni logo' : 'Učitaj logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG do 2MB</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="companyName">Naziv tvrtke</Label>
                  <Input 
                    id="companyName" 
                    value={company.company_name}
                    onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                    placeholder="Unesite naziv tvrtke"
                    className="mt-1.5" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Adresa</Label>
                  <Input 
                    id="address" 
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    placeholder="Unesite adresu"
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label htmlFor="oib">OIB</Label>
                  <Input 
                    id="oib" 
                    value={company.oib}
                    onChange={(e) => setCompany({ ...company, oib: e.target.value })}
                    placeholder="12345678901"
                    maxLength={11}
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input 
                    id="iban" 
                    value={company.iban}
                    onChange={(e) => setCompany({ ...company, iban: e.target.value })}
                    placeholder="HR1234567890123456789"
                    className="mt-1.5" 
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={handleSaveCompany} disabled={saveCompany.isPending}>
                  {saveCompany.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Spremi promjene
                </Button>
              </div>
            </>
          )}
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
          
          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Ime</Label>
                  <Input 
                    id="firstName" 
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                    placeholder="Unesite ime"
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Prezime</Label>
                  <Input 
                    id="lastName" 
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                    placeholder="Unesite prezime"
                    className="mt-1.5" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    className="mt-1.5 bg-muted" 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email se ne može promijeniti</p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={handleSaveProfile} disabled={saveProfile.isPending}>
                  {saveProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Spremi promjene
                </Button>
              </div>
            </>
          )}
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

        {/* Document Templates */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Predlošci dokumenata</h2>
              <p className="text-sm text-muted-foreground">Prilagodite izgled ponuda, ugovora i ostalih dokumenata</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button onClick={() => navigate('/settings/templates')}>
              Upravljanje predlošcima
            </Button>
            <p className="text-sm text-muted-foreground">
              Kreirajte vlastite predloške s prilagođenim zaglavljem, tablicom i podnožjem
            </p>
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
