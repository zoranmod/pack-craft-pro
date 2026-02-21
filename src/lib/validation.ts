// Validation utilities for documents

// BiH JIB validation (13 digits)
export const validateOIB = (oib: string): { valid: boolean; message: string } => {
  // JIB is optional
  if (!oib || oib.trim() === '') {
    return { valid: true, message: '' };
  }

  // Must be exactly 13 digits for BiH JIB
  if (!/^\d{13}$/.test(oib)) {
    return { valid: false, message: 'JIB mora sadržavati tačno 13 znamenki' };
  }

  return { valid: true, message: '' };
};

// Validate quantity
export const validateQuantity = (quantity: number): { valid: boolean; message: string } => {
  if (quantity <= 0) {
    return { valid: false, message: 'Količina mora biti veća od 0' };
  }
  return { valid: true, message: '' };
};

// Validate price
export const validatePrice = (price: number): { valid: boolean; message: string } => {
  if (price < 0) {
    return { valid: false, message: 'Cijena ne može biti negativna' };
  }
  return { valid: true, message: '' };
};

// Validate PDV
export const validatePDV = (pdv: number): { valid: boolean; message: string } => {
  if (pdv < 0 || pdv > 100) {
    return { valid: false, message: 'PDV mora biti između 0% i 100%' };
  }
  return { valid: true, message: '' };
};

// Validate discount
export const validateDiscount = (discount: number): { valid: boolean; message: string } => {
  if (discount < 0 || discount > 100) {
    return { valid: false, message: 'Rabat mora biti između 0% i 100%' };
  }
  return { valid: true, message: '' };
};

// Document item validation
export interface DocumentItemValidation {
  name: string;
  quantity: number;
  price: number;
  pdv: number;
  discount: number;
}

export const validateDocumentItems = (
  items: DocumentItemValidation[],
  hasPrices: boolean
): { valid: boolean; message: string; itemIndex?: number } => {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Name is required
    if (!item.name || item.name.trim() === '') {
      return { valid: false, message: `Stavka ${i + 1}: Naziv je obavezan`, itemIndex: i };
    }
    
    // Quantity validation
    const qtyValidation = validateQuantity(item.quantity);
    if (!qtyValidation.valid) {
      return { valid: false, message: `Stavka ${i + 1}: ${qtyValidation.message}`, itemIndex: i };
    }
    
    // For document types with prices
    if (hasPrices) {
      const priceValidation = validatePrice(item.price);
      if (!priceValidation.valid) {
        return { valid: false, message: `Stavka ${i + 1}: ${priceValidation.message}`, itemIndex: i };
      }
      
      const pdvValidation = validatePDV(item.pdv);
      if (!pdvValidation.valid) {
        return { valid: false, message: `Stavka ${i + 1}: ${pdvValidation.message}`, itemIndex: i };
      }
      
      const discountValidation = validateDiscount(item.discount);
      if (!discountValidation.valid) {
        return { valid: false, message: `Stavka ${i + 1}: ${discountValidation.message}`, itemIndex: i };
      }
    }
  }
  
  return { valid: true, message: '' };
};
