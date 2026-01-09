import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle
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
    </MainLayout>
  );
};

export default AdminUsers;
