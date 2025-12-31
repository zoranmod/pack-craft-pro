export interface CompanySettings {
  id?: string;
  user_id?: string;
  company_name: string;
  address: string;
  oib: string;
  iban: string;
  logo_url?: string;
  
  // Extended fields
  pdv_id?: string;
  iban_2?: string;
  swift_1?: string;
  swift_2?: string;
  bank_name_1?: string;
  bank_name_2?: string;
  phone_main?: string;
  phone_sales?: string;
  phone_accounting?: string;
  website?: string;
  email_info?: string;
  registration_court?: string;
  registration_number?: string;
  capital_amount?: string;
  director_name?: string;
  
  // Print/PDF layout settings
  print_footer_bottom_mm?: number;
  print_footer_max_height_mm?: number;
  print_content_bottom_padding_mm?: number;
}

export const defaultCompanySettings: CompanySettings = {
  company_name: '',
  address: '',
  oib: '',
  iban: '',
  logo_url: '',
  pdv_id: '',
  iban_2: '',
  swift_1: '',
  swift_2: '',
  bank_name_1: '',
  bank_name_2: '',
  phone_main: '',
  phone_sales: '',
  phone_accounting: '',
  website: '',
  email_info: '',
  registration_court: '',
  registration_number: '',
  capital_amount: '',
  director_name: '',
  print_footer_bottom_mm: 14,
  print_footer_max_height_mm: 14,
  print_content_bottom_padding_mm: 42,
};
