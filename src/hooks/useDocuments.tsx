import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Document, DocumentItem, DocumentType, DocumentStatus, DocumentContractArticle } from '@/types/document';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLogs';

export interface CreateDocumentData {
  type: DocumentType;
  clientName: string;
  clientOib?: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
  items: Omit<DocumentItem, 'id'>[];
  templateId?: string;
  paymentMethod?: string;
  validityDays?: number;
  deliveryDays?: number;
  preparedBy?: string;
  contactPerson?: string;
  deliveryAddress?: string;
}

// Convert database row to Document type
const mapDbToDocument = (row: any, items: any[], contractArticles?: any[]): Document => ({
  id: row.id,
  type: row.type as DocumentType,
  number: row.number,
  date: row.date,
  status: row.status as DocumentStatus,
  clientName: row.client_name,
  clientAddress: row.client_address,
  clientPhone: row.client_phone,
  clientEmail: row.client_email,
  clientOib: row.client_oib,
  templateId: row.template_id,
  paymentMethod: row.payment_method,
  validityDays: row.validity_days,
  deliveryDays: row.delivery_days,
  preparedBy: row.prepared_by,
  contactPerson: row.contact_person,
  deliveryAddress: row.delivery_address,
  items: items.map(item => ({
    id: item.id,
    name: item.name,
    quantity: Number(item.quantity),
    unit: item.unit,
    price: Number(item.price),
    discount: Number(item.discount),
    pdv: Number(item.pdv),
    subtotal: Number(item.subtotal),
    total: Number(item.total),
  })),
  notes: row.notes,
  totalAmount: Number(row.total_amount),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  contractArticles: contractArticles?.map(article => ({
    id: article.id,
    articleNumber: article.article_number,
    title: article.title,
    content: article.content,
    sortOrder: article.sort_order,
  })),
});

// Generate document number based on type with sequential counter
const generateDocumentNumber = async (type: DocumentType, userId: string): Promise<string> => {
  const prefixes: Record<DocumentType, string> = {
    'otpremnica': 'OTP',
    'ponuda': 'PON',
    'nalog-dostava-montaza': 'NDM',
    'racun': 'RAC',
    'ugovor': 'UGO',
  };
  const year = new Date().getFullYear();
  const prefix = `${prefixes[type]}-${year}-`;
  
  // Get the highest existing number for this type, year, and user
  const { data: existingDocs } = await supabase
    .from('documents')
    .select('number')
    .eq('user_id', userId)
    .like('number', `${prefix}%`)
    .order('number', { ascending: false })
    .limit(1);
  
  let nextNumber = 1;
  if (existingDocs && existingDocs.length > 0) {
    const lastNumber = existingDocs[0].number;
    const lastSequence = parseInt(lastNumber.replace(prefix, ''), 10);
    if (!isNaN(lastSequence)) {
      nextNumber = lastSequence + 1;
    }
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

export function useDocuments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!documents || documents.length === 0) return [];

      // Fetch all items at once instead of N+1 queries
      const documentIds = documents.map(doc => doc.id);
      const { data: allItems } = await supabase
        .from('document_items')
        .select('*')
        .in('document_id', documentIds);

      // Group items by document_id
      const itemsByDocId = (allItems || []).reduce((acc, item) => {
        if (!acc[item.document_id]) acc[item.document_id] = [];
        acc[item.document_id].push(item);
        return acc;
      }, {} as Record<string, typeof allItems>);

      return documents.map(doc => mapDbToDocument(doc, itemsByDocId[doc.id] || []));
    },
    enabled: !!user,
  });
}

export function useDocument(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      if (!user) return null;

      const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!doc) return null;

      const { data: items } = await supabase
        .from('document_items')
        .select('*')
        .eq('document_id', id);

      // Fetch contract articles if document is ugovor
      let contractArticles = undefined;
      if (doc.type === 'ugovor') {
        const { data: articles } = await supabase
          .from('document_contract_articles')
          .select('*')
          .eq('document_id', id)
          .order('sort_order', { ascending: true });
        contractArticles = articles || [];
      }

      return mapDbToDocument(doc, items || [], contractArticles);
    },
    enabled: !!user && !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (data: CreateDocumentData) => {
      if (!user) throw new Error('Not authenticated');

      const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0);

      // Generate sequential document number
      const documentNumber = await generateDocumentNumber(data.type, user.id);

      // Create document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: data.type,
          number: documentNumber,
          client_name: data.clientName,
          client_oib: data.clientOib,
          client_address: data.clientAddress,
          client_phone: data.clientPhone,
          client_email: data.clientEmail,
          notes: data.notes,
          total_amount: totalAmount,
          template_id: data.templateId,
          payment_method: data.paymentMethod,
          validity_days: data.validityDays,
          delivery_days: data.deliveryDays,
          prepared_by: data.preparedBy,
          contact_person: data.contactPerson,
          delivery_address: data.deliveryAddress,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create items
      const itemsToInsert = data.items.map(item => ({
        document_id: doc.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        discount: item.discount,
        pdv: item.pdv,
        subtotal: item.subtotal,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('document_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return doc;
    },
    onSuccess: (doc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument uspješno kreiran!');
      
      logActivity.mutate({
        action_type: 'create',
        entity_type: 'document',
        entity_id: doc.id,
        entity_name: doc.number,
      });
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju dokumenta: ' + error.message);
    },
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ id, status, number }: { id: string; status: DocumentStatus; number?: string }) => {
      const { error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return { id, status, number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Status dokumenta ažuriran');
      
      logActivity.mutate({
        action_type: 'update',
        entity_type: 'document',
        entity_id: data.id,
        entity_name: data.number || data.id,
      });
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju statusa: ' + error.message);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ id, number }: { id: string; number?: string }) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument obrisan');
      
      logActivity.mutate({
        action_type: 'delete',
        entity_type: 'document',
        entity_id: data.id,
        entity_name: data.number || data.id,
      });
    },
    onError: (error) => {
      toast.error('Greška pri brisanju dokumenta: ' + error.message);
    },
  });
}

// Hook for converting a document to the next type in the flow
export function useConvertDocument() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ 
      sourceDocument, 
      targetType 
    }: { 
      sourceDocument: Document; 
      targetType: DocumentType 
    }) => {
      if (!user) throw new Error('Not authenticated');

      const totalAmount = sourceDocument.items.reduce((sum, item) => sum + item.total, 0);

      // Generate sequential document number
      const documentNumber = await generateDocumentNumber(targetType, user.id);

      // Create new document with data from source
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: targetType,
          number: documentNumber,
          client_name: sourceDocument.clientName,
          client_oib: sourceDocument.clientOib,
          client_address: sourceDocument.clientAddress,
          client_phone: sourceDocument.clientPhone,
          client_email: sourceDocument.clientEmail,
          notes: sourceDocument.notes,
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Copy items
      const itemsToInsert = sourceDocument.items.map(item => ({
        document_id: doc.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        discount: item.discount,
        pdv: item.pdv,
        subtotal: item.subtotal,
        total: item.total,
      }));

      const { error: itemsError } = await supabase
        .from('document_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      return doc;
    },
    onSuccess: (doc, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      const typeLabel = {
        'ponuda': 'Ponuda',
        'ugovor': 'Ugovor',
        'otpremnica': 'Otpremnica',
        'racun': 'Račun',
        'nalog-dostava-montaza': 'Nalog',
      }[variables.targetType];
      toast.success(`${typeLabel} uspješno kreiran!`);
      
      logActivity.mutate({
        action_type: 'create',
        entity_type: 'document',
        entity_id: doc.id,
        entity_name: doc.number,
      });
    },
    onError: (error) => {
      toast.error('Greška pri konverziji dokumenta: ' + error.message);
    },
  });
}
