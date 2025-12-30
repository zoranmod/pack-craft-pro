import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  oib: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  contact_person: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierData {
  name: string;
  oib?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
  notes?: string;
}

export function useSuppliers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suppliers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('dobavljaci')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (supplierData: CreateSupplierData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('dobavljaci')
        .insert({
          ...supplierData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Dobavljač kreiran',
        description: 'Novi dobavljač je uspješno dodan.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Greška',
        description: 'Nije moguće kreirati dobavljača.',
        variant: 'destructive',
      });
      console.error('Error creating supplier:', error);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...supplierData }: CreateSupplierData & { id: string }) => {
      const { data, error } = await supabase
        .from('dobavljaci')
        .update(supplierData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Dobavljač ažuriran',
        description: 'Podaci dobavljača su uspješno ažurirani.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Greška',
        description: 'Nije moguće ažurirati dobavljača.',
        variant: 'destructive',
      });
      console.error('Error updating supplier:', error);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dobavljaci')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: 'Dobavljač obrisan',
        description: 'Dobavljač je uspješno obrisan.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Greška',
        description: 'Nije moguće obrisati dobavljača.',
        variant: 'destructive',
      });
      console.error('Error deleting supplier:', error);
    },
  });
}
