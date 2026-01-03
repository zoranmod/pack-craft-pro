import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { CalendarEvent, CalendarEventType } from '@/types/calendar';
import { toast } from 'sonner';

interface CreateCalendarEventData {
  title: string;
  type: CalendarEventType;
  startAt: Date;
  endAt?: Date | null;
  allDay?: boolean;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  clientId?: string;
  employeeId?: string;
  location?: string;
}

interface UpdateCalendarEventData extends Partial<CreateCalendarEventData> {
  id: string;
}

const mapDbToEvent = (row: any): CalendarEvent => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  type: row.type as CalendarEventType,
  startAt: new Date(row.start_at),
  endAt: row.end_at ? new Date(row.end_at) : null,
  allDay: row.all_day,
  description: row.description,
  relatedEntityType: row.related_entity_type,
  relatedEntityId: row.related_entity_id,
  clientId: row.client_id,
  employeeId: row.employee_id,
  location: row.location,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useCalendarEvents(startDate?: Date, endDate?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['calendar-events', user?.id, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('calendar_events')
        .select('*')
        .is('deleted_at', null)
        .order('start_at', { ascending: true });

      if (startDate) {
        query = query.gte('start_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('start_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(mapDbToEvent);
    },
    enabled: !!user,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCalendarEventData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: event, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: data.title,
          type: data.type,
          start_at: data.startAt.toISOString(),
          end_at: data.endAt?.toISOString() || null,
          all_day: data.allDay ?? false,
          description: data.description || null,
          related_entity_type: data.relatedEntityType || null,
          related_entity_id: data.relatedEntityId || null,
          client_id: data.clientId || null,
          employee_id: data.employeeId || null,
          location: data.location || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Događaj uspješno kreiran!');
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju događaja: ' + error.message);
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCalendarEventData) => {
      const updateData: any = {};
      
      if (data.title !== undefined) updateData.title = data.title;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.startAt !== undefined) updateData.start_at = data.startAt.toISOString();
      if (data.endAt !== undefined) updateData.end_at = data.endAt?.toISOString() || null;
      if (data.allDay !== undefined) updateData.all_day = data.allDay;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.employeeId !== undefined) updateData.employee_id = data.employeeId;
      if (data.clientId !== undefined) updateData.client_id = data.clientId;

      const { data: event, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToEvent(event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Događaj uspješno ažuriran!');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju događaja: ' + error.message);
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
        })
        .eq('id', eventId);

      if (error) throw error;
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      toast.success('Događaj obrisan!');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju događaja: ' + error.message);
    },
  });
}

// Upsert calendar event from document
export function useUpsertDocumentEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      documentId: string;
      documentNumber: string;
      documentType: string;
      eventType: CalendarEventType;
      date: Date;
      clientName?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      // Check if event already exists
      const { data: existing } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('related_entity_type', data.documentType)
        .eq('related_entity_id', data.documentId)
        .eq('type', data.eventType)
        .is('deleted_at', null)
        .maybeSingle();

      const eventData = {
        user_id: user.id,
        title: `${data.eventType === 'montaza' ? 'Montaža' : data.eventType === 'isporuka' ? 'Isporuka' : 'Rok'}: ${data.documentNumber}`,
        type: data.eventType,
        start_at: data.date.toISOString(),
        all_day: true,
        related_entity_type: data.documentType,
        related_entity_id: data.documentId,
        created_by: user.id,
      };

      if (existing) {
        const { error } = await supabase
          .from('calendar_events')
          .update(eventData)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calendar_events')
          .insert(eventData);
        if (error) throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}
