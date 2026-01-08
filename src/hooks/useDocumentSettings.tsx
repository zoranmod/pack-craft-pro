import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface DocumentHeaderFooterSettings {
  enabled: boolean;
  svg: string | null;
  text: string | null;
  align: 'left' | 'center' | 'right';
  paddingTop: number;
  paddingBottom: number;
  maxHeightMm: number;
}

export const defaultHeaderSettings: DocumentHeaderFooterSettings = {
  enabled: false,
  svg: null,
  text: null,
  align: 'center',
  paddingTop: 0,
  paddingBottom: 4,
  maxHeightMm: 25,
};

export const defaultFooterSettings: DocumentHeaderFooterSettings = {
  enabled: false,
  svg: null,
  text: null,
  align: 'center',
  paddingTop: 4,
  paddingBottom: 0,
  maxHeightMm: 20,
};

// Parse JSON value to settings
function parseSettingsValue(value: Json | null): Partial<DocumentHeaderFooterSettings> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as unknown as Partial<DocumentHeaderFooterSettings>;
}

// Fetch global document header settings - RLS handles access control
export function useDocumentHeaderSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-settings', 'global_document_header'],
    queryFn: async () => {
      if (!user) return defaultHeaderSettings;

      // RLS policies handle access control - employees see owner's settings
      const { data, error } = await supabase
        .from('document_settings')
        .select('setting_value')
        .eq('setting_key', 'global_document_header')
        .maybeSingle();

      if (error) {
        console.error('Error fetching header settings:', error);
        return defaultHeaderSettings;
      }

      if (!data) return defaultHeaderSettings;

      return {
        ...defaultHeaderSettings,
        ...parseSettingsValue(data.setting_value),
      };
    },
    enabled: !!user,
  });
}

// Fetch global document footer settings - RLS handles access control
export function useDocumentFooterSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-settings', 'global_document_footer'],
    queryFn: async () => {
      if (!user) return defaultFooterSettings;

      // RLS policies handle access control - employees see owner's settings
      const { data, error } = await supabase
        .from('document_settings')
        .select('setting_value')
        .eq('setting_key', 'global_document_footer')
        .maybeSingle();

      if (error) {
        console.error('Error fetching footer settings:', error);
        return defaultFooterSettings;
      }

      if (!data) return defaultFooterSettings;

      return {
        ...defaultFooterSettings,
        ...parseSettingsValue(data.setting_value),
      };
    },
    enabled: !!user,
  });
}

// Save document setting (upsert)
export function useSaveDocumentSetting() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      key,
      value,
    }: {
      key: 'global_document_header' | 'global_document_footer';
      value: DocumentHeaderFooterSettings;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if setting exists
      const { data: existing } = await supabase
        .from('document_settings')
        .select('id')
        .eq('setting_key', key)
        .maybeSingle();

      const jsonValue: Json = value as unknown as Json;

      if (existing) {
        // Update
        const { error } = await supabase
          .from('document_settings')
          .update({
            setting_value: jsonValue,
            updated_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from('document_settings').insert({
          user_id: user.id,
          setting_key: key,
          setting_value: jsonValue,
          updated_by: user.id,
        });

        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['document-settings', variables.key],
      });
      toast({
        title: 'Postavke spremljene',
        description: 'Postavke dokumenta su uspješno spremljene.',
      });
    },
    onError: (error) => {
      console.error('Error saving document settings:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće spremiti postavke.',
        variant: 'destructive',
      });
    },
  });
}
