import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { addDays, format, isBefore, isToday, startOfDay } from 'date-fns';

export interface Reminder {
  id: string;
  userId: string;
  documentId: string | null;
  reminderType: string;
  title: string;
  description: string | null;
  dueDate: string;
  isSent: boolean;
  isDismissed: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined data
  documentNumber?: string;
  documentType?: string;
}

interface CreateReminderData {
  documentId?: string;
  reminderType: string;
  title: string;
  description?: string;
  dueDate: string;
}

function mapDbToReminder(row: any): Reminder {
  return {
    id: row.id,
    userId: row.user_id,
    documentId: row.document_id,
    reminderType: row.reminder_type,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    isSent: row.is_sent,
    isDismissed: row.is_dismissed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    documentNumber: row.documents?.number,
    documentType: row.documents?.type,
  };
}

export function useReminders(options?: { includeAll?: boolean }) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reminders', user?.id, options?.includeAll],
    queryFn: async (): Promise<Reminder[]> => {
      if (!user) return [];

      let query = supabase
        .from('reminders')
        .select(`
          *,
          documents:document_id (number, type)
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      // By default, only show active (not dismissed) reminders
      if (!options?.includeAll) {
        query = query.eq('is_dismissed', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(mapDbToReminder);
    },
    enabled: !!user,
  });
}

export function useUpcomingReminders(daysAhead: number = 7) {
  const { user } = useAuth();
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
  const futureDate = format(addDays(new Date(), daysAhead), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['reminders-upcoming', user?.id, daysAhead],
    queryFn: async (): Promise<Reminder[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          documents:document_id (number, type)
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .gte('due_date', today)
        .lte('due_date', futureDate)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToReminder);
    },
    enabled: !!user,
  });
}

export function useOverdueReminders() {
  const { user } = useAuth();
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['reminders-overdue', user?.id],
    queryFn: async (): Promise<Reminder[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          documents:document_id (number, type)
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return (data || []).map(mapDbToReminder);
    },
    enabled: !!user,
  });
}

export function useCreateReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReminderData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: reminder, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user.id,
          document_id: data.documentId || null,
          reminder_type: data.reminderType,
          title: data.title,
          description: data.description || null,
          due_date: data.dueDate,
        })
        .select()
        .single();

      if (error) throw error;
      return reminder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-overdue'] });
    },
  });
}

export function useDismissReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({ is_dismissed: true })
        .eq('id', reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-overdue'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reminderId: string) => {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['reminders-overdue'] });
    },
  });
}
