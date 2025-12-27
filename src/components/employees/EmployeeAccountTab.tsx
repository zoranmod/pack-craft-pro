import { useState } from 'react';
import { UserPlus, Mail, Key, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEmployees } from '@/hooks/useEmployees';
import { defaultPermissions } from '@/hooks/useEmployeePermissions';
import type { Employee } from '@/types/employee';

interface EmployeeAccountTabProps {
  employee: Employee;
}

export function EmployeeAccountTab({ employee }: EmployeeAccountTabProps) {
  const { updateEmployee } = useEmployees();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const hasAccount = !!employee.auth_user_id;

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setConfirmPassword(pass);
  };

  const handleCreateAccount = async () => {
    setError('');

    if (!employee.email) {
      setError('Zaposlenik mora imati email adresu za kreiranje računa.');
      return;
    }

    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 znakova.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju.');
      return;
    }

    setIsLoading(true);

    try {
      // Call edge function to create employee account
      const { data, error: fnError } = await supabase.functions.invoke('create-employee-account', {
        body: {
          email: employee.email,
          password,
          employeeId: employee.id,
          firstName: employee.first_name,
          lastName: employee.last_name,
        },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      // Update employee with auth_user_id
      if (data?.userId) {
        await updateEmployee.mutateAsync({
          id: employee.id,
          auth_user_id: data.userId,
        });
      }

      const successMessage = data?.linkedExisting 
        ? 'Postojeći račun uspješno povezan sa zaposlenikom' 
        : 'Korisnički račun uspješno kreiran';
      toast.success(successMessage);
      setIsDialogOpen(false);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error creating account:', err);
      setError(err.message || 'Greška pri kreiranju računa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Korisnički račun
          </CardTitle>
          <CardDescription>
            Upravljajte korisničkim računom zaposlenika za pristup sustavu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasAccount ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  <Check className="h-3 w-3 mr-1" />
                  Račun aktivan
                </Badge>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Email za prijavu</p>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium text-green-600">Aktivan</p>
                  </div>
                </div>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Napomena</AlertTitle>
                <AlertDescription>
                  Zaposlenik se može prijaviti na svoj portal koristeći email i lozinku.
                  Ako je zaboravio lozinku, možete mu resetirati pristup.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  Bez računa
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Ovaj zaposlenik još nema korisnički račun. Kreirajte račun kako bi zaposlenik
                mogao pristupiti sustavu i koristiti dodijeljene funkcije.
              </p>
              {!employee.email && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Email adresa obavezna</AlertTitle>
                  <AlertDescription>
                    Za kreiranje korisničkog računa, zaposlenik mora imati unesenu email adresu.
                    Uredite podatke zaposlenika i dodajte email.
                  </AlertDescription>
                </Alert>
              )}
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                disabled={!employee.email}
                className="w-full sm:w-auto"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Kreiraj korisnički račun
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Account Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kreiraj korisnički račun</DialogTitle>
            <DialogDescription>
              Kreirajte račun za {employee.first_name} {employee.last_name}.
              Zaposlenik će se moći prijaviti koristeći email: {employee.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Unesite lozinku"
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
              <Input
                id="confirmPassword"
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ponovite lozinku"
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Zabilježite lozinku i proslijedite je zaposleniku na siguran način.
                Zaposlenik ju može kasnije promijeniti.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Odustani
              </Button>
              <Button onClick={handleCreateAccount} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kreiranje...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Kreiraj račun
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
