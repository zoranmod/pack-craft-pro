import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { addDays, isPast, isBefore } from 'date-fns';

export interface WorkClothingWithEmployee {
  id: string;
  employee_id: string;
  item_name: string;
  size?: string;
  quantity: number;
  assigned_date: string;
  return_date?: string;
  condition: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
  employee_name: string;
  employee_first_name: string;
  employee_last_name: string;
  next_replacement_at?: string;
  status: 'ok' | 'soon' | 'overdue';
}

export function useAllWorkClothing(filters?: {
  itemType?: string;
  status?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-work-clothing', user?.id, filters],
    queryFn: async (): Promise<WorkClothingWithEmployee[]> => {
      if (!user) return [];

      // First get employees to join with
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .is('deleted_at', null);

      if (empError) throw empError;

      const employeeMap = new Map(
        employees?.map(e => [e.id, { first_name: e.first_name, last_name: e.last_name }]) || []
      );

      // Get work clothing
      let query = supabase
        .from('employee_work_clothing')
        .select('*')
        .is('deleted_at', null)
        .order('assigned_date', { ascending: false });

      if (filters?.itemType && filters.itemType !== 'all') {
        query = query.eq('item_name', filters.itemType);
      }

      const { data, error } = await query;
      if (error) throw error;

      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);

      let results = (data || []).map(item => {
        const emp = employeeMap.get(item.employee_id);
        
        // Calculate next replacement date (default 1 year from assigned date if not returned)
        let next_replacement_at: string | undefined;
        if (!item.return_date) {
          const assignedDate = new Date(item.assigned_date);
          next_replacement_at = addDays(assignedDate, 365).toISOString().split('T')[0];
        }

        // Calculate status
        let status: 'ok' | 'soon' | 'overdue' = 'ok';
        if (next_replacement_at) {
          const replacementDate = new Date(next_replacement_at);
          if (isPast(replacementDate)) {
            status = 'overdue';
          } else if (isBefore(replacementDate, thirtyDaysFromNow)) {
            status = 'soon';
          }
        }

        return {
          ...item,
          employee_first_name: emp?.first_name || '',
          employee_last_name: emp?.last_name || '',
          employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Nepoznat',
          next_replacement_at,
          status,
        };
      });

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(r =>
          r.employee_name.toLowerCase().includes(searchLower) ||
          r.item_name.toLowerCase().includes(searchLower)
        );
      }

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        results = results.filter(r => r.status === filters.status);
      }

      return results;
    },
    enabled: !!user,
  });
}

export function useCreateWorkClothing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      item_name: string;
      size?: string;
      quantity: number;
      assigned_date: string;
      condition: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('employee_work_clothing')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-work-clothing'] });
      queryClient.invalidateQueries({ queryKey: ['work-clothing'] });
      toast.success('Radna odjeća uspješno dodana.');
    },
    onError: (error) => {
      toast.error('Greška pri dodavanju: ' + error.message);
    },
  });
}

export function useUpdateWorkClothing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      item_name?: string;
      size?: string;
      quantity?: number;
      assigned_date?: string;
      return_date?: string;
      condition?: string;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('employee_work_clothing')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-work-clothing'] });
      queryClient.invalidateQueries({ queryKey: ['work-clothing'] });
      toast.success('Radna odjeća ažurirana.');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju: ' + error.message);
    },
  });
}

export function useDeleteWorkClothing() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('employee_work_clothing')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-work-clothing'] });
      queryClient.invalidateQueries({ queryKey: ['work-clothing'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Radna odjeća obrisana.');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju: ' + error.message);
    },
  });
}

// Get unique item types for filters
export function useItemTypes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['item-types', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('employee_work_clothing')
        .select('item_name')
        .is('deleted_at', null);

      if (error) throw error;

      const uniqueTypes = [...new Set(data?.map(d => d.item_name) || [])];
      return uniqueTypes.sort();
    },
    enabled: !!user,
  });
}
