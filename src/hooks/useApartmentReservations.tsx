import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApartmentReservation } from '@/types/apartment';
import { toast } from 'sonner';

export function useApartmentReservations(ownerUserId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['apartment-reservations', ownerUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartment_reservations')
        .select('*, unit:apartment_units(*), guest:apartment_guests(*)')
        .eq('owner_user_id', ownerUserId!)
        .order('check_in', { ascending: false });
      if (error) throw error;
      return data as ApartmentReservation[];
    },
    enabled: !!ownerUserId,
  });

  const upsert = useMutation({
    mutationFn: async (res: Partial<ApartmentReservation> & { owner_user_id: string }) => {
      const { unit, guest, id, ...data } = res as any;
      if (id) {
        const { error } = await supabase.from('apartment_reservations').update(data).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('apartment_reservations').insert(data as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-reservations'] });
      toast.success('Rezervacija spremljena');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('apartment_reservations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-reservations'] });
      toast.success('Rezervacija obrisana');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { reservations: query.data || [], isLoading: query.isLoading, upsert, remove };
}
