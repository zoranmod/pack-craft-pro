import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLogs';

export interface Article {
  id: string;
  user_id: string;
  code: string | null;
  name: string;
  unit: string;
  price: number;
  pdv: number;
  description: string | null;
  barcode: string | null;
  purchase_price: number;
  stock: number;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleData {
  code?: string;
  name: string;
  unit?: string;
  price?: number;
  pdv?: number;
  description?: string;
  barcode?: string;
  purchase_price?: number;
  stock?: number;
  is_template?: boolean;
}

export interface ArticlesParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ArticlesResult {
  articles: Article[];
  totalCount: number;
  totalPages: number;
}

export function useArticles(params: ArticlesParams = {}) {
  const { user } = useAuth();
  const { page = 1, pageSize = 50, search = '' } = params;

  return useQuery({
    queryKey: ['articles', page, pageSize, search],
    queryFn: async (): Promise<ArticlesResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('articles')
        .select('*', { count: 'exact' });

      // Server-side search with input sanitization
      if (search.trim()) {
        // Escape special SQL LIKE pattern characters and PostgREST filter characters
        const sanitizedSearch = search
          .trim()
          .slice(0, 100) // Limit search length
          .replace(/[%_\\]/g, '\\$&') // Escape LIKE wildcards
          .replace(/[,()]/g, ''); // Remove PostgREST filter syntax characters
        
        if (sanitizedSearch) {
          query = query.or(`name.ilike.%${sanitizedSearch}%,code.ilike.%${sanitizedSearch}%,barcode.ilike.%${sanitizedSearch}%`);
        }
      }

      const { data, error, count } = await query
        .order('name', { ascending: true })
        .range(from, to);

      if (error) throw error;
      
      const totalCount = count || 0;
      return {
        articles: data as Article[],
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      };
    },
    enabled: !!user,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (articleData: CreateArticleData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('articles')
        .insert({
          user_id: user.id,
          code: articleData.code || null,
          name: articleData.name,
          unit: articleData.unit || 'kom',
          price: articleData.price || 0,
          pdv: articleData.pdv || 25,
          description: articleData.description || null,
          barcode: articleData.barcode || null,
          purchase_price: articleData.purchase_price || 0,
          stock: articleData.stock || 0,
          is_template: articleData.is_template || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Article;
    },
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artikl uspješno kreiran');
      
      logActivity.mutate({
        action_type: 'create',
        entity_type: 'article',
        entity_id: article.id,
        entity_name: article.name,
      });
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju artikla: ' + error.message);
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ id, ...articleData }: CreateArticleData & { id: string }) => {
      const { data, error } = await supabase
        .from('articles')
        .update({
          code: articleData.code || null,
          name: articleData.name,
          unit: articleData.unit || 'kom',
          price: articleData.price || 0,
          pdv: articleData.pdv || 25,
          description: articleData.description || null,
          barcode: articleData.barcode || null,
          purchase_price: articleData.purchase_price || 0,
          stock: articleData.stock || 0,
          is_template: articleData.is_template || false,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Article;
    },
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artikl uspješno ažuriran');
      
      logActivity.mutate({
        action_type: 'update',
        entity_type: 'article',
        entity_id: article.id,
        entity_name: article.name,
      });
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju artikla: ' + error.message);
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (idOrData: string | { id: string; name?: string }) => {
      const id = typeof idOrData === 'string' ? idOrData : idOrData.id;
      const name = typeof idOrData === 'string' ? undefined : idOrData.name;
      
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artikl uspješno obrisan');
      
      logActivity.mutate({
        action_type: 'delete',
        entity_type: 'article',
        entity_id: data.id,
        entity_name: data.name || data.id,
      });
    },
    onError: (error) => {
      toast.error('Greška pri brisanju artikla: ' + error.message);
    },
  });
}

// Hook for fetching only templates
export function useArticleTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['article-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('is_template', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!user,
  });
}

// Hook to save an item as template
export function useSaveAsTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (templateData: Omit<CreateArticleData, 'is_template'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('articles')
        .insert({
          user_id: user.id,
          code: templateData.code || null,
          name: templateData.name,
          unit: templateData.unit || 'kom',
          price: templateData.price || 0,
          pdv: templateData.pdv || 25,
          description: templateData.description || null,
          barcode: templateData.barcode || null,
          purchase_price: templateData.purchase_price || 0,
          stock: 0,
          is_template: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Article;
    },
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['article-templates'] });
      toast.success('Šablona uspješno spremljena');
      
      logActivity.mutate({
        action_type: 'create',
        entity_type: 'article',
        entity_id: article.id,
        entity_name: article.name,
      });
    },
    onError: (error) => {
      toast.error('Greška pri spremanju šablone: ' + error.message);
    },
  });
}
