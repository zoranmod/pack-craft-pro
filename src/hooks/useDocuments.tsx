import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Document, DocumentItem, DocumentType, DocumentStatus, DocumentContractArticle } from '@/types/document';
import { toast } from 'sonner';

interface CreateDocumentData {
  type: DocumentType;
  clientName: string;
  clientOib?: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  notes?: string;
  items: Omit<DocumentItem, 'id'>[];
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

// Generate document number based on type
const generateDocumentNumber = (type: DocumentType) => {
  const prefixes: Record<DocumentType, string> = {
    'otpremnica': 'OTP',
    'ponuda': 'PON',
    'nalog-dostava-montaza': 'NDM',
    'racun': 'RAC',
    'ugovor': 'UGO',
  };
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefixes[type]}-${year}-${random}`;
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

      // Fetch items for each document
      const documentsWithItems = await Promise.all(
        documents.map(async (doc) => {
          const { data: items } = await supabase
            .from('document_items')
            .select('*')
            .eq('document_id', doc.id);
          return mapDbToDocument(doc, items || []);
        })
      );

      return documentsWithItems;
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

  return useMutation({
    mutationFn: async (data: CreateDocumentData) => {
      if (!user) throw new Error('Not authenticated');

      const totalAmount = data.items.reduce((sum, item) => sum + item.total, 0);

      // Create document
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          type: data.type,
          number: generateDocumentNumber(data.type),
          client_name: data.clientName,
          client_oib: data.clientOib,
          client_address: data.clientAddress,
          client_phone: data.clientPhone,
          client_email: data.clientEmail,
          notes: data.notes,
          total_amount: totalAmount,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument uspješno kreiran!');
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju dokumenta: ' + error.message);
    },
  });
}

export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: DocumentStatus }) => {
      const { error } = await supabase
        .from('documents')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Status dokumenta ažuriran');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju statusa: ' + error.message);
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Dokument obrisan');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju dokumenta: ' + error.message);
    },
  });
}
