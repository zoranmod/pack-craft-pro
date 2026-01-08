import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface PonudaLayoutSettings {
  mp: {
    yMm: number; // vertical offset in mm (positive = down from default)
  };
}

export const defaultPonudaLayoutSettings: PonudaLayoutSettings = {
  mp: {
    yMm: 0,
  },
};

// Parse JSON value to settings
function parseSettingsValue(value: Json | null): Partial<PonudaLayoutSettings> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as unknown as Partial<PonudaLayoutSettings>;
}

// Fetch ponuda layout settings - RLS handles access control
export function usePonudaLayoutSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-settings', 'ponuda_layout'],
    queryFn: async () => {
      if (!user) return defaultPonudaLayoutSettings;

      // RLS policies handle access control - employees see owner's settings
      const { data, error } = await supabase
        .from('document_settings')
        .select('setting_value')
        .eq('setting_key', 'ponuda_layout')
        .maybeSingle();

      if (error) {
        console.error('Error fetching ponuda layout settings:', error);
        return defaultPonudaLayoutSettings;
      }

      if (!data) return defaultPonudaLayoutSettings;

      const parsed = parseSettingsValue(data.setting_value);
      return {
        mp: {
          ...defaultPonudaLayoutSettings.mp,
          ...(parsed.mp || {}),
        },
      };
    },
    enabled: !!user,
  });
}

// Save ponuda layout settings
export function useSavePonudaLayoutSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: PonudaLayoutSettings) => {
      if (!user) throw new Error('User not authenticated');

      // Check if setting exists
      const { data: existing } = await supabase
        .from('document_settings')
        .select('id')
        .eq('setting_key', 'ponuda_layout')
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
          setting_key: 'ponuda_layout',
          setting_value: jsonValue,
          updated_by: user.id,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['document-settings', 'ponuda_layout'],
      });
      toast({
        title: 'Raspored spremljen',
        description: 'Pozicija M.P. je uspješno spremljena.',
      });
    },
    onError: (error) => {
      console.error('Error saving ponuda layout settings:', error);
      toast({
        title: 'Greška',
        description: 'Nije moguće spremiti raspored.',
        variant: 'destructive',
      });
    },
  });
}
