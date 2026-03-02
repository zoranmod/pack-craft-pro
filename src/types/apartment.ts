export interface ApartmentUser {
  id: string;
  auth_user_id: string;
  owner_user_id: string;
  name: string;
  role: 'admin' | 'receptionist';
  created_at: string;
  updated_at: string;
}

export interface ApartmentUnit {
  id: string;
  owner_user_id: string;
  name: string;
  unit_type: 'apartment' | 'room';
  capacity: number;
  price_per_person: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApartmentGuest {
  id: string;
  owner_user_id: string;
  guest_type: 'fizicko_lice' | 'pravno_lice';
  first_name: string | null;
  last_name: string | null;
  id_number: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  company_name: string | null;
  jib: string | null;
  pdv_number: string | null;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApartmentReservation {
  id: string;
  owner_user_id: string;
  unit_id: string;
  guest_id: string | null;
  check_in: string;
  check_out: string;
  adults: number;
  children: number;
  price_per_person: number;
  breakfast_included: boolean;
  breakfast_price_per_person: number;
  tourist_tax_per_person: number;
  total_amount: number;
  status: 'reserved' | 'checked_in' | 'checked_out' | 'cancelled';
  source: 'manual' | 'booking_com';
  booking_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  unit?: ApartmentUnit;
  guest?: ApartmentGuest;
}

export interface ApartmentDocument {
  id: string;
  owner_user_id: string;
  reservation_id: string | null;
  document_type: 'ponuda' | 'racun';
  number: string;
  date: string;
  total_amount: number;
  status: string;
  pdf_data: any;
  guest_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getGuestDisplayName(guest: ApartmentGuest): string {
  if (guest.guest_type === 'pravno_lice') {
    return guest.company_name || 'Nepoznato pravno lice';
  }
  return [guest.first_name, guest.last_name].filter(Boolean).join(' ') || 'Nepoznati gost';
}

export function calculateReservationTotal(
  adults: number,
  children: number,
  nights: number,
  pricePerPerson: number,
  breakfastIncluded: boolean,
  breakfastPricePerPerson: number,
  touristTaxPerPerson: number
): { accommodation: number; breakfast: number; touristTax: number; total: number } {
  const totalPersons = adults + children;
  const accommodation = pricePerPerson * totalPersons * nights;
  const breakfast = breakfastIncluded ? breakfastPricePerPerson * totalPersons * nights : 0;
  const touristTax = touristTaxPerPerson * adults * nights; // tax only for adults
  const total = accommodation + breakfast + touristTax;
  return { accommodation, breakfast, touristTax, total };
}
