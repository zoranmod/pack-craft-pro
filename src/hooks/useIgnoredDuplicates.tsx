import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface IgnoredDuplicate {
  id: string;
  entity_type: string;
  entity_id_1: string;
  entity_id_2: string;
  created_at: string;
}

export function useIgnoredDuplicates(entityType: 'supplier' | 'client') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: ignoredDuplicates = [], isLoading } = useQuery({
    queryKey: ['ignored-duplicates', entityType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ignored_duplicates')
        .select('*')
        .eq('entity_type', entityType);

      if (error) throw error;
      return data as IgnoredDuplicate[];
    },
    enabled: !!user,
  });

  const ignoreDuplicateMutation = useMutation({
    mutationFn: async (entityIds: string[]) => {
      // Create pairs from all entity IDs in the group
      const pairs: { entity_type: string; entity_id_1: string; entity_id_2: string; created_by: string }[] = [];
      
      for (let i = 0; i < entityIds.length; i++) {
        for (let j = i + 1; j < entityIds.length; j++) {
          // Always store with smaller ID first for consistency
          const [id1, id2] = [entityIds[i], entityIds[j]].sort();
          pairs.push({
            entity_type: entityType,
            entity_id_1: id1,
            entity_id_2: id2,
            created_by: user!.id,
          });
        }
      }

      const { error } = await supabase
        .from('ignored_duplicates')
        .upsert(pairs, { onConflict: 'entity_type,entity_id_1,entity_id_2' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ignored-duplicates', entityType] });
      toast.success('Duplikati su označeni kao prihvaćeni');
    },
    onError: (error) => {
      console.error('Error ignoring duplicates:', error);
      toast.error('Greška pri spremanju');
    },
  });

  const removeIgnoredMutation = useMutation({
    mutationFn: async (entityIds: string[]) => {
      // Remove all pairs involving these entity IDs
      const { error } = await supabase
        .from('ignored_duplicates')
        .delete()
        .eq('entity_type', entityType)
        .or(`entity_id_1.in.(${entityIds.join(',')}),entity_id_2.in.(${entityIds.join(',')})`);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ignored-duplicates', entityType] });
    },
  });

  // Helper function to check if a pair of entities is ignored
  const isIgnored = (id1: string, id2: string): boolean => {
    const [sortedId1, sortedId2] = [id1, id2].sort();
    return ignoredDuplicates.some(
      (d) => d.entity_id_1 === sortedId1 && d.entity_id_2 === sortedId2
    );
  };

  // Check if all pairs in a group are ignored
  const isGroupIgnored = (entityIds: string[]): boolean => {
    for (let i = 0; i < entityIds.length; i++) {
      for (let j = i + 1; j < entityIds.length; j++) {
        if (!isIgnored(entityIds[i], entityIds[j])) {
          return false;
        }
      }
    }
    return true;
  };

  return {
    ignoredDuplicates,
    isLoading,
    ignoreDuplicate: ignoreDuplicateMutation.mutate,
    removeIgnored: removeIgnoredMutation.mutate,
    isIgnoring: ignoreDuplicateMutation.isPending,
    isIgnored,
    isGroupIgnored,
  };
}
