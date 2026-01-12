import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DocumentTemplate {
  id: string;
  user_id: string;
  document_type: string;
  name: string;
  is_default: boolean;
  
  // WYSIWYG mode
  use_wysiwyg: boolean;
  html_content: string | null;
  
  // Header
  show_logo: boolean;
  header_layout: string;
  show_company_info: boolean;
  show_iban_in_header: boolean;
  show_second_iban: boolean;
  
  // Document metadata
  show_payment_method: boolean;
  show_validity_days: boolean;
  show_delivery_days: boolean;
  default_validity_days: number;
  default_delivery_days: number;
  default_payment_method: string;
  
  // Table
  table_columns: string[];
  show_pdv_breakdown: boolean;
  show_discount_column: boolean;
  
  // Footer
  show_prepared_by: boolean;
  prepared_by_label: string;
  show_signature_line: boolean;
  show_stamp_placeholder: boolean;
  show_director_signature: boolean;
  show_certificates: boolean;
  certificate_images: string[];
  show_footer_contacts: boolean;
  show_registration_info: boolean;
  footer_note: string;
  
  // Styles
  primary_color: string;
  secondary_color: string;
  font_family: string;
  header_font_size: number;
  body_font_size: number;
  
  created_at: string;
  updated_at: string;
}

export type CreateDocumentTemplate = Omit<DocumentTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const defaultTemplate: Omit<CreateDocumentTemplate, 'document_type' | 'name'> = {
  is_default: false,
  use_wysiwyg: false,
  html_content: null,
  show_logo: true,
  header_layout: 'left-right',
  show_company_info: true,
  show_iban_in_header: true,
  show_second_iban: false,
  show_payment_method: true,
  show_validity_days: true,
  show_delivery_days: true,
  default_validity_days: 15,
  default_delivery_days: 60,
  default_payment_method: 'Transakcijski račun',
  table_columns: ['rbr', 'sifra', 'naziv', 'jmj', 'kolicina', 'cijena', 'rabat', 'cijena_s_rabatom', 'ukupno'],
  show_pdv_breakdown: true,
  show_discount_column: true,
  show_prepared_by: true,
  prepared_by_label: 'Ponudu pripremio/la:',
  show_signature_line: true,
  show_stamp_placeholder: true,
  show_director_signature: true,
  show_certificates: false,
  certificate_images: [],
  show_footer_contacts: true,
  show_registration_info: true,
  footer_note: 'Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.',
  primary_color: '#1a365d',
  secondary_color: '#4a5568',
  font_family: 'Arial',
  header_font_size: 10,
  body_font_size: 9,
};

export const getDefaultTemplate = () => defaultTemplate;

export function useDocumentTemplates(documentType?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-templates', user?.id, documentType],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('document_templates')
        .select('*')
        .order('name');

      if (documentType) {
        query = query.eq('document_type', documentType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as DocumentTemplate[];
    },
    enabled: !!user,
  });
}

export function useDocumentTemplate(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['document-template', id],
    queryFn: async () => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as DocumentTemplate;
    },
    enabled: !!user && !!id,
  });
}

export function useDefaultTemplate(documentType: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['default-template', user?.id, documentType],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('document_type', documentType)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      return data as DocumentTemplate | null;
    },
    enabled: !!user && !!documentType,
  });
}

export function useCreateDocumentTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: CreateDocumentTemplate) => {
      if (!user) throw new Error('Not authenticated');

      // If this is set as default, unset other defaults of same type
      if (template.is_default) {
        await supabase
          .from('document_templates')
          .update({ is_default: false })
          .eq('document_type', template.document_type);
      }

      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          ...template,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['default-template'] });
      toast.success('Predložak uspješno kreiran!');
    },
    onError: (error) => {
      toast.error('Greška pri kreiranju predloška: ' + error.message);
    },
  });
}

export function useUpdateDocumentTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...template }: Partial<DocumentTemplate> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');

      // If this is set as default, unset other defaults of same type
      if (template.is_default && template.document_type) {
        await supabase
          .from('document_templates')
          .update({ is_default: false })
          .eq('document_type', template.document_type)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('document_templates')
        .update(template)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      queryClient.invalidateQueries({ queryKey: ['document-template'] });
      queryClient.invalidateQueries({ queryKey: ['default-template'] });
      toast.success('Predložak uspješno ažuriran!');
    },
    onError: (error) => {
      toast.error('Greška pri ažuriranju predloška: ' + error.message);
    },
  });
}

export function useDeleteDocumentTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-templates'] });
      toast.success('Predložak uspješno obrisan!');
    },
    onError: (error) => {
      toast.error('Greška pri brisanju predloška: ' + error.message);
    },
  });
}
