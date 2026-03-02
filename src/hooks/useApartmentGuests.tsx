import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApartmentGuest } from '@/types/apartment';
import { toast } from 'sonner';

export function useApartmentGuests(ownerUserId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['apartment-guests', ownerUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartment_guests')
        .select('*')
        .eq('owner_user_id', ownerUserId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ApartmentGuest[];
    },
    enabled: !!ownerUserId,
  });

  const upsert = useMutation({
    mutationFn: async (guest: Partial<ApartmentGuest> & { owner_user_id: string }) => {
      if (guest.id) {
        const { id, ...rest } = guest;
        const { error } = await supabase.from('apartment_guests').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { id, ...rest } = guest;
        const { error } = await supabase.from('apartment_guests').insert(rest as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-guests'] });
      toast.success('Gost spremljen');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('apartment_guests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-guests'] });
      toast.success('Gost obrisan');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { guests: query.data || [], isLoading: query.isLoading, upsert, remove };
}
