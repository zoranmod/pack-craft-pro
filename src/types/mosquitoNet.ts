export interface MosquitoNetProduct {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  price_per_m2: number;
  color: string | null;
  product_type: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MosquitoNetLocation {
  id: string;
  user_id: string;
  place_name: string;
  measurement_price: number;
  window_installation_price: number;
  door_installation_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MosquitoNetQuoteItem {
  id: string;
  document_id: string;
  section_type: 'komarnici' | 'mjerenje' | 'ugradnja';
  sort_order: number;
  // For komarnici section
  product_id: string | null;
  product_name: string | null;
  width_cm: number | null;
  height_cm: number | null;
  calculated_m2: number | null;
  unit_price: number | null;
  quantity: number;
  // For mjerenje/ugradnja sections
  location_id: string | null;
  location_name: string | null;
  measurement_price: number | null;
  window_count: number;
  door_count: number;
  window_price: number | null;
  door_price: number | null;
  // Common
  total: number;
  created_at: string;
}

// Form state types
export interface KomarnikItem {
  id: string;
  product_id: string;
  product_name: string;
  width_cm: number;
  height_cm: number;
  calculated_m2: number;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface MjerenjeItem {
  id: string;
  location_id: string;
  location_name: string;
  measurement_price: number;
  total: number;
}

export interface UgradnjaItem {
  id: string;
  location_id: string;
  location_name: string;
  window_count: number;
  door_count: number;
  window_price: number;
  door_price: number;
  total: number;
}
