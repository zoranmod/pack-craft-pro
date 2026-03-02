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
  city: string | null;
  postal_code: string | null;
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
  payment_method: string | null;
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
  document_type: 'ponuda' | 'racun' | 'potvrda_rezervacije' | 'potvrda_uplate';
  number: string;
  date: string;
  total_amount: number;
  status: string;
  pdf_data: any;
  guest_name: string | null;
  notes: string | null;
  payment_method: string | null;
  due_date: string | null;
  deposit_amount: number;
  validity_days: number;
  created_at: string;
  updated_at: string;
}

export interface ApartmentPriceEntry {
  id: string;
  owner_user_id: string;
  unit_type: 'apartment' | 'room';
  persons: number;
  price_without_breakfast: number;
  price_with_breakfast: number;
  created_at: string;
  updated_at: string;
}

export const PAYMENT_METHODS = [
  { value: 'gotovinski', label: 'Gotovinski' },
  { value: 'transakcijski', label: 'Transakcijski' },
  { value: 'booking', label: 'Booking.com' },
] as const;

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ponuda: 'Ponuda',
  racun: 'Račun',
  potvrda_rezervacije: 'Potvrda rezervacije',
  potvrda_uplate: 'Potvrda uplate',
};

export function getGuestDisplayName(guest: ApartmentGuest): string {
  if (guest.guest_type === 'pravno_lice') {
    return guest.company_name || 'Nepoznato pravno lice';
  }
  return [guest.first_name, guest.last_name].filter(Boolean).join(' ') || 'Nepoznati gost';
}

export const APARTMENT_COMPANY_INFO = {
  name: 'Apartmani Špoljar',
  fullName: 'Apartmani Špoljar - Ugostiteljske usluge u domaćinstvu',
  owner: 'Mario Špoljar',
  address: 'Veliki kraj 133, 32270 Županja',
  oib: '93483491514',
  iban: 'HR2123400093206330292',
  ziroRacun: 'HR2823400093102324341',
  swift: 'PBZGHR2X',
  bankName: 'Privredna banka Zagreb',
  phone: '098 217 427',
  email: 'apartmani.spoljar@gmail.com',
  pdvNote: 'Pdv nije uračunat u cijenu temeljem čl 90. st. 2. Zakona o PDV-u',
  taxNote: 'Boravišna pristojba je uračunata u cijenu apartmana',
} as const;

export function getGuestFullAddress(guest: ApartmentGuest): string {
  const parts = [guest.address, guest.postal_code, guest.city, guest.country].filter(Boolean);
  return parts.join(', ');
}

export function calculateReservationTotal(
  adults: number,
  children: number,
  nights: number,
  pricePerNight: number,
  breakfastIncluded: boolean,
  breakfastPricePerPerson: number,
  touristTaxPerPerson: number
): { accommodation: number; breakfast: number; touristTax: number; total: number } {
  // Flat rate per night (from price list, already includes all persons)
  const accommodation = pricePerNight * nights;
  const totalPersons = adults + children;
  const breakfast = breakfastIncluded ? breakfastPricePerPerson * totalPersons * nights : 0;
  const touristTax = touristTaxPerPerson * adults * nights; // tax only for adults
  const total = accommodation + breakfast + touristTax;
  return { accommodation, breakfast, touristTax, total };
}
