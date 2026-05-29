import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOwnerUserId } from './useOwnerUserId';
import { toast } from 'sonner';

export type FurnitureComplaintStatus = 'otvoreno' | 'u_tijeku' | 'rijeseno';

export interface FurnitureComplaint {
  id: string;
  user_id: string;
  customer_name: string;
  customer_location: string | null;
  customer_phone: string | null;
  description: string | null;
  entry_date: string;
  deadline_date: string | null;
  status: FurnitureComplaintStatus;
  created_at: string;
  updated_at: string;
}

export type FurnitureComplaintInput = Omit<
  FurnitureComplaint,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export function useFurnitureComplaints() {
  const ownerId = useOwnerUserId();

  return useQuery({
    queryKey: ['furniture_complaints', ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('furniture_complaints')
        .select('*')
        .order('deadline_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data || []) as FurnitureComplaint[];
    },
  });
}

export function useSaveFurnitureComplaint() {
  const qc = useQueryClient();
  const ownerId = useOwnerUserId();

  return useMutation({
    mutationFn: async (input: FurnitureComplaintInput & { id?: string }) => {
      if (!ownerId) throw new Error('Nije moguće utvrditi vlasnika');
      if (input.id) {
        const { id, ...rest } = input;
        const { error } = await supabase
          .from('furniture_complaints')
          .update(rest)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('furniture_complaints')
          .insert({ ...input, user_id: ownerId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['furniture_complaints'] });
      toast.success('Reklamacija spremljena');
    },
    onError: (e: any) => toast.error(e.message || 'Greška pri spremanju'),
  });
}

export function useDeleteFurnitureComplaint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('furniture_complaints')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['furniture_complaints'] });
      toast.success('Reklamacija obrisana');
    },
    onError: (e: any) => toast.error(e.message || 'Greška pri brisanju'),
  });
}