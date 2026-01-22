import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerUserId } from '@/hooks/useOwnerUserId';

const FUNCTION_NAME = 'furniture-contract-template';

export type FurnitureContractBgSlot = 'p1' | 'p2' | 'p3';

export interface FurnitureContractTemplateState {
  paths: Record<FurnitureContractBgSlot, string | null>;
  signedUrls: Record<FurnitureContractBgSlot, string | null>;
}

async function getAuthToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error('Not authenticated');
  return token;
}

async function fetchTemplateState(): Promise<FurnitureContractTemplateState> {
  const token = await getAuthToken();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || 'Greška pri dohvaćanju predloška.');
  }
  return json as FurnitureContractTemplateState;
}

export function useFurnitureContractTemplate() {
  const { user } = useAuth();
  const ownerUserId = useOwnerUserId();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['document-settings', 'furniture_contract_template'],
    queryFn: async (): Promise<FurnitureContractTemplateState> => {
      if (!user) {
        return {
          paths: { p1: null, p2: null, p3: null },
          signedUrls: { p1: null, p2: null, p3: null },
        };
      }

      // Storage bucket is private and currently blocks client-side access via RLS,
      // so we fetch paths + signed urls via backend function.
      return await fetchTemplateState();
    },
    enabled: !!user,
  });

  const upload = useMutation({
    mutationFn: async ({ slot, file }: { slot: FurnitureContractBgSlot; file: File }) => {
      if (!user) throw new Error('Not authenticated');
      if (!ownerUserId) throw new Error('Nije moguće odrediti vlasnika (ownerUserId).');

      const token = await getAuthToken();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${FUNCTION_NAME}?slot=${encodeURIComponent(slot)}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': file.type || 'image/png',
          'x-owner-user-id': ownerUserId,
        },
        body: file,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || 'Greška pri uploadu.');
      return json as { slot: FurnitureContractBgSlot; path: string };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['document-settings', 'furniture_contract_template'] });
    },
  });

  return {
    ...query,
    ownerUserId,
    upload,
  };
}
