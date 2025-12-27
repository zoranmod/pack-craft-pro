import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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
}

export function useArticles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!user,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
        })
        .select()
        .single();

      if (error) throw error;
      return data as Article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artikl uspješno kreiran');
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju artikla: ' + error.message);
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

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
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Article;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artikl uspješno ažuriran');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju artikla: ' + error.message);
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Artikl uspješno obrisan');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju artikla: ' + error.message);
    },
  });
}
