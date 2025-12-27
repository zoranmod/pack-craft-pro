import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CompanySettings {
  id?: string;
  company_name: string;
  address: string;
  oib: string;
  iban: string;
}

interface UserProfile {
  id?: string;
  first_name: string;
  last_name: string;
}

export function useCompanySettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['company-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSaveCompanySettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (settings: CompanySettings) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('company_settings')
          .update({
            company_name: settings.company_name,
            address: settings.address,
            oib: settings.oib,
            iban: settings.iban,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert({
            user_id: user.id,
            company_name: settings.company_name,
            address: settings.address,
            oib: settings.oib,
            iban: settings.iban,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast.success('Podaci o tvrtki spremljeni!');
    },
    onError: (error) => {
      toast.error('Greška pri spremanju: ' + error.message);
    },
  });
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useSaveUserProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('user_profiles')
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profil uspješno spremljen!');
    },
    onError: (error) => {
      toast.error('Greška pri spremanju: ' + error.message);
    },
  });
}
