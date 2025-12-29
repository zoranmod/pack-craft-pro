import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LogIn, 
  Loader2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { EmployeePortalDashboard } from '@/components/employee-portal/EmployeePortalDashboard';

export default function EmployeePortal() {
  const { user, loading: authLoading } = useAuth();
  const { employee, permissions, isLoading: employeeLoading, isEmployee, hasFullAccess } = useCurrentEmployee();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect admin employees to main application
  useEffect(() => {
    if (user && isEmployee && hasFullAccess) {
      navigate('/');
    }
  }, [user, isEmployee, hasFullAccess, navigate]);

  // If user is logged in but not an employee, show message
  const isLoggedInButNotEmployee = user && !employeeLoading && !isEmployee;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Greška pri prijavi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Show loading while checking auth state
  if (authLoading || (user && employeeLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show dashboard if logged in as employee
  if (user && isEmployee && employee && permissions) {
    return <EmployeePortalDashboard employee={employee} permissions={permissions} onLogout={handleLogout} />;
  }

  // Show message if logged in but not an employee
  if (isLoggedInButNotEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Pristup odbijen</CardTitle>
            <CardDescription>
              Vaš račun nije povezan s profilom zaposlenika.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Kontaktirajte administratora kako bi vam omogućio pristup portalu za zaposlenike.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout} className="flex-1">
                Odjavi se
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                Idi na početnu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Portal za zaposlenike</CardTitle>
          <CardDescription>
            Prijavite se za pristup vašem radnom prostoru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Prijava...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Prijavi se
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
