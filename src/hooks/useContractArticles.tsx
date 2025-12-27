import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContractArticleTemplate, DocumentContractArticle, defaultContractArticles } from '@/types/contractArticle';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Fetch all contract article templates for the current user
export function useContractArticleTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contract-article-templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('contract_article_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('article_number', { ascending: true });

      if (error) throw error;
      return data as ContractArticleTemplate[];
    },
    enabled: !!user?.id,
  });
}

// Fetch contract articles for a specific document
export function useDocumentContractArticles(documentId: string) {
  return useQuery({
    queryKey: ['document-contract-articles', documentId],
    queryFn: async () => {
      if (!documentId) return [];

      const { data, error } = await supabase
        .from('document_contract_articles')
        .select('*')
        .eq('document_id', documentId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as DocumentContractArticle[];
    },
    enabled: !!documentId,
  });
}

// Initialize default templates for a user
export function useInitializeDefaultTemplates() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      // Check if user already has templates
      const { data: existingTemplates, error: checkError } = await supabase
        .from('contract_article_templates')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (checkError) throw checkError;

      if (existingTemplates && existingTemplates.length > 0) {
        return { alreadyExists: true };
      }

      // Insert default templates
      const templatesWithUserId = defaultContractArticles.map(template => ({
        ...template,
        user_id: user.id,
      }));

      const { error: insertError } = await supabase
        .from('contract_article_templates')
        .insert(templatesWithUserId);

      if (insertError) throw insertError;

      return { alreadyExists: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contract-article-templates'] });
      if (!result.alreadyExists) {
        toast.success('Predlošci članaka uspješno učitani!');
      }
    },
    onError: (error) => {
      console.error('Error initializing templates:', error);
      toast.error('Greška pri učitavanju predložaka');
    },
  });
}

// Create a new template
export function useCreateContractArticleTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: Omit<ContractArticleTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('contract_article_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-article-templates'] });
      toast.success('Članak uspješno dodan!');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Greška pri dodavanju članka');
    },
  });
}

// Update a template
export function useUpdateContractArticleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContractArticleTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('contract_article_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-article-templates'] });
      toast.success('Članak uspješno ažuriran!');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Greška pri ažuriranju članka');
    },
  });
}

// Delete a template
export function useDeleteContractArticleTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contract_article_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-article-templates'] });
      toast.success('Članak uspješno obrisan!');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Greška pri brisanju članka');
    },
  });
}

// Save contract articles for a document
export function useSaveDocumentContractArticles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      documentId, 
      articles 
    }: { 
      documentId: string; 
      articles: Omit<DocumentContractArticle, 'id' | 'document_id' | 'created_at'>[] 
    }) => {
      // First delete existing articles for this document
      const { error: deleteError } = await supabase
        .from('document_contract_articles')
        .delete()
        .eq('document_id', documentId);

      if (deleteError) throw deleteError;

      // Insert new articles
      if (articles.length > 0) {
        const articlesWithDocumentId = articles.map((article, index) => ({
          ...article,
          document_id: documentId,
          sort_order: index,
        }));

        const { error: insertError } = await supabase
          .from('document_contract_articles')
          .insert(articlesWithDocumentId);

        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['document-contract-articles', variables.documentId] });
    },
    onError: (error) => {
      console.error('Error saving document articles:', error);
      toast.error('Greška pri spremanju članaka ugovora');
    },
  });
}
