import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Employee } from '@/types/employee';

interface EmployeePermissions {
  can_view_documents: boolean;
  can_create_documents: boolean;
  can_edit_documents: boolean;
  can_manage_employees: boolean;
  can_request_leave: boolean;
  can_approve_leave: boolean;
  can_request_sick_leave: boolean;
  can_view_work_clothing: boolean;
  can_view_articles: boolean;
  can_edit_articles: boolean;
  can_view_clients: boolean;
  can_edit_clients: boolean;
  can_view_settings: boolean;
  can_edit_settings: boolean;
}

interface CurrentEmployeeData {
  employee: Employee | null;
  permissions: EmployeePermissions | null;
  isAdmin: boolean;
}

export function useCurrentEmployee() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['current-employee', user?.id],
    queryFn: async (): Promise<CurrentEmployeeData> => {
      if (!user) return { employee: null, permissions: null, isAdmin: false };

      // Check if user is admin (has role 'admin' or owns employees)
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const isAdmin = roles?.some(r => r.role === 'admin') || false;

      // Check if this user is an employee (has auth_user_id linked)
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (empError) throw empError;

      if (!employee) {
        return { employee: null, permissions: null, isAdmin };
      }

      // Get employee permissions
      const { data: permissions, error: permError } = await supabase
        .from('employee_permissions')
        .select('*')
        .eq('employee_id', employee.id)
        .maybeSingle();

      if (permError) throw permError;

      return {
        employee: employee as Employee,
        permissions: permissions as EmployeePermissions | null,
        isAdmin,
      };
    },
    enabled: !!user,
  });

  const hasFullAccess = data?.isAdmin || data?.permissions?.can_manage_employees || false;

  return {
    employee: data?.employee ?? null,
    permissions: data?.permissions ?? null,
    isAdmin: data?.isAdmin ?? false,
    isLoading,
    error,
    isEmployee: !!data?.employee,
    hasFullAccess,
  };
}
