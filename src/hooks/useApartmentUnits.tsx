import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApartmentUnit } from '@/types/apartment';
import { toast } from 'sonner';

export function useApartmentUnits(ownerUserId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['apartment-units', ownerUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartment_units')
        .select('*')
        .eq('owner_user_id', ownerUserId!)
        .order('name');
      if (error) throw error;
      return data as ApartmentUnit[];
    },
    enabled: !!ownerUserId,
  });

  const upsert = useMutation({
    mutationFn: async (unit: Partial<ApartmentUnit> & { owner_user_id: string }) => {
      if (unit.id) {
        const { id, ...rest } = unit;
        const { error } = await supabase.from('apartment_units').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('apartment_units').insert({ name: unit.name || '', owner_user_id: unit.owner_user_id, unit_type: unit.unit_type, capacity: unit.capacity, price_per_person: unit.price_per_person, description: unit.description, is_active: unit.is_active });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-units'] });
      toast.success('Jedinica spremljena');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('apartment_units').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-units'] });
      toast.success('Jedinica obrisana');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { units: query.data || [], isLoading: query.isLoading, upsert, remove };
}
