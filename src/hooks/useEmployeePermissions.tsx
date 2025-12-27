import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { EmployeePermissions } from '@/types/employee';

export function useEmployeePermissions(employeeId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['employee-permissions', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      const { data, error } = await supabase
        .from('employee_permissions')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();
      if (error) throw error;
      return data as EmployeePermissions | null;
    },
    enabled: !!employeeId,
  });

  const upsert = useMutation({
    mutationFn: async (permissions: Partial<EmployeePermissions> & { employee_id: string }) => {
      // First check if permissions exist
      const { data: existing } = await supabase
        .from('employee_permissions')
        .select('id')
        .eq('employee_id', permissions.employee_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('employee_permissions')
          .update(permissions)
          .eq('employee_id', permissions.employee_id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('employee_permissions')
          .insert(permissions)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-permissions', employeeId] });
      toast.success('Dozvole uspješno ažurirane');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju dozvola: ' + error.message);
    },
  });

  return { permissions: query.data, isLoading: query.isLoading, upsert };
}

// Default permissions for new employees
export const defaultPermissions: Omit<EmployeePermissions, 'id' | 'employee_id' | 'created_at' | 'updated_at'> = {
  can_view_documents: false,
  can_create_documents: false,
  can_edit_documents: false,
  can_manage_employees: false,
  can_request_leave: true,
  can_approve_leave: false,
  can_request_sick_leave: true,
  can_view_work_clothing: true,
  can_view_articles: false,
  can_edit_articles: false,
  can_view_clients: false,
  can_edit_clients: false,
  can_view_settings: false,
  can_edit_settings: false,
};

// Predefined permission templates
export const permissionTemplates = {
  minimal: {
    name: 'Samo zahtjevi',
    description: 'Može samo slati zahtjeve za godišnji i bolovanje',
    permissions: {
      ...defaultPermissions,
    },
  },
  standard: {
    name: 'Standardni pristup',
    description: 'Može pregledavati dokumente, artikle i klijente',
    permissions: {
      ...defaultPermissions,
      can_view_documents: true,
      can_view_articles: true,
      can_view_clients: true,
    },
  },
  extended: {
    name: 'Prošireni pristup',
    description: 'Može kreirati dokumente i uređivati artikle',
    permissions: {
      ...defaultPermissions,
      can_view_documents: true,
      can_create_documents: true,
      can_edit_documents: true,
      can_view_articles: true,
      can_edit_articles: true,
      can_view_clients: true,
      can_edit_clients: true,
    },
  },
  full: {
    name: 'Puni pristup',
    description: 'Pristup svim funkcijama osim upravljanja zaposlenicima',
    permissions: {
      ...defaultPermissions,
      can_view_documents: true,
      can_create_documents: true,
      can_edit_documents: true,
      can_view_articles: true,
      can_edit_articles: true,
      can_view_clients: true,
      can_edit_clients: true,
      can_view_settings: true,
      can_approve_leave: true,
    },
  },
  admin: {
    name: 'Administrator',
    description: 'Pristup svim funkcijama uključujući upravljanje zaposlenicima',
    permissions: {
      can_view_documents: true,
      can_create_documents: true,
      can_edit_documents: true,
      can_manage_employees: true,
      can_request_leave: true,
      can_approve_leave: true,
      can_request_sick_leave: true,
      can_view_work_clothing: true,
      can_view_articles: true,
      can_edit_articles: true,
      can_view_clients: true,
      can_edit_clients: true,
      can_view_settings: true,
      can_edit_settings: true,
    },
  },
};
