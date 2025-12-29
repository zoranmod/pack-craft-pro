export type DocumentType = 'otpremnica' | 'ponuda' | 'nalog-dostava-montaza' | 'racun' | 'ugovor';

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

export interface DocumentContractArticle {
  id: string;
  articleNumber: number;
  title: string;
  content: string;
  sortOrder: number;
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
  clientOib?: string;
  items: DocumentItem[];
  notes?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  contractArticles?: DocumentContractArticle[];
}

export const documentTypeLabels: Record<DocumentType, string> = {
  'otpremnica': 'Otpremnica',
  'ponuda': 'Ponuda',
  'nalog-dostava-montaza': 'Nalog za dostavu i montažu',
  'racun': 'Račun',
  'ugovor': 'Ugovor',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  'draft': 'Nacrt',
  'pending': 'Na čekanju',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

// Document flow: Ponuda → Ugovor → Otpremnica → Račun
export const documentFlowOrder: DocumentType[] = ['ponuda', 'ugovor', 'otpremnica', 'racun'];

// Get the next document type in the flow (nalog-dostava-montaza maps to otpremnica flow)
export const getNextDocumentType = (currentType: DocumentType): DocumentType | null => {
  const effectiveType = currentType === 'nalog-dostava-montaza' ? 'otpremnica' : currentType;
  const currentIndex = documentFlowOrder.indexOf(effectiveType);
  if (currentIndex === -1 || currentIndex === documentFlowOrder.length - 1) {
    return null;
  }
  return documentFlowOrder[currentIndex + 1];
};

// Get label for next document action
export const getNextDocumentLabel = (currentType: DocumentType): string | null => {
  const nextType = getNextDocumentType(currentType);
  if (!nextType) return null;
  
  const labels: Record<DocumentType, string> = {
    'ponuda': 'Kreiraj ponudu',
    'ugovor': 'Kreiraj ugovor',
    'otpremnica': 'Kreiraj otpremnicu',
    'racun': 'Kreiraj račun',
    'nalog-dostava-montaza': 'Kreiraj nalog',
  };
  return labels[nextType];
};
