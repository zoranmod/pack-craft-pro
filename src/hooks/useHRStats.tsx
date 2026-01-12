import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerUserId } from '@/hooks/useOwnerUserId';
import { startOfDay, endOfDay, addDays, format, parseISO, differenceInDays } from 'date-fns';

interface HRStats {
  activeSickLeaves: number;
  upcomingLeaves: number;
  expiringDocuments: number;
  totalEmployees: number;
  employeesOnLeave: string[];
  employeesOnSickLeave: string[];
  expiringDocumentsList: Array<{
    employeeName: string;
    documentName: string;
    expiryDate: string;
    daysUntilExpiry: number;
  }>;
}

export function useHRStats() {
  const { user } = useAuth();
  const ownerUserId = useOwnerUserId();
  const effectiveUserId = ownerUserId || user?.id;

  return useQuery({
    queryKey: ['hr-stats', effectiveUserId],
    queryFn: async (): Promise<HRStats> => {
      if (!effectiveUserId) {
        return {
          activeSickLeaves: 0,
          upcomingLeaves: 0,
          expiringDocuments: 0,
          totalEmployees: 0,
          employeesOnLeave: [],
          employeesOnSickLeave: [],
          expiringDocumentsList: [],
        };
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      const twoWeeksFromNow = format(addDays(new Date(), 14), 'yyyy-MM-dd');
      const oneMonthFromNow = format(addDays(new Date(), 30), 'yyyy-MM-dd');

      // Fetch active sick leaves
      const { data: sickLeaves } = await supabase
        .from('employee_sick_leaves')
        .select(`
          id,
          start_date,
          end_date,
          employees!inner (first_name, last_name, user_id)
        `)
        .eq('employees.user_id', effectiveUserId)
        .lte('start_date', today)
        .or(`end_date.gte.${today},end_date.is.null`);

      // Fetch upcoming leave requests
      const { data: leaveRequests } = await supabase
        .from('employee_leave_requests')
        .select(`
          id,
          start_date,
          end_date,
          status,
          employees!inner (first_name, last_name, user_id)
        `)
        .eq('employees.user_id', effectiveUserId)
        .eq('status', 'approved')
        .gte('start_date', today)
        .lte('start_date', twoWeeksFromNow)
        .is('deleted_at', null);

      // Fetch expiring employee documents
      const { data: expiringDocs } = await supabase
        .from('employee_documents')
        .select(`
          id,
          document_name,
          expiry_date,
          employees!inner (first_name, last_name, user_id)
        `)
        .eq('employees.user_id', effectiveUserId)
        .gte('expiry_date', today)
        .lte('expiry_date', oneMonthFromNow)
        .order('expiry_date', { ascending: true });

      // Fetch total employees
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', effectiveUserId)
        .eq('status', 'active')
        .is('deleted_at', null);

      const employeesOnSickLeave = (sickLeaves || []).map(sl => 
        `${(sl.employees as any).first_name} ${(sl.employees as any).last_name}`
      );

      const employeesOnLeave = (leaveRequests || []).map(lr => 
        `${(lr.employees as any).first_name} ${(lr.employees as any).last_name}`
      );

      const expiringDocumentsList = (expiringDocs || []).map(doc => ({
        employeeName: `${(doc.employees as any).first_name} ${(doc.employees as any).last_name}`,
        documentName: doc.document_name,
        expiryDate: doc.expiry_date!,
        daysUntilExpiry: differenceInDays(parseISO(doc.expiry_date!), new Date()),
      }));

      return {
        activeSickLeaves: sickLeaves?.length || 0,
        upcomingLeaves: leaveRequests?.length || 0,
        expiringDocuments: expiringDocs?.length || 0,
        totalEmployees: employeeCount || 0,
        employeesOnLeave,
        employeesOnSickLeave,
        expiringDocumentsList,
      };
    },
    enabled: !!effectiveUserId,
    staleTime: 60000, // 1 minute
  });
}
