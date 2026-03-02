import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApartmentAuth } from '@/hooks/useApartmentAuth';
import { Loader2 } from 'lucide-react';

export function ApartmentProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, hasAccess } = useApartmentAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return <Navigate to="/apartmani/login" replace />;
  }

  return <>{children}</>;
}
