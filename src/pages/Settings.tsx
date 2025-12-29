import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Bell, Database, Loader2, Upload, X, FileText, CreditCard, Phone, Scale } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { CompanySettings, defaultCompanySettings } from '@/types/companySettings';
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
  const [company, setCompany] = useState<CompanySettings>(defaultCompanySettings);

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
        pdv_id: companyData.pdv_id || '',
        iban_2: companyData.iban_2 || '',
        swift_1: companyData.swift_1 || '',
        swift_2: companyData.swift_2 || '',
        bank_name_1: companyData.bank_name_1 || '',
        bank_name_2: companyData.bank_name_2 || '',
        phone_main: companyData.phone_main || '',
        phone_sales: companyData.phone_sales || '',
        phone_accounting: companyData.phone_accounting || '',
        website: companyData.website || '',
        email_info: companyData.email_info || '',
        registration_court: companyData.registration_court || '',
        registration_number: companyData.registration_number || '',
        capital_amount: companyData.capital_amount || '',
        director_name: companyData.director_name || '',
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
        {/* Company Info - Basic */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Osnovni podaci o tvrtki</h2>
              <p className="text-sm text-muted-foreground">Naziv, adresa i identifikacijski brojevi</p>
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
                    placeholder="Akord d.o.o. za Proizvodnju, Trgovinu i Usluge,"
                    className="mt-1.5" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Adresa</Label>
                  <Input 
                    id="address" 
                    value={company.address}
                    onChange={(e) => setCompany({ ...company, address: e.target.value })}
                    placeholder="32270 Županja, Veliki kraj 131, Hrvatska"
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label htmlFor="oib">OIB</Label>
                  <Input 
                    id="oib" 
                    value={company.oib}
                    onChange={(e) => setCompany({ ...company, oib: e.target.value })}
                    placeholder="97777678206"
                    maxLength={11}
                    className="mt-1.5" 
                  />
                </div>
                <div>
                  <Label htmlFor="pdvId">PDV ID</Label>
                  <Input 
                    id="pdvId" 
                    value={company.pdv_id}
                    onChange={(e) => setCompany({ ...company, pdv_id: e.target.value })}
                    placeholder="HR9777767820"
                    className="mt-1.5" 
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Banking Info */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Bankarski podaci</h2>
              <p className="text-sm text-muted-foreground">IBAN računi i SWIFT kodovi</p>
            </div>
          </div>
          
          {!companyLoading && (
            <div className="space-y-6">
              {/* First Bank */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-3">Prva banka</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="bankName1">Naziv banke</Label>
                    <Input 
                      id="bankName1" 
                      value={company.bank_name_1}
                      onChange={(e) => setCompany({ ...company, bank_name_1: e.target.value })}
                      placeholder="PBZ"
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="swift1">SWIFT/BIC</Label>
                    <Input 
                      id="swift1" 
                      value={company.swift_1}
                      onChange={(e) => setCompany({ ...company, swift_1: e.target.value })}
                      placeholder="PBZGHR2X"
                      className="mt-1.5" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input 
                      id="iban" 
                      value={company.iban}
                      onChange={(e) => setCompany({ ...company, iban: e.target.value })}
                      placeholder="HR7123400091110309063"
                      className="mt-1.5" 
                    />
                  </div>
                </div>
              </div>
              
              {/* Second Bank */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-medium mb-3">Druga banka (opcionalno)</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="bankName2">Naziv banke</Label>
                    <Input 
                      id="bankName2" 
                      value={company.bank_name_2}
                      onChange={(e) => setCompany({ ...company, bank_name_2: e.target.value })}
                      placeholder="ERSTE"
                      className="mt-1.5" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="swift2">SWIFT/BIC</Label>
                    <Input 
                      id="swift2" 
                      value={company.swift_2}
                      onChange={(e) => setCompany({ ...company, swift_2: e.target.value })}
                      placeholder="ESBCHR22"
                      className="mt-1.5" 
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="iban2">IBAN</Label>
                    <Input 
                      id="iban2" 
                      value={company.iban_2}
                      onChange={(e) => setCompany({ ...company, iban_2: e.target.value })}
                      placeholder="HR1024020061100668354"
                      className="mt-1.5" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Kontakt podaci</h2>
              <p className="text-sm text-muted-foreground">Telefoni, web i email</p>
            </div>
          </div>
          
          {!companyLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phoneMain">Besplatan info telefon</Label>
                <Input 
                  id="phoneMain" 
                  value={company.phone_main}
                  onChange={(e) => setCompany({ ...company, phone_main: e.target.value })}
                  placeholder="0800 9455"
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="phoneSales">Maloprodaja</Label>
                <Input 
                  id="phoneSales" 
                  value={company.phone_sales}
                  onChange={(e) => setCompany({ ...company, phone_sales: e.target.value })}
                  placeholder="+385 32 830 345"
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="phoneAccounting">Računovodstvo</Label>
                <Input 
                  id="phoneAccounting" 
                  value={company.phone_accounting}
                  onChange={(e) => setCompany({ ...company, phone_accounting: e.target.value })}
                  placeholder="+385 32 638 900"
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="website">Web stranica</Label>
                <Input 
                  id="website" 
                  value={company.website}
                  onChange={(e) => setCompany({ ...company, website: e.target.value })}
                  placeholder="www.akord-zupanja.hr"
                  className="mt-1.5" 
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="emailInfo">Email</Label>
                <Input 
                  id="emailInfo" 
                  type="email"
                  value={company.email_info}
                  onChange={(e) => setCompany({ ...company, email_info: e.target.value })}
                  placeholder="info@akord-zupanja.hr"
                  className="mt-1.5" 
                />
              </div>
            </div>
          )}
        </div>

        {/* Legal Info */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Scale className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Pravni podaci</h2>
              <p className="text-sm text-muted-foreground">Sudski registar, temeljni kapital i uprava</p>
            </div>
          </div>
          
          {!companyLoading && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="registrationCourt">Sudski registar</Label>
                <Input 
                  id="registrationCourt" 
                  value={company.registration_court}
                  onChange={(e) => setCompany({ ...company, registration_court: e.target.value })}
                  placeholder="Trgovački sud u Osijeku"
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="registrationNumber">MBS broj</Label>
                <Input 
                  id="registrationNumber" 
                  value={company.registration_number}
                  onChange={(e) => setCompany({ ...company, registration_number: e.target.value })}
                  placeholder="Tt-15/3264-2 MBS 030094758"
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="capitalAmount">Temeljni kapital</Label>
                <Input 
                  id="capitalAmount" 
                  value={company.capital_amount}
                  onChange={(e) => setCompany({ ...company, capital_amount: e.target.value })}
                  placeholder="1.160.000,00 kn"
                  className="mt-1.5" 
                />
              </div>
              <div>
                <Label htmlFor="directorName">Uprava (direktor)</Label>
                <Input 
                  id="directorName" 
                  value={company.director_name}
                  onChange={(e) => setCompany({ ...company, director_name: e.target.value })}
                  placeholder="Mario Špoljar"
                  className="mt-1.5" 
                />
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <Button onClick={handleSaveCompany} disabled={saveCompany.isPending}>
              {saveCompany.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Spremi sve podatke o tvrtki
            </Button>
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
