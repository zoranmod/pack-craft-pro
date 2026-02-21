import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DocumentTag {
  id: string;
  document_id: string;
  tag_name: string;
  user_id: string;
  created_at: string;
}

export function useDocumentTags(documentId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-tags', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const { data, error } = await supabase
        .from('document_tags')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as DocumentTag[];
    },
    enabled: !!user && !!documentId,
  });
}

export function useAllDocumentTags() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['all-document-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('document_tags')
        .select('*')
        .order('tag_name', { ascending: true });

      if (error) throw error;
      return data as DocumentTag[];
    },
    enabled: !!user,
  });
}

export function useAvailableTagNames() {
  const { data: allTags = [] } = useAllDocumentTags();
  const uniqueNames = [...new Set(allTags.map(t => t.tag_name))].sort();
  return uniqueNames;
}

export function useAddDocumentTag() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ documentId, tagName }: { documentId: string; tagName: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('document_tags')
        .insert({
          document_id: documentId,
          tag_name: tagName.trim(),
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Tag već postoji na ovom dokumentu');
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-tags', variables.documentId] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useRemoveDocumentTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tagId, documentId }: { tagId: string; documentId: string }) => {
      const { error } = await supabase
        .from('document_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
      return { tagId, documentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['document-tags', data.documentId] });
      queryClient.invalidateQueries({ queryKey: ['all-document-tags'] });
    },
    onError: (error) => {
      toast.error('Greška pri brisanju taga: ' + error.message);
    },
  });
}
