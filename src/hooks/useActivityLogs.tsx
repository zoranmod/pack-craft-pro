import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useCurrentEmployee } from './useCurrentEmployee';
import type { Json } from '@/integrations/supabase/types';

export interface ActivityLog {
  id: string;
  user_id: string;
  employee_id: string | null;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Json | null;
  created_at: string;
  employee?: {
    first_name: string;
    last_name: string;
  } | null;
  user_profile?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface CreateActivityLogData {
  action_type: string;
  entity_type: string;
  entity_id?: string;
  entity_name?: string;
  details?: Json;
}

// Action types
export const ACTION_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VIEW: 'view',
  APPROVE: 'approve',
  REJECT: 'reject',
} as const;

// Entity types
export const ENTITY_TYPES = {
  DOCUMENT: 'document',
  CLIENT: 'client',
  ARTICLE: 'article',
  EMPLOYEE: 'employee',
  LEAVE_REQUEST: 'leave_request',
  SICK_LEAVE: 'sick_leave',
  WORK_CLOTHING: 'work_clothing',
  SETTINGS: 'settings',
} as const;

// Croatian translations
export const ACTION_LABELS: Record<string, string> = {
  create: 'kreirao/la',
  update: 'uredio/la',
  delete: 'obrisao/la',
  view: 'pregledao/la',
  approve: 'odobrio/la',
  reject: 'odbio/la',
};

export const ENTITY_LABELS: Record<string, string> = {
  document: 'dokument',
  client: 'klijenta',
  article: 'artikl',
  employee: 'zaposlenika',
  leave_request: 'zahtjev za godišnji',
  sick_leave: 'bolovanje',
  work_clothing: 'radnu odjeću',
  settings: 'postavke',
};

export function useActivityLogs(limit = 50) {
  const { user } = useAuth();
  const { employee, hasFullAccess } = useCurrentEmployee();

  return useQuery({
    queryKey: ['activity-logs', limit],
    queryFn: async (): Promise<ActivityLog[]> => {
      // Get the owner's user_id for admin employees
      let ownerUserId = user?.id;
      
      if (employee && hasFullAccess) {
        const { data: empData } = await supabase
          .from('employees')
          .select('user_id')
          .eq('id', employee.id)
          .single();
        
        if (empData) {
          ownerUserId = empData.user_id;
        }
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .eq('user_id', ownerUserId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Fetch user profile for owner name
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', ownerUserId)
        .maybeSingle();

      // Attach user profile to logs without employee
      return (data || []).map(log => ({
        ...log,
        user_profile: !log.employee_id ? userProfile : null,
      })) as ActivityLog[];
    },
    enabled: !!user,
  });
}

export function useLogActivity() {
  const { user } = useAuth();
  const { employee, hasFullAccess } = useCurrentEmployee();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateActivityLogData) => {
      if (!user) throw new Error('User not authenticated');

      // Get the owner's user_id for admin employees
      let ownerUserId = user.id;
      
      if (employee && hasFullAccess) {
        const { data: empData } = await supabase
          .from('employees')
          .select('user_id')
          .eq('id', employee.id)
          .single();
        
        if (empData) {
          ownerUserId = empData.user_id;
        }
      }

      const insertData = {
        user_id: ownerUserId,
        employee_id: employee?.id || null,
        action_type: data.action_type,
        entity_type: data.entity_type,
        entity_id: data.entity_id || null,
        entity_name: data.entity_name || null,
        details: data.details || null,
      };

      const { error } = await supabase
        .from('activity_logs')
        .insert([insertData]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
}

// Helper function to format activity message
export function formatActivityMessage(log: ActivityLog): string {
  let actorName = 'Korisnik';
  
  if (log.employee) {
    actorName = `${log.employee.first_name} ${log.employee.last_name}`;
  } else if (log.user_profile?.first_name || log.user_profile?.last_name) {
    actorName = `${log.user_profile.first_name || ''} ${log.user_profile.last_name || ''}`.trim();
  }
  
  const action = ACTION_LABELS[log.action_type] || log.action_type;
  const entity = ENTITY_LABELS[log.entity_type] || log.entity_type;
  const entityName = log.entity_name ? ` "${log.entity_name}"` : '';

  return `${actorName} je ${action} ${entity}${entityName}`;
}
