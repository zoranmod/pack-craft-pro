import { supabase } from '@/integrations/supabase/client';
import { CalendarEventType } from '@/types/calendar';

interface DocumentEventData {
  documentId: string;
  documentNumber: string;
  documentType: string;
  deliveryDays?: number | null;
  clientName?: string;
  userId: string;
}

/**
 * Sync calendar events for a document based on its delivery_days
 * Creates/updates an 'isporuka' event X days from document date
 */
export async function syncDocumentCalendarEvents(data: DocumentEventData): Promise<void> {
  const { documentId, documentNumber, documentType, deliveryDays, userId } = data;

  // Only create events for certain document types with delivery days
  if (!deliveryDays || deliveryDays <= 0) {
    return;
  }

  // Calculate delivery date (from today + delivery_days)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

  // Determine event type based on document type
  let eventType: CalendarEventType = 'rok';
  let eventTitle = `Rok: ${documentNumber}`;

  if (documentType === 'nalog-dostava-montaza') {
    eventType = 'montaza';
    eventTitle = `Montaža: ${documentNumber}`;
  } else if (documentType === 'otpremnica') {
    eventType = 'isporuka';
    eventTitle = `Isporuka: ${documentNumber}`;
  }

  // Check if event already exists for this document and type
  const { data: existing } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('related_entity_type', documentType)
    .eq('related_entity_id', documentId)
    .eq('type', eventType)
    .is('deleted_at', null)
    .maybeSingle();

  const eventData = {
    user_id: userId,
    title: eventTitle,
    type: eventType,
    start_at: deliveryDate.toISOString(),
    all_day: true,
    related_entity_type: documentType,
    related_entity_id: documentId,
    created_by: userId,
  };

  if (existing) {
    // Update existing event
    await supabase
      .from('calendar_events')
      .update({
        title: eventTitle,
        start_at: deliveryDate.toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // Create new event
    await supabase
      .from('calendar_events')
      .insert(eventData);
  }
}

/**
 * Soft delete calendar events when a document is deleted
 */
export async function deleteDocumentCalendarEvents(
  documentId: string,
  documentType: string,
  userId: string
): Promise<void> {
  await supabase
    .from('calendar_events')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
    })
    .eq('related_entity_type', documentType)
    .eq('related_entity_id', documentId);
}
