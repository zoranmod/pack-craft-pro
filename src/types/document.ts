export type DocumentType = 'otpremnica' | 'ponuda' | 'nalog-dostava-montaza' | 'racun' | 'ugovor';

export type DocumentStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface DocumentItem {
  id: string;
  name: string;
  code?: string; // šifra artikla
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
  templateId?: string;
  paymentMethod?: string;
  validityDays?: number;
  deliveryDays?: number;
  preparedBy?: string;
  contactPerson?: string;
  deliveryAddress?: string;
  monter1?: string;
  monter2?: string;
  customHtmlContent?: string | null; // WYSIWYG custom content
}

export const documentTypeLabels: Record<DocumentType, string> = {
  'otpremnica': 'Otpremnica',
  'ponuda': 'Ponuda',
  'nalog-dostava-montaza': 'Nalog za dostavu i montažu',
  'racun': 'Račun',
  'ugovor': 'Ugovor',
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  'draft': 'U pripremi',
  'sent': 'Poslano',
  'accepted': 'Prihvaćeno',
  'rejected': 'Odbijeno',
  'completed': 'Završeno',
  'cancelled': 'Otkazano',
};

// Status workflow for quotes (ponuda)
export const quoteStatusFlow: DocumentStatus[] = ['draft', 'sent', 'accepted'];
export const getNextQuoteStatus = (current: DocumentStatus): DocumentStatus | null => {
  const currentIndex = quoteStatusFlow.indexOf(current);
  if (currentIndex === -1 || currentIndex === quoteStatusFlow.length - 1) return null;
  return quoteStatusFlow[currentIndex + 1];
};

// Status workflow for contracts (ugovor)
export const contractStatusFlow: DocumentStatus[] = ['draft', 'sent', 'accepted'];

// Status workflow for delivery notes (otpremnica/nalog)
export const deliveryStatusFlow: DocumentStatus[] = ['draft', 'completed'];

// Status workflow for invoices (racun)
export const invoiceStatusFlow: DocumentStatus[] = ['draft', 'sent', 'completed'];

// Get status flow for a document type
export const getStatusFlowForType = (type: DocumentType): DocumentStatus[] => {
  switch (type) {
    case 'ponuda':
      return quoteStatusFlow;
    case 'ugovor':
      return contractStatusFlow;
    case 'otpremnica':
    case 'nalog-dostava-montaza':
      return deliveryStatusFlow;
    case 'racun':
      return invoiceStatusFlow;
    default:
      return ['draft'];
  }
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

// Get available conversion targets for a document type
export const getConversionTargets = (currentType: DocumentType, status: DocumentStatus): DocumentType[] => {
  const targets: DocumentType[] = [];
  
  // Only allow conversion from accepted/completed documents
  if (currentType === 'ponuda' && status === 'accepted') {
    targets.push('ugovor', 'otpremnica');
  } else if (currentType === 'ugovor' && status === 'accepted') {
    targets.push('otpremnica');
  } else if ((currentType === 'otpremnica' || currentType === 'nalog-dostava-montaza') && status === 'completed') {
    targets.push('racun');
  }
  
  return targets;
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
