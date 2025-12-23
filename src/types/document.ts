export type DocumentType = 'otpremnica' | 'ponuda' | 'nalog-dostava' | 'nalog-montaza';

export type DocumentStatus = 'draft' | 'pending' | 'completed' | 'cancelled';

export interface DocumentItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number; // postotak rabata
  pdv: number; // postotak PDV-a
  subtotal: number; // prije rabata i PDV-a
  total: number; // konačni iznos s rabatom i PDV-om
}

export interface Document {
  id: string;
  type: DocumentType;
  number: string;
  date: string;
  status: DocumentStatus;
  clientName: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  items: DocumentItem[];
  notes?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export const documentTypeLabels: Record<DocumentType, string> = {
  'otpremnica': 'Otpremnica',
  'ponuda': 'Ponuda',
  'nalog-dostava': 'Nalog za dostavu',
  'nalog-montaza': 'Nalog za montažu',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  'draft': 'Nacrt',
  'pending': 'Na čekanju',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};
