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

  const ownerUserId = apartmentUser?.owner_user_id || user?.id || null;

  return {
    user,
    loading: loading || aptLoading,
    apartmentUser,
    ownerUserId,
    isApartmentUser: !!apartmentUser,
  };
}
