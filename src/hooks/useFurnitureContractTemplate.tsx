import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerUserId } from '@/hooks/useOwnerUserId';

const BUCKET = 'contract-templates';

export type FurnitureContractBgSlot = 'p1' | 'p2' | 'p3';

const settingKeys: Record<FurnitureContractBgSlot, string> = {
  p1: 'furniture_contract_bg_p1_path',
  p2: 'furniture_contract_bg_p2_path',
  p3: 'furniture_contract_bg_p3_path',
};

export interface FurnitureContractTemplateState {
  paths: Record<FurnitureContractBgSlot, string | null>;
  signedUrls: Record<FurnitureContractBgSlot, string | null>;
}

async function upsertDocumentSetting(params: {
  userId: string;
  key: string;
  value: string;
}) {
  const { userId, key, value } = params;

  // document_settings currently doesn't expose a typed unique constraint here,
  // so we keep it explicit like existing hooks.
  const { data: existing, error: findError } = await supabase
    .from('document_settings')
    .select('id')
    .eq('setting_key', key)
    .maybeSingle();

  if (findError) throw findError;

  if (existing?.id) {
    const { error } = await supabase
      .from('document_settings')
      .update({
        setting_value: value as any,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from('document_settings').insert({
    user_id: userId,
    setting_key: key,
    setting_value: value as any,
    updated_by: userId,
  });
  if (error) throw error;
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

      const keys = Object.values(settingKeys);
      const { data, error } = await supabase
        .from('document_settings')
        .select('setting_key, setting_value')
        .in('setting_key', keys);

      if (error) throw error;

      const paths: Record<FurnitureContractBgSlot, string | null> = { p1: null, p2: null, p3: null };
      for (const row of data || []) {
        const key = row.setting_key;
        const value = row.setting_value;
        const slot = (Object.entries(settingKeys).find(([, k]) => k === key)?.[0] || null) as FurnitureContractBgSlot | null;
        if (!slot) continue;
        paths[slot] = typeof value === 'string' ? value : null;
      }

      const signedUrls: Record<FurnitureContractBgSlot, string | null> = { p1: null, p2: null, p3: null };
      for (const slot of ['p1', 'p2', 'p3'] as const) {
        const path = paths[slot];
        if (!path) continue;
        const { data: urlData, error: urlError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(path, 60 * 60 * 24 * 365);
        if (urlError) throw urlError;
        signedUrls[slot] = urlData.signedUrl;
      }

      return { paths, signedUrls };
    },
    enabled: !!user,
  });

  const upload = useMutation({
    mutationFn: async ({ slot, file }: { slot: FurnitureContractBgSlot; file: File }) => {
      if (!user) throw new Error('Not authenticated');
      if (!ownerUserId) throw new Error('Nije moguće odrediti vlasnika (ownerUserId).');

      const path = `${ownerUserId}/furniture-contract/${slot}.png`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type || 'image/png' });

      if (uploadError) throw uploadError;

      await upsertDocumentSetting({ userId: ownerUserId, key: settingKeys[slot], value: path });

      return { slot, path };
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
