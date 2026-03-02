import { useAuth } from './useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApartmentUser } from '@/types/apartment';

export function useApartmentAuth() {
  const { user, loading } = useAuth();

  const { data: apartmentUser, isLoading: aptLoading } = useQuery({
    queryKey: ['apartment-user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('apartment_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as ApartmentUser | null;
    },
    enabled: !!user?.id,
  });

  // Any authenticated user who is NOT an apartment_users sub-user is considered an owner
  // They can always access the apartment portal with their own user_id as owner_user_id
  const isOwner = !!user && !apartmentUser;

  const ownerUserId = apartmentUser?.owner_user_id || user?.id || null;
  const hasAccess = !!apartmentUser || isOwner;

  return {
    user,
    loading: loading || aptLoading,
    apartmentUser,
    ownerUserId,
    isApartmentUser: !!apartmentUser,
    isOwner: !!isOwner,
    hasAccess,
  };
}
