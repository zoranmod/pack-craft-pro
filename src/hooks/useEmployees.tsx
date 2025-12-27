import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { 
  Employee, 
  EmployeeLeaveEntitlement, 
  EmployeeLeaveRequest, 
  EmployeeSickLeave, 
  EmployeeWorkClothing, 
  EmployeeDocument 
} from '@/types/employee';

export function useEmployees() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('last_name', { ascending: true });
      if (error) throw error;
      return data as Employee[];
    },
    enabled: !!user?.id,
  });

  const createEmployee = useMutation({
    mutationFn: async (employee: Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Korisnik nije prijavljen');
      const { data, error } = await supabase
        .from('employees')
        .insert({ ...employee, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Zaposlenik uspješno dodan');
    },
    onError: (error) => {
      toast.error('Greška pri dodavanju zaposlenika: ' + error.message);
    },
  });

  const updateEmployee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Zaposlenik uspješno ažuriran');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju zaposlenika: ' + error.message);
    },
  });

  const deleteEmployee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employees').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Zaposlenik uspješno obrisan');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju zaposlenika: ' + error.message);
    },
  });

  return {
    employees: employeesQuery.data ?? [],
    isLoading: employeesQuery.isLoading,
    error: employeesQuery.error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

export function useEmployee(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .maybeSingle();
      if (error) throw error;
      return data as Employee | null;
    },
    enabled: !!employeeId,
  });
}

export function useLeaveEntitlements(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leave-entitlements', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_leave_entitlements')
        .select('*')
        .eq('employee_id', employeeId)
        .order('year', { ascending: false });
      if (error) throw error;
      return data as EmployeeLeaveEntitlement[];
    },
    enabled: !!employeeId,
  });

  const create = useMutation({
    mutationFn: async (entitlement: Omit<EmployeeLeaveEntitlement, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employee_leave_entitlements')
        .insert(entitlement)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-entitlements', employeeId] });
      toast.success('Pravo na godišnji dodano');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeLeaveEntitlement> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_leave_entitlements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-entitlements', employeeId] });
      toast.success('Pravo na godišnji ažurirano');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  return { entitlements: query.data ?? [], isLoading: query.isLoading, create, update };
}

export function useLeaveRequests(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leave-requests', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as EmployeeLeaveRequest[];
    },
    enabled: !!employeeId,
  });

  const create = useMutation({
    mutationFn: async (request: Omit<EmployeeLeaveRequest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employee_leave_requests')
        .insert(request)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['leave-entitlements', employeeId] });
      toast.success('Zahtjev za godišnji kreiran');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeLeaveRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['leave-entitlements', employeeId] });
      toast.success('Zahtjev ažuriran');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employee_leave_requests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests', employeeId] });
      toast.success('Zahtjev obrisan');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  return { requests: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

export function useSickLeaves(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sick-leaves', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_sick_leaves')
        .select('*')
        .eq('employee_id', employeeId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data as EmployeeSickLeave[];
    },
    enabled: !!employeeId,
  });

  const create = useMutation({
    mutationFn: async (sickLeave: Omit<EmployeeSickLeave, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employee_sick_leaves')
        .insert(sickLeave)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
      toast.success('Bolovanje dodano');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeSickLeave> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_sick_leaves')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
      toast.success('Bolovanje ažurirano');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employee_sick_leaves').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sick-leaves', employeeId] });
      toast.success('Bolovanje obrisano');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  return { sickLeaves: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

export function useWorkClothing(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['work-clothing', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_work_clothing')
        .select('*')
        .eq('employee_id', employeeId)
        .order('assigned_date', { ascending: false });
      if (error) throw error;
      return data as EmployeeWorkClothing[];
    },
    enabled: !!employeeId,
  });

  const create = useMutation({
    mutationFn: async (clothing: Omit<EmployeeWorkClothing, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employee_work_clothing')
        .insert(clothing)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-clothing', employeeId] });
      toast.success('Oprema dodana');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeWorkClothing> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_work_clothing')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-clothing', employeeId] });
      toast.success('Oprema ažurirana');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employee_work_clothing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-clothing', employeeId] });
      toast.success('Oprema obrisana');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  return { clothing: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}

export function useEmployeeDocuments(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['employee-documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmployeeDocument[];
    },
    enabled: !!employeeId,
  });

  const create = useMutation({
    mutationFn: async (doc: Omit<EmployeeDocument, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .insert(doc)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success('Dokument dodan');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeDocument> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success('Dokument ažuriran');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('employee_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents', employeeId] });
      toast.success('Dokument obrisan');
    },
    onError: (error) => {
      toast.error('Greška: ' + error.message);
    },
  });

  return { documents: query.data ?? [], isLoading: query.isLoading, create, update, remove };
}
