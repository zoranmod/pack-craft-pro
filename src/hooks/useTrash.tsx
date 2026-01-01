import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type TrashEntityType = 'documents' | 'clients' | 'suppliers' | 'articles' | 'employees';

interface TrashItem {
  id: string;
  name: string;
  type: TrashEntityType;
  deleted_at: string;
  deleted_by?: string;
  extra_info?: string;
}

export function useTrashItems(entityType: TrashEntityType) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trash', entityType, user?.id],
    queryFn: async (): Promise<TrashItem[]> => {
      if (!user) return [];

      let data: any[] = [];
      let error: any = null;

      // Use specific table queries to maintain type safety
      switch (entityType) {
        case 'documents': {
          const result = await supabase
            .from('documents')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });
          data = result.data || [];
          error = result.error;
          break;
        }
        case 'clients': {
          const result = await supabase
            .from('clients')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });
          data = result.data || [];
          error = result.error;
          break;
        }
        case 'suppliers': {
          const result = await supabase
            .from('dobavljaci')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });
          data = result.data || [];
          error = result.error;
          break;
        }
        case 'articles': {
          const result = await supabase
            .from('articles')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });
          data = result.data || [];
          error = result.error;
          break;
        }
        case 'employees': {
          const result = await supabase
            .from('employees')
            .select('*')
            .not('deleted_at', 'is', null)
            .order('deleted_at', { ascending: false });
          data = result.data || [];
          error = result.error;
          break;
        }
      }

      if (error) throw error;

      // Map to unified TrashItem format
      return data.map((item: any) => {
        let name = '';
        let extra_info = '';
        
        switch (entityType) {
          case 'documents':
            name = item.number || item.id;
            extra_info = item.client_name;
            break;
          case 'clients':
            name = item.name;
            extra_info = item.oib || item.city || '';
            break;
          case 'suppliers':
            name = item.name;
            extra_info = item.contact_person || '';
            break;
          case 'articles':
            name = item.name;
            extra_info = item.code || '';
            break;
          case 'employees':
            name = `${item.first_name} ${item.last_name}`;
            extra_info = item.position || item.email || '';
            break;
        }
        
        return {
          id: item.id,
          name,
          type: entityType,
          deleted_at: item.deleted_at,
          deleted_by: item.deleted_by,
          extra_info,
        };
      });
    },
    enabled: !!user,
  });
}

export function useRestoreItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: TrashEntityType }) => {
      let error: any = null;

      switch (type) {
        case 'documents': {
          const result = await supabase
            .from('documents')
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', id);
          error = result.error;
          break;
        }
        case 'clients': {
          const result = await supabase
            .from('clients')
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', id);
          error = result.error;
          break;
        }
        case 'suppliers': {
          const result = await supabase
            .from('dobavljaci')
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', id);
          error = result.error;
          break;
        }
        case 'articles': {
          const result = await supabase
            .from('articles')
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', id);
          error = result.error;
          break;
        }
        case 'employees': {
          const result = await supabase
            .from('employees')
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', id);
          error = result.error;
          break;
        }
      }

      if (error) throw error;
      return { id, type };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trash', data.type] });
      // Invalidate related entity queries
      switch (data.type) {
        case 'documents':
          queryClient.invalidateQueries({ queryKey: ['documents'] });
          break;
        case 'clients':
          queryClient.invalidateQueries({ queryKey: ['clients'] });
          break;
        case 'suppliers':
          queryClient.invalidateQueries({ queryKey: ['suppliers'] });
          break;
        case 'articles':
          queryClient.invalidateQueries({ queryKey: ['articles'] });
          break;
        case 'employees':
          queryClient.invalidateQueries({ queryKey: ['employees'] });
          break;
      }
      toast.success('Vraćeno iz kante.');
    },
    onError: (error) => {
      toast.error('Greška pri vraćanju: ' + (error as Error).message);
    },
  });
}

export function usePermanentDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: TrashEntityType }) => {
      let error: any = null;

      switch (type) {
        case 'documents': {
          const result = await supabase.from('documents').delete().eq('id', id);
          error = result.error;
          break;
        }
        case 'clients': {
          const result = await supabase.from('clients').delete().eq('id', id);
          error = result.error;
          break;
        }
        case 'suppliers': {
          const result = await supabase.from('dobavljaci').delete().eq('id', id);
          error = result.error;
          break;
        }
        case 'articles': {
          const result = await supabase.from('articles').delete().eq('id', id);
          error = result.error;
          break;
        }
        case 'employees': {
          const result = await supabase.from('employees').delete().eq('id', id);
          error = result.error;
          break;
        }
      }

      if (error) throw error;
      return { id, type };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trash', data.type] });
      toast.success('Trajno obrisano.');
    },
    onError: (error) => {
      toast.error('Greška pri trajnom brisanju: ' + (error as Error).message);
    },
  });
}

export function useBulkDeleteOld() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cutoffDate = thirtyDaysAgo.toISOString();

      const results: Record<string, number> = {};

      // Delete from each table individually
      const tables: { key: string; table: 'documents' | 'clients' | 'dobavljaci' | 'articles' | 'employees' }[] = [
        { key: 'documents', table: 'documents' },
        { key: 'clients', table: 'clients' },
        { key: 'suppliers', table: 'dobavljaci' },
        { key: 'articles', table: 'articles' },
        { key: 'employees', table: 'employees' },
      ];

      for (const { key, table } of tables) {
        const { data, error } = await supabase
          .from(table)
          .delete()
          .not('deleted_at', 'is', null)
          .lt('deleted_at', cutoffDate)
          .select('id');

        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          continue;
        }

        results[key] = data?.length || 0;
      }

      return results;
    },
    onSuccess: (results) => {
      const summary = Object.entries(results)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => {
          const labels: Record<string, string> = {
            documents: 'Dokumenti',
            clients: 'Klijenti',
            suppliers: 'Dobavljači',
            articles: 'Artikli',
            employees: 'Zaposlenici',
          };
          return `${labels[type]}: ${count}`;
        })
        .join(', ');

      if (summary) {
        toast.success(`Trajno obrisano: ${summary}`);
      } else {
        toast.info('Nema zapisa starijih od 30 dana.');
      }

      // Invalidate all trash queries
      queryClient.invalidateQueries({ queryKey: ['trash'] });
    },
    onError: (error) => {
      toast.error('Greška pri brisanju starih zapisa: ' + (error as Error).message);
    },
  });
}
