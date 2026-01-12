import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentType } from '@/types/document';
import { useAuth } from '@/hooks/useAuth';

export interface DocumentChainItem {
  id: string;
  number: string;
  type: DocumentType;
  status: string;
  date: string;
  clientName: string;
  totalAmount: number;
}

export interface DocumentChain {
  ancestors: DocumentChainItem[]; // Parent documents (source_document_id chain)
  current: DocumentChainItem | null;
  descendants: DocumentChainItem[]; // Child documents (documents that have this as source)
}

// Map DB row to chain item
function mapToChainItem(row: any): DocumentChainItem {
  return {
    id: row.id,
    number: row.number,
    type: row.type as DocumentType,
    status: row.status,
    date: row.date,
    clientName: row.client_name,
    totalAmount: row.total_amount,
  };
}

export function useDocumentChain(documentId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-chain', documentId],
    queryFn: async (): Promise<DocumentChain> => {
      if (!documentId) {
        return { ancestors: [], current: null, descendants: [] };
      }

      // Fetch current document
      const { data: currentDoc, error: currentError } = await supabase
        .from('documents')
        .select('id, number, type, status, date, client_name, total_amount, source_document_id')
        .eq('id', documentId)
        .is('deleted_at', null)
        .single();

      if (currentError || !currentDoc) {
        console.error('Error fetching current document:', currentError);
        return { ancestors: [], current: null, descendants: [] };
      }

      const current = mapToChainItem(currentDoc);

      // Fetch ancestors (walk up the source_document_id chain)
      const ancestors: DocumentChainItem[] = [];
      let parentId = currentDoc.source_document_id;
      
      while (parentId) {
        const { data: parentDoc, error: parentError } = await supabase
          .from('documents')
          .select('id, number, type, status, date, client_name, total_amount, source_document_id')
          .eq('id', parentId)
          .is('deleted_at', null)
          .single();

        if (parentError || !parentDoc) break;
        
        ancestors.unshift(mapToChainItem(parentDoc)); // Add to beginning
        parentId = parentDoc.source_document_id;
        
        // Safety: prevent infinite loops (max 10 levels)
        if (ancestors.length >= 10) break;
      }

      // Fetch descendants (documents that have this document as source)
      const allDescendants: DocumentChainItem[] = [];
      const queue = [documentId];
      const visited = new Set<string>([documentId]);

      while (queue.length > 0) {
        const currentParentId = queue.shift()!;
        
        const { data: children, error: childError } = await supabase
          .from('documents')
          .select('id, number, type, status, date, client_name, total_amount')
          .eq('source_document_id', currentParentId)
          .is('deleted_at', null)
          .order('created_at', { ascending: true });

        if (childError || !children) continue;

        for (const child of children) {
          if (!visited.has(child.id)) {
            visited.add(child.id);
            allDescendants.push(mapToChainItem(child));
            queue.push(child.id);
          }
        }

        // Safety: max 50 descendants
        if (allDescendants.length >= 50) break;
      }

      return { ancestors, current, descendants: allDescendants };
    },
    enabled: !!documentId && !!user,
    staleTime: 30000, // Cache for 30 seconds
  });
}
