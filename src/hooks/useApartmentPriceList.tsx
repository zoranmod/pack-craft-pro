import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ApartmentPriceEntry } from '@/types/apartment';
import { toast } from 'sonner';

export function useApartmentPriceList(ownerUserId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['apartment-price-list', ownerUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartment_price_list')
        .select('*')
        .eq('owner_user_id', ownerUserId!)
        .order('unit_type')
        .order('persons');
      if (error) throw error;
      return (data || []) as ApartmentPriceEntry[];
    },
    enabled: !!ownerUserId,
  });

  const upsert = useMutation({
    mutationFn: async (entry: Partial<ApartmentPriceEntry> & { owner_user_id: string }) => {
      const { id, ...data } = entry as any;
      if (id) {
        const { error } = await supabase.from('apartment_price_list').update(data).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('apartment_price_list').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartment-price-list'] });
      toast.success('Cjenik spremljen');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  /** Look up the flat nightly rate for a given unit_type + number of persons */
  function getPrice(unitType: 'apartment' | 'room', persons: number, withBreakfast: boolean): number {
    const entries = query.data || [];
    const entry = entries.find(e => e.unit_type === unitType && e.persons === persons);
    if (!entry) return 0;
    return withBreakfast ? Number(entry.price_with_breakfast) : Number(entry.price_without_breakfast);
  }

  return { priceList: query.data || [], isLoading: query.isLoading, upsert, getPrice };
}
