import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const SETTING_KEY = 'furniture_contract_text_template_html' as const;

type StoredValue = { html: string } | string | null;

function coerceHtml(value: StoredValue): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && 'html' in value && typeof value.html === 'string') return value.html;
  return null;
}

export function useFurnitureContractTextTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['document-settings', SETTING_KEY],
    queryFn: async () => {
      if (!user) return null as string | null;

      const { data, error } = await supabase
        .from('document_settings')
        .select('setting_value')
        .eq('setting_key', SETTING_KEY)
        .maybeSingle();

      if (error) throw error;
      return coerceHtml((data?.setting_value ?? null) as StoredValue);
    },
    enabled: !!user,
  });

  const save = useMutation({
    mutationFn: async ({ html }: { html: string }) => {
      if (!user) throw new Error('User not authenticated');

      // Upsert by (user_id, setting_key) isn't guaranteed by constraint, so do update/insert.
      const { data: existing, error: existingError } = await supabase
        .from('document_settings')
        .select('id')
        .eq('setting_key', SETTING_KEY)
        .maybeSingle();

      if (existingError) throw existingError;

      const setting_value = { html };

      if (existing?.id) {
        const { error } = await supabase
          .from('document_settings')
          .update({
            setting_value,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('document_settings').insert({
          user_id: user.id,
          setting_key: SETTING_KEY,
          setting_value,
          updated_by: user.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-settings', SETTING_KEY] });
    },
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('document_settings')
        .delete()
        .eq('setting_key', SETTING_KEY);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-settings', SETTING_KEY] });
    },
  });

  return {
    html: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    save,
    clear,
  };
}
