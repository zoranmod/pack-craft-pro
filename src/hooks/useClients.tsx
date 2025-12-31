import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useLogActivity } from './useActivityLogs';
import { useCallback } from 'react';

/**
 * Normalize a client name for comparison:
 * - trim whitespace
 * - collapse multiple spaces
 * - lowercase
 */
export function normalizeClientName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  oib: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  client_type: 'private' | 'company';
  default_pdv: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  oib?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  notes?: string;
  client_type?: 'private' | 'company';
  default_pdv?: number;
}

export function useClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (clientData: CreateClientData) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: clientData.name,
          oib: clientData.oib || null,
          address: clientData.address || null,
          city: clientData.city || null,
          postal_code: clientData.postal_code || null,
          phone: clientData.phone || null,
          email: clientData.email || null,
          notes: clientData.notes || null,
          client_type: clientData.client_type || 'company',
          default_pdv: clientData.default_pdv ?? 25,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Klijent uspješno kreiran');
      
      logActivity.mutate({
        action_type: 'create',
        entity_type: 'client',
        entity_id: client.id,
        entity_name: client.name,
      });
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju klijenta: ' + error.message);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async ({ id, ...clientData }: CreateClientData & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: clientData.name,
          oib: clientData.oib || null,
          address: clientData.address || null,
          city: clientData.city || null,
          postal_code: clientData.postal_code || null,
          phone: clientData.phone || null,
          email: clientData.email || null,
          notes: clientData.notes || null,
          client_type: clientData.client_type || 'company',
          default_pdv: clientData.default_pdv ?? 25,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Klijent uspješno ažuriran');
      
      logActivity.mutate({
        action_type: 'update',
        entity_type: 'client',
        entity_id: client.id,
        entity_name: client.name,
      });
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju klijenta: ' + error.message);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const logActivity = useLogActivity();

  return useMutation({
    mutationFn: async (idOrData: string | { id: string; name?: string }) => {
      const id = typeof idOrData === 'string' ? idOrData : idOrData.id;
      const name = typeof idOrData === 'string' ? undefined : idOrData.name;
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, name };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Klijent uspješno obrisan');
      
      logActivity.mutate({
        action_type: 'delete',
        entity_type: 'client',
        entity_id: data.id,
        entity_name: data.name || data.id,
      });
    },
    onError: (error) => {
      toast.error('Greška pri brisanju klijenta: ' + error.message);
    },
  });
}

