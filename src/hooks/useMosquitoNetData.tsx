import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { MosquitoNetProduct, MosquitoNetLocation, MosquitoNetQuoteItem } from '@/types/mosquitoNet';

// Products hooks
export function useMosquitoNetProducts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mosquito-net-products', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mosquito_net_products')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as MosquitoNetProduct[];
    },
    enabled: !!user,
  });
}

export function useCreateMosquitoNetProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (product: Omit<MosquitoNetProduct, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('mosquito_net_products')
        .insert({ ...product, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-products'] });
      toast.success('Proizvod dodan');
    },
    onError: (error) => {
      toast.error('Greška pri dodavanju proizvoda: ' + error.message);
    },
  });
}

export function useUpdateMosquitoNetProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<MosquitoNetProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from('mosquito_net_products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-products'] });
      toast.success('Proizvod ažuriran');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju proizvoda: ' + error.message);
    },
  });
}

export function useDeleteMosquitoNetProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mosquito_net_products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-products'] });
      toast.success('Proizvod obrisan');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju proizvoda: ' + error.message);
    },
  });
}

// Locations hooks
export function useMosquitoNetLocations() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['mosquito-net-locations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('mosquito_net_locations')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as MosquitoNetLocation[];
    },
    enabled: !!user,
  });
}

export function useCreateMosquitoNetLocation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (location: Omit<MosquitoNetLocation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('mosquito_net_locations')
        .insert({ ...location, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-locations'] });
      toast.success('Lokacija dodana');
    },
    onError: (error) => {
      toast.error('Greška pri dodavanju lokacije: ' + error.message);
    },
  });
}

export function useUpdateMosquitoNetLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...location }: Partial<MosquitoNetLocation> & { id: string }) => {
      const { data, error } = await supabase
        .from('mosquito_net_locations')
        .update(location)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-locations'] });
      toast.success('Lokacija ažurirana');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju lokacije: ' + error.message);
    },
  });
}

export function useDeleteMosquitoNetLocation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mosquito_net_locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-locations'] });
      toast.success('Lokacija obrisana');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju lokacije: ' + error.message);
    },
  });
}

// Quote items hooks
export function useMosquitoNetQuoteItems(documentId: string | undefined) {
  return useQuery({
    queryKey: ['mosquito-net-quote-items', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      
      const { data, error } = await supabase
        .from('mosquito_net_quote_items')
        .select('*')
        .eq('document_id', documentId)
        .order('section_type', { ascending: true })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as MosquitoNetQuoteItem[];
    },
    enabled: !!documentId,
  });
}

export function useSaveMosquitoNetQuoteItems() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, items }: { documentId: string; items: Omit<MosquitoNetQuoteItem, 'id' | 'created_at'>[] }) => {
      // Delete existing items
      await supabase
        .from('mosquito_net_quote_items')
        .delete()
        .eq('document_id', documentId);
      
      // Insert new items
      if (items.length > 0) {
        const { error } = await supabase
          .from('mosquito_net_quote_items')
          .insert(items.map(item => ({ ...item, document_id: documentId })));
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-quote-items', documentId] });
    },
    onError: (error) => {
      toast.error('Greška pri spremanju stavki: ' + error.message);
    },
  });
}

// Seed data function
export function useSeedMosquitoNetData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      // Check if data already exists
      const { data: existingProducts } = await supabase
        .from('mosquito_net_products')
        .select('id')
        .limit(1);
      
      if (existingProducts && existingProducts.length > 0) {
        throw new Error('Podaci već postoje');
      }
      
      // Seed products from PDF
      const products = [
        { name: 'Prozor komarnik BIJELI', code: 'PK-B', price_per_m2: 35, color: 'bijeli', product_type: 'prozor', sort_order: 1 },
        { name: 'Prozor komarnik SMEĐI', code: 'PK-S', price_per_m2: 40, color: 'smeđi', product_type: 'prozor', sort_order: 2 },
        { name: 'Prozor komarnik P-profil', code: 'PK-P', price_per_m2: 38, color: 'bijeli', product_type: 'prozor', sort_order: 3 },
        { name: 'Vrata komarnik BIJELI', code: 'VK-B', price_per_m2: 65, color: 'bijeli', product_type: 'vrata', sort_order: 4 },
        { name: 'Vrata komarnik SMEĐI', code: 'VK-S', price_per_m2: 70, color: 'smeđi', product_type: 'vrata', sort_order: 5 },
        { name: 'Vrata komarnik ZIG-ZAG', code: 'VK-ZZ', price_per_m2: 90, color: 'bijeli', product_type: 'vrata', sort_order: 6 },
        { name: 'Rolo komarnik BIJELI', code: 'RK-B', price_per_m2: 75, color: 'bijeli', product_type: 'rolo', sort_order: 7 },
        { name: 'Rolo komarnik SMEĐI', code: 'RK-S', price_per_m2: 80, color: 'smeđi', product_type: 'rolo', sort_order: 8 },
      ];
      
      const { error: productsError } = await supabase
        .from('mosquito_net_products')
        .insert(products.map(p => ({ ...p, user_id: user.id })));
      
      if (productsError) throw productsError;
      
      // Seed locations from PDF
      const locations = [
        { place_name: 'Zagreb', measurement_price: 0, window_installation_price: 10, door_installation_price: 15, sort_order: 1 },
        { place_name: 'Velika Gorica', measurement_price: 15, window_installation_price: 10, door_installation_price: 15, sort_order: 2 },
        { place_name: 'Samobor', measurement_price: 20, window_installation_price: 10, door_installation_price: 15, sort_order: 3 },
        { place_name: 'Zaprešić', measurement_price: 20, window_installation_price: 10, door_installation_price: 15, sort_order: 4 },
        { place_name: 'Dugo Selo', measurement_price: 20, window_installation_price: 10, door_installation_price: 15, sort_order: 5 },
        { place_name: 'Sesvete', measurement_price: 10, window_installation_price: 10, door_installation_price: 15, sort_order: 6 },
        { place_name: 'Karlovac', measurement_price: 40, window_installation_price: 12, door_installation_price: 18, sort_order: 7 },
        { place_name: 'Sisak', measurement_price: 45, window_installation_price: 12, door_installation_price: 18, sort_order: 8 },
        { place_name: 'Varaždin', measurement_price: 50, window_installation_price: 12, door_installation_price: 18, sort_order: 9 },
        { place_name: 'Čakovec', measurement_price: 55, window_installation_price: 12, door_installation_price: 18, sort_order: 10 },
        { place_name: 'Koprivnica', measurement_price: 45, window_installation_price: 12, door_installation_price: 18, sort_order: 11 },
        { place_name: 'Bjelovar', measurement_price: 50, window_installation_price: 12, door_installation_price: 18, sort_order: 12 },
        { place_name: 'Križevci', measurement_price: 40, window_installation_price: 10, door_installation_price: 15, sort_order: 13 },
        { place_name: 'Ivanić-Grad', measurement_price: 25, window_installation_price: 10, door_installation_price: 15, sort_order: 14 },
        { place_name: 'Jastrebarsko', measurement_price: 25, window_installation_price: 10, door_installation_price: 15, sort_order: 15 },
        { place_name: 'Sveta Nedelja', measurement_price: 15, window_installation_price: 10, door_installation_price: 15, sort_order: 16 },
        { place_name: 'Zabok', measurement_price: 30, window_installation_price: 10, door_installation_price: 15, sort_order: 17 },
        { place_name: 'Krapina', measurement_price: 40, window_installation_price: 12, door_installation_price: 18, sort_order: 18 },
        { place_name: 'Rijeka', measurement_price: 80, window_installation_price: 15, door_installation_price: 20, sort_order: 19 },
        { place_name: 'Split', measurement_price: 150, window_installation_price: 18, door_installation_price: 25, sort_order: 20 },
      ];
      
      const { error: locationsError } = await supabase
        .from('mosquito_net_locations')
        .insert(locations.map(l => ({ ...l, user_id: user.id })));
      
      if (locationsError) throw locationsError;
      
      return { productsCount: products.length, locationsCount: locations.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-products'] });
      queryClient.invalidateQueries({ queryKey: ['mosquito-net-locations'] });
      toast.success(`Dodano ${data.productsCount} proizvoda i ${data.locationsCount} lokacija`);
    },
    onError: (error) => {
      if (error.message === 'Podaci već postoje') {
        toast.info('Cjenik već postoji u bazi');
      } else {
        toast.error('Greška pri dodavanju podataka: ' + error.message);
      }
    },
  });
}
