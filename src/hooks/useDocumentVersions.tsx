import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLogs';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  user_id: string;
  snapshot: Record<string, any>;
  items_snapshot: Record<string, any>[];
  created_at: string;
  note: string | null;
}

export function useDocumentVersions(documentId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      if (!documentId) return [];

      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      return (data || []) as DocumentVersion[];
    },
    enabled: !!user && !!documentId,
  });
}

export function useRestoreDocumentVersion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ version }: { version: DocumentVersion }) => {
      if (!user) throw new Error('Not authenticated');

      const snapshot = version.snapshot;
      const items = version.items_snapshot;

      // Update document with snapshot data
      const { error: docError } = await supabase
        .from('documents')
        .update({
          client_name: snapshot.client_name,
          client_address: snapshot.client_address,
          client_phone: snapshot.client_phone,
          client_email: snapshot.client_email,
          client_oib: snapshot.client_oib,
          notes: snapshot.notes,
          total_amount: snapshot.total_amount,
          template_id: snapshot.template_id,
          payment_method: snapshot.payment_method,
          validity_days: snapshot.validity_days,
          delivery_days: snapshot.delivery_days,
          prepared_by: snapshot.prepared_by,
          contact_person: snapshot.contact_person,
          delivery_address: snapshot.delivery_address,
          monter1: snapshot.monter1,
          monter2: snapshot.monter2,
          custom_html_content: snapshot.custom_html_content,
          supplier_name: snapshot.supplier_name,
          supplier_address: snapshot.supplier_address,
          supplier_oib: snapshot.supplier_oib,
          supplier_contact: snapshot.supplier_contact,
          pickup_date: snapshot.pickup_date,
          received_by: snapshot.received_by,
          company_representative: snapshot.company_representative,
        })
        .eq('id', version.document_id);

      if (docError) throw docError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('document_items')
        .delete()
        .eq('document_id', version.document_id);

      if (deleteError) throw deleteError;

      // Insert snapshot items
      if (items && items.length > 0) {
        const itemsToInsert = items.map((item: any) => ({
          document_id: version.document_id,
          name: item.name,
          code: item.code || null,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          discount: item.discount,
          pdv: item.pdv,
          subtotal: item.subtotal,
          total: item.total,
          invoice_number: item.invoice_number || null,
        }));

        const { error: itemsError } = await supabase
          .from('document_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return version;
    },
    onSuccess: (version) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', version.document_id] });
      queryClient.invalidateQueries({ queryKey: ['document-versions', version.document_id] });
      toast.success(`Dokument vraćen na verziju ${version.version_number}`);

      logActivity.mutate({
        action_type: 'update',
        entity_type: 'document',
        entity_id: version.document_id,
        entity_name: `Vraćeno na v${version.version_number}`,
      });
    },
    onError: (error) => {
      toast.error('Greška pri vraćanju verzije: ' + error.message);
    },
  });
}
