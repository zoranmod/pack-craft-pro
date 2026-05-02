import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  ShieldCheck,
  MoreHorizontal,
  UserCog,
  Loader2,
  UserPlus,
  Ban,
  CheckCircle,
  Key,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import type { Employee } from '@/types/employee';

const AdminUsers = () => {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const queryClient = useQueryClient();

  // Reset password dialog state
  const [resetTarget, setResetTarget] = useState<Employee | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Fetch user roles
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  // Toggle admin role mutation
  const toggleAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Uloga korisnika ažurirana');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju uloge');
      console.error(error);
    }
  });

  const isUserAdmin = (authUserId: string | null) => {
    if (!authUserId || !userRoles) return false;
    return userRoles.some(r => r.user_id === authUserId && r.role === 'admin');
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 10) return 'Lozinka mora imati najmanje 10 znakova.';
    if (pwd.length > 128) return 'Lozinka ne smije imati više od 128 znakova.';
    if (!/[A-Z]/.test(pwd)) return 'Lozinka mora sadržavati barem jedno veliko slovo.';
    if (!/[a-z]/.test(pwd)) return 'Lozinka mora sadržavati barem jedno malo slovo.';
    if (!/[0-9]/.test(pwd)) return 'Lozinka mora sadržavati barem jedan broj.';
    return null;
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
  };

  const openResetDialog = (employee: Employee) => {
    setResetTarget(employee);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  const closeResetDialog = () => {
    setResetTarget(null);
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetError('');

    const err = validatePassword(newPassword);
    if (err) { setResetError(err); return; }
    if (newPassword !== confirmPassword) {
      setResetError('Lozinke se ne podudaraju.');
      return;
    }

    setIsResetting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-employee-account', {
        body: {
          email: resetTarget.email,
          password: newPassword,
          employeeId: resetTarget.id,
          firstName: resetTarget.first_name,
          lastName: resetTarget.last_name,
          resetPassword: true,
        },
      });

      if (fnError) {
        if ((fnError as any).context?.body) {
          try {
            const text = await new Response((fnError as any).context.body).text();
            const parsed = JSON.parse(text);
            if (parsed.error) throw new Error(parsed.error);
          } catch (parseErr: any) {
            if (parseErr.message && parseErr.message !== fnError.message) throw parseErr;
          }
        }
        throw fnError;
      }
      if (data?.error) throw new Error(data.error);

      toast.success('Lozinka uspješno resetirana');
      closeResetDialog();
    } catch (err: any) {
      console.error('Error resetting password:', err);
      setResetError(err.message || 'Greška pri resetiranju lozinke');
    } finally {
      setIsResetting(false);
    }
  };

  const getEmployeeWithAccount = (employees: Employee[] | undefined) => {
    return employees?.filter(e => e.auth_user_id) || [];
  };

  const getEmployeeWithoutAccount = (employees: Employee[] | undefined) => {
    return employees?.filter(e => !e.auth_user_id) || [];
  };

  const isLoading = employeesLoading || rolesLoading;

  if (isLoading) {
    return (
      <MainLayout title="Korisnici i ovlasti">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  const usersWithAccounts = getEmployeeWithAccount(employees);
  const usersWithoutAccounts = getEmployeeWithoutAccount(employees);

  return (
    <MainLayout title="Korisnici i ovlasti" subtitle="Upravljanje korisničkim računima i ulogama">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usersWithAccounts.length}</p>
                  <p className="text-xs text-muted-foreground">Korisnici s računom</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <ShieldCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {userRoles?.filter(r => r.role === 'admin').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Administratori</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <UserPlus className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{usersWithoutAccounts.length}</p>
                  <p className="text-xs text-muted-foreground">Zaposlenici bez računa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users with accounts */}
        <Card>
          <CardHeader>
            <CardTitle>Korisnici s računom</CardTitle>
            <CardDescription>Zaposlenici koji imaju pristup aplikaciji</CardDescription>
          </CardHeader>
          <CardContent>
            {usersWithAccounts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nema zaposlenika s korisničkim računom
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Odjel</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithAccounts.map((employee) => {
                    const isAdmin = isUserAdmin(employee.auth_user_id);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.first_name} {employee.last_name}
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={isAdmin ? 'default' : 'secondary'}>
                            <Shield className="h-3 w-3 mr-1" />
                            {isAdmin ? 'Admin' : 'Korisnik'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'active' ? 'outline' : 'secondary'}>
                            {employee.status === 'active' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Aktivan</>
                            ) : (
                              <><Ban className="h-3 w-3 mr-1" /> Neaktivan</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => toggleAdminMutation.mutate({ 
                                  userId: employee.auth_user_id!, 
                                  isAdmin 
                                })}
                                disabled={toggleAdminMutation.isPending}
                              >
                                {isAdmin ? (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Ukloni admin ulogu
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    Dodijeli admin ulogu
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openResetDialog(employee)}>
                                <Key className="h-4 w-4 mr-2" />
                                Resetiraj lozinku
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Employees without accounts */}
        {usersWithoutAccounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Zaposlenici bez računa</CardTitle>
              <CardDescription>
                Zaposlenici koji još nemaju pristup aplikaciji. 
                Kreirajte im račun na stranici zaposlenika.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ime i prezime</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Odjel</TableHead>
                    <TableHead>Pozicija</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersWithoutAccounts.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell>{employee.email || '-'}</TableCell>
                      <TableCell>{employee.department || '-'}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) closeResetDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetiraj lozinku</DialogTitle>
            <DialogDescription>
              {resetTarget && (
                <>Postavite novu lozinku za {resetTarget.first_name} {resetTarget.last_name}.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {resetError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="adminResetPassword">Nova lozinka</Label>
              <div className="flex gap-2">
                <Input
                  id="adminResetPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Unesite novu lozinku"
                />
                <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generiraj lozinku">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminResetConfirm">Potvrdite lozinku</Label>
              <Input
                id="adminResetConfirm"
                type="text"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ponovite lozinku"
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Najmanje 10 znakova, jedno veliko slovo, jedno malo slovo i jedan broj.
              Zabilježite lozinku i proslijedite je korisniku na siguran način.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeResetDialog} disabled={isResetting}>
              Odustani
            </Button>
            <Button onClick={handleResetPassword} disabled={isResetting}>
              {isResetting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetiranje...</>
              ) : (
                <><Key className="h-4 w-4 mr-2" /> Resetiraj lozinku</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminUsers;
