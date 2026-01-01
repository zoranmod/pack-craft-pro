import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface LeaveRequestWithEmployee {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  leave_type: string;
  status: string;
  reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  deleted_by?: string;
  employee_name: string;
  employee_first_name: string;
  employee_last_name: string;
}

export function useAllLeaveRequests(filters?: {
  year?: number;
  status?: string;
  leaveType?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-leave-requests', user?.id, filters],
    queryFn: async (): Promise<LeaveRequestWithEmployee[]> => {
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

      // Get leave requests
      let query = supabase
        .from('employee_leave_requests')
        .select('*')
        .is('deleted_at', null)
        .order('start_date', { ascending: false });

      // Apply filters
      if (filters?.year) {
        const yearStart = `${filters.year}-01-01`;
        const yearEnd = `${filters.year}-12-31`;
        query = query.gte('start_date', yearStart).lte('start_date', yearEnd);
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters?.leaveType && filters.leaveType !== 'all') {
        query = query.eq('leave_type', filters.leaveType);
      }

      const { data, error } = await query;
      if (error) throw error;

      let results = (data || []).map(request => {
        const emp = employeeMap.get(request.employee_id);
        return {
          ...request,
          employee_first_name: emp?.first_name || '',
          employee_last_name: emp?.last_name || '',
          employee_name: emp ? `${emp.first_name} ${emp.last_name}` : 'Nepoznat',
        };
      });

      // Apply search filter
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        results = results.filter(r =>
          r.employee_name.toLowerCase().includes(searchLower)
        );
      }

      return results;
    },
    enabled: !!user,
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      start_date: string;
      end_date: string;
      days_requested: number;
      leave_type: string;
      reason?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('employee_leave_requests')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Godišnji odmor uspješno dodan.');
    },
    onError: (error) => {
      toast.error('Greška pri dodavanju: ' + error.message);
    },
  });
}

export function useUpdateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      start_date?: string;
      end_date?: string;
      days_requested?: number;
      leave_type?: string;
      status?: string;
      reason?: string;
      approved_by?: string;
      approved_at?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('employee_leave_requests')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast.success('Godišnji odmor ažuriran.');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju: ' + error.message);
    },
  });
}

export function useDeleteLeaveRequest() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('employee_leave_requests')
        .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success('Godišnji odmor obrisan.');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju: ' + error.message);
    },
  });
}

// Get today's absences
export function useTodayAbsences() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['today-absences', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('employee_leave_requests')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

// Get this week's absences
export function useWeekAbsences() {
  const { user } = useAuth();
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Monday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday

  return useQuery({
    queryKey: ['week-absences', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('employee_leave_requests')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .eq('status', 'approved')
        .lte('start_date', weekEnd.toISOString().split('T')[0])
        .gte('end_date', weekStart.toISOString().split('T')[0]);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}

// Get this month's planned absences
export function useMonthPlanned() {
  const { user } = useAuth();
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return useQuery({
    queryKey: ['month-planned', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('employee_leave_requests')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)
        .in('status', ['approved', 'pending'])
        .lte('start_date', monthEnd.toISOString().split('T')[0])
        .gte('end_date', monthStart.toISOString().split('T')[0]);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });
}
