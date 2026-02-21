import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Document, DocumentType } from '@/types/document';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLogs';

interface ClientOverride {
  clientName: string;
  clientAddress: string;
  clientOib?: string;
  clientPhone?: string;
  clientEmail?: string;
}

const generateDocumentNumber = async (type: DocumentType): Promise<string> => {
  const prefixes: Record<DocumentType, string> = {
    'otpremnica': 'OTP',
    'ponuda': 'PON',
    'nalog-dostava-montaza': 'NDM',
    'racun': 'RAC',
    'ugovor': 'UGO',
    'ponuda-komarnici': 'PKO',
    'reklamacija': 'RZ',
  };
  const year = new Date().getFullYear();
  const yearSuffix = year.toString().slice(-2);
  const prefix = prefixes[type];
  const searchPattern = `${prefix}-%/${yearSuffix}`;

  const { data: existingDocs } = await supabase
    .from('documents')
    .select('number')
    .like('number', searchPattern)
    .order('number', { ascending: false })
    .limit(1);

  let nextNumber = 1;
  if (existingDocs && existingDocs.length > 0) {
    const match = existingDocs[0].number.match(new RegExp(`^${prefix}-(\\d+)/${yearSuffix}$`));
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}-${nextNumber.toString().padStart(4, '0')}/${yearSuffix}`;
};

export function useCopyDocumentForClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({
      sourceDocument,
      clientOverride,
    }: {
      sourceDocument: Document;
      clientOverride: ClientOverride;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const totalAmount = sourceDocument.items.reduce((sum, item) => sum + item.total, 0);
      const documentNumber = await generateDocumentNumber(sourceDocument.type);

      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: sourceDocument.type,
          number: documentNumber,
          status: 'draft',
          client_name: clientOverride.clientName,
          client_oib: clientOverride.clientOib || null,
          client_address: clientOverride.clientAddress,
          client_phone: clientOverride.clientPhone || null,
          client_email: clientOverride.clientEmail || null,
          notes: sourceDocument.notes,
          total_amount: totalAmount,
          template_id: sourceDocument.templateId,
          payment_method: sourceDocument.paymentMethod,
          validity_days: sourceDocument.validityDays,
          delivery_days: sourceDocument.deliveryDays,
          prepared_by: sourceDocument.preparedBy,
          contact_person: sourceDocument.contactPerson,
          delivery_address: sourceDocument.deliveryAddress,
        })
        .select()
        .single();

      if (docError) throw docError;

      const itemsToInsert = sourceDocument.items.map(item => ({
        document_id: doc.id,
        name: item.name,
        code: item.code || null,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        discount: item.discount,
        pdv: item.pdv,
        subtotal: item.subtotal,
        total: item.total,
        invoice_number: item.invoiceNumber || null,
      }));

      const { error: itemsError } = await supabase
        .from('document_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      if (sourceDocument.type === 'ugovor' && sourceDocument.contractArticles?.length) {
        const articlesToInsert = sourceDocument.contractArticles.map(article => ({
          document_id: doc.id,
          article_number: article.articleNumber,
          title: article.title,
          content: article.content,
          sort_order: article.sortOrder,
        }));

        await supabase
          .from('document_contract_articles')
          .insert(articlesToInsert);
      }

      return doc;
    },
    onSuccess: (doc, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`Dokument kopiran za ${variables.clientOverride.clientName}! Novi broj: ${doc.number}`);

      logActivity.mutate({
        action_type: 'create',
        entity_type: 'document',
        entity_id: doc.id,
        entity_name: doc.number,
      });
    },
    onError: (error) => {
      toast.error('Greška pri kopiranju dokumenta: ' + error.message);
    },
  });
}
