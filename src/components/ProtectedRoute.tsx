import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const { isLoading: employeeLoading, isEmployee, hasFullAccess } = useCurrentEmployee();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const isBlocking = loading || (user && employeeLoading);
    if (!isBlocking) {
      setTimedOut(false);
      return;
    }

    const t = window.setTimeout(() => setTimedOut(true), 12000);
    return () => window.clearTimeout(t);
  }, [loading, user, employeeLoading]);

  if (loading || (user && employeeLoading)) {
    if (timedOut) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="text-lg font-semibold">Učitavanje traje predugo</div>
            <p className="text-sm text-muted-foreground">
              Molimo osvježite stranicu. Ako se ponavlja, odjavite se i ponovno prijavite.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Osvježi
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/auth';
                }}
              >
                Odjavi se
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is an employee without full access, redirect to employee portal
  if (isEmployee && !hasFullAccess) {
    return <Navigate to="/employee-portal" replace />;
  }

  return <>{children}</>;
}
