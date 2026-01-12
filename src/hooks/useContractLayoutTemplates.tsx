import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ContractLayoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  html_content: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateContractLayoutTemplate = Omit<ContractLayoutTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Default WYSIWYG template content
export const defaultContractHtmlContent = `
<h1 style="text-align: center;">UGOVOR O IZRADI NAMJEŠTAJA PO MJERI</h1>

<p style="text-align: right;"><strong>Broj: {broj_dokumenta}</strong></p>
<p style="text-align: right;">Datum: {datum}</p>

<hr />

<p>U {mjesto}, dana {datum} godine, sklapaju:</p>

<h2>1. PRODAVATELJ:</h2>
<p>
<strong>{naziv_prodavatelja}</strong><br />
{adresa_prodavatelja}<br />
OIB: {oib_prodavatelja}<br />
IBAN: {iban_prodavatelja}
</p>

<h2>2. KUPAC:</h2>
<p>
<strong>{ime_kupca}</strong><br />
{adresa_kupca}<br />
OIB: {oib_kupca}<br />
Tel: {telefon_kupca}<br />
Email: {email_kupca}
</p>

<hr />

<h3>Članak 1. – Predmet ugovora</h3>
<p>KUPAC naručuje, a PRODAVATELJ izrađuje namještaj po mjeri prema specifikaciji koja je sastavni dio ovog ugovora.</p>

<h3>Članak 2. – Cijena</h3>
<p>Ukupna cijena ugovorenog namještaja i usluga iznosi: <strong>{ukupna_cijena}</strong></p>

<h3>Članak 3. – Uključeno u cijenu</h3>
<p>U navedenu cijenu uključeno je:</p>
<ul>
<li>dostava do kupca</li>
<li>montaža</li>
<li>ugradnja svih ugradbenih uređaja</li>
</ul>

<h3>Članak 4. – Rok isporuke</h3>
<p>PRODAVATELJ se obvezuje ugovorene proizvode isporučiti u roku od <strong>{rok_isporuke}</strong> radnih dana.</p>

<h3>Članak 5. – Predujam</h3>
<p>Prilikom potpisivanja ovog ugovora KUPAC plaća predujam u iznosu: <strong>{predujam}</strong></p>
<p>Ostatak za uplatu: <strong>{ostatak}</strong></p>

<h3>Članak 6. – Jamstvo</h3>
<p>Jamstveni rok za isporučeni namještaj iznosi: <strong>{jamstveni_rok}</strong></p>

<hr />

<h3>POTPISI</h3>

<table style="width: 100%;">
<tr>
<td style="width: 50%; text-align: center;">
<p>ZA PRODAVATELJA:</p>
<br /><br /><br />
<p>_______________________</p>
<p>{naziv_prodavatelja}</p>
</td>
<td style="width: 50%; text-align: center;">
<p>ZA KUPCA:</p>
<br /><br /><br />
<p>_______________________</p>
<p>{ime_kupca}</p>
</td>
</tr>
</table>
`;

// Fetch all contract layout templates
export function useContractLayoutTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contract-layout-templates'],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('contract_layout_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ContractLayoutTemplate[];
    },
    enabled: !!user?.id,
  });
}

// Fetch single template
export function useContractLayoutTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['contract-layout-template', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('contract_layout_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as ContractLayoutTemplate;
    },
    enabled: !!id,
  });
}

// Fetch default template
export function useDefaultContractLayoutTemplate() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contract-layout-template-default'],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('contract_layout_templates')
        .select('*')
        .eq('is_default', true)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as ContractLayoutTemplate | null;
    },
    enabled: !!user?.id,
  });
}

// Create template
export function useCreateContractLayoutTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: CreateContractLayoutTemplate) => {
      if (!user?.id) throw new Error('User not authenticated');

      // If setting as default, unset other defaults first
      if (template.is_default) {
        await supabase
          .from('contract_layout_templates')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('contract_layout_templates')
        .insert({ ...template, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-layout-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-layout-template-default'] });
      toast.success('Predložak uspješno kreiran!');
    },
    onError: (error) => {
      console.error('Error creating template:', error);
      toast.error('Greška pri kreiranju predloška');
    },
  });
}

// Update template
export function useUpdateContractLayoutTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContractLayoutTemplate> & { id: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // If setting as default, unset other defaults first
      if (updates.is_default) {
        await supabase
          .from('contract_layout_templates')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', id);
      }

      const { data, error } = await supabase
        .from('contract_layout_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contract-layout-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-layout-template', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contract-layout-template-default'] });
      toast.success('Predložak uspješno ažuriran!');
    },
    onError: (error) => {
      console.error('Error updating template:', error);
      toast.error('Greška pri ažuriranju predloška');
    },
  });
}

// Delete template
export function useDeleteContractLayoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contract_layout_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-layout-templates'] });
      queryClient.invalidateQueries({ queryKey: ['contract-layout-template-default'] });
      toast.success('Predložak uspješno obrisan!');
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
      toast.error('Greška pri brisanju predloška');
    },
  });
}
