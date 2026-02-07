import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Loader2, FileText, Bookmark, FileCheck, AlertCircle } from 'lucide-react';
import { DocumentType, DocumentItem, documentTypeLabels } from '@/types/document';
import { ContractArticleFormData } from '@/types/contractArticle';
import { toast } from 'sonner';
import { round2, formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateOIB, validateDocumentItems } from '@/lib/validation';
import { AutoResizeTextarea } from '@/components/ui/auto-resize-textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateDocument, useDocument, useUpdateDocument } from '@/hooks/useDocuments';
import { useContractArticleTemplates, useSaveDocumentContractArticles, useInitializeDefaultTemplates } from '@/hooks/useContractArticles';
import { ClientAutocomplete } from '@/components/clients/ClientAutocomplete';
import { NewClientModal, NewClientData } from '@/components/clients/NewClientModal';
import { ArticleAutocomplete } from '@/components/articles/ArticleAutocomplete';
import { ContractArticlesEditor } from '@/components/contracts/ContractArticlesEditor';
import { QuickTemplates } from '@/components/articles/QuickTemplates';
import { Client, useCreateClient } from '@/hooks/useClients';
import { Article, useSaveAsTemplate } from '@/hooks/useArticles';
import { useDefaultTemplate, useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useSettings';
import { useCurrentEmployee } from '@/hooks/useCurrentEmployee';

// Helper function to calculate item totals with rounding
const calculateItemTotals = (item: Omit<DocumentItem, 'id'>) => {
  const subtotal = round2(item.quantity * item.price);
  const discountAmount = round2(subtotal * (item.discount / 100));
  const afterDiscount = round2(subtotal - discountAmount);
  const pdvAmount = round2(afterDiscount * (item.pdv / 100));
  const total = round2(afterDiscount + pdvAmount);
  return { subtotal, total };
};

interface DocumentFormProps {
  fixedType?: DocumentType;
}

export function DocumentForm({ fixedType }: DocumentFormProps) {
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!documentId;
  
  // Get current user info for auto-fill
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile();
  const { employee } = useCurrentEmployee();

  // Determine document type: fixedType > URL param > default
  const typeParam = searchParams.get('type');
  const typeFromUrl: DocumentType = typeParam && typeParam in documentTypeLabels
    ? (typeParam as DocumentType)
    : 'ponuda';
  
  // If fixedType is provided, use it; otherwise use URL param
  const initialType = fixedType || typeFromUrl;
  // Type is locked if fixedType is provided OR in edit mode
  const isTypeLocked = !!fixedType || isEditMode;

  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const { data: existingDocument, isLoading: isLoadingDocument } = useDocument(documentId || '');
  
  // Get display name for auto-fill - prioritize employee data, then user profile
  const getCurrentUserDisplayName = () => {
    // First check if user is an employee
    if (employee?.first_name || employee?.last_name) {
      return [employee.first_name, employee.last_name].filter(Boolean).join(' ');
    }
    // Then check user profile (for owner/admin)
    if (userProfile?.first_name || userProfile?.last_name) {
      return [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ');
    }
    return user?.email?.split('@')[0] || '';
  };

  const [formData, setFormData] = useState(() => ({
    type: initialType,
    clientName: '',
    clientOib: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    notes: '',
    paymentMethod: '',
    validityDays: 15,
    deliveryDays: 60,
    preparedBy: '',
    contactPerson: '',
    deliveryAddress: '',
    monter1: '',
    monter2: '',
  }));

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<{
    clientName?: string;
    clientAddress?: string;
    clientOib?: string;
    items?: { index: number; message: string }[];
  }>({});

  // Template state
  const { data: defaultTemplate, isLoading: isLoadingTemplate } = useDefaultTemplate(formData.type);
  const { data: allTemplates = [] } = useDocumentTemplates(formData.type);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // Get the active template (selected or default)
  const activeTemplate = selectedTemplateId 
    ? allTemplates.find(t => t.id === selectedTemplateId) 
    : defaultTemplate;

  // Apply default template values when template loads
  useEffect(() => {
    if (activeTemplate && !selectedTemplateId) {
      setSelectedTemplateId(activeTemplate.id);
      setFormData(prev => ({
        ...prev,
        paymentMethod: activeTemplate.default_payment_method || prev.paymentMethod,
        validityDays: activeTemplate.default_validity_days || prev.validityDays,
        deliveryDays: activeTemplate.default_delivery_days || prev.deliveryDays,
      }));
    }
  }, [activeTemplate, selectedTemplateId]);

  // Sync with URL type param only if type is NOT locked
  useEffect(() => {
    if (!isTypeLocked && formData.type !== typeFromUrl) {
      setFormData(prev => ({ ...prev, type: typeFromUrl }));
      setSelectedTemplateId(null);
    }
  }, [typeFromUrl, isTypeLocked]);

  const [items, setItems] = useState<Omit<DocumentItem, 'id'>[]>([
    { name: '', quantity: 1, unit: 'kom', price: 0, discount: 0, pdv: 25, subtotal: 0, total: 0 },
  ]);

  // Load existing document data when in edit mode
  useEffect(() => {
    if (isEditMode && existingDocument) {
      setFormData({
        type: existingDocument.type,
        clientName: existingDocument.clientName,
        clientOib: existingDocument.clientOib || '',
        clientAddress: existingDocument.clientAddress,
        clientPhone: existingDocument.clientPhone || '',
        clientEmail: existingDocument.clientEmail || '',
        notes: existingDocument.notes || '',
        paymentMethod: existingDocument.paymentMethod || '',
        validityDays: existingDocument.validityDays || 15,
        deliveryDays: existingDocument.deliveryDays || 60,
        preparedBy: existingDocument.preparedBy || '',
        contactPerson: existingDocument.contactPerson || '',
        deliveryAddress: existingDocument.deliveryAddress || '',
        monter1: existingDocument.monter1 || '',
        monter2: existingDocument.monter2 || '',
      });
      setItems(existingDocument.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        discount: item.discount,
        pdv: item.pdv,
        subtotal: item.subtotal,
        total: item.total,
      })));
      if (existingDocument.templateId) {
        setSelectedTemplateId(existingDocument.templateId);
      }
      // Load contract articles from existing document
      if (existingDocument.type === 'ugovor' && existingDocument.contractArticles?.length) {
        setContractArticles(existingDocument.contractArticles.map(article => ({
          article_number: article.articleNumber,
          title: article.title,
          content: article.content,
          is_selected: true,
        })));
      }
    }
  }, [isEditMode, existingDocument]);
  
  // Auto-fill preparedBy with current user's full name when creating new document
  useEffect(() => {
    if (!isEditMode) {
      // Priority: employee name > user profile name
      const fullName = employee?.first_name || employee?.last_name
        ? [employee.first_name, employee.last_name].filter(Boolean).join(' ')
        : userProfile?.first_name || userProfile?.last_name
          ? [userProfile.first_name, userProfile.last_name].filter(Boolean).join(' ')
          : null;
      
      if (fullName && !formData.preparedBy) {
        setFormData(prev => ({ ...prev, preparedBy: fullName }));
      }
    }
  }, [isEditMode, employee, userProfile]);


  // Contract articles state
  const { data: articleTemplates = [] } = useContractArticleTemplates();
  const initializeTemplates = useInitializeDefaultTemplates();
  const saveDocumentArticles = useSaveDocumentContractArticles();
  const saveAsTemplate = useSaveAsTemplate();
  const createClient = useCreateClient();
  const [contractArticles, setContractArticles] = useState<ContractArticleFormData[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  
  // New client modal state
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Initialize contract articles when templates load (for ugovor type)
  useEffect(() => {
    if (formData.type === 'ugovor' && articleTemplates.length === 0) {
      initializeTemplates.mutate();
    }
  }, [formData.type, articleTemplates.length]);

  useEffect(() => {
    // Only load from templates for NEW contracts (not edit mode)
    // and only if no articles have been loaded yet
    if (!isEditMode && formData.type === 'ugovor' && articleTemplates.length > 0 && contractArticles.length === 0) {
      setContractArticles(
        articleTemplates
          .filter(t => t.is_active)
          .map(t => ({
            article_number: t.article_number,
            title: t.title,
            content: t.content,
            is_selected: true,
          }))
      );
    }
  }, [formData.type, articleTemplates, isEditMode]);

  // Document type specific rules - ponuda, račun and ugovor have prices
  const hasPrices = ['ponuda', 'racun', 'ugovor'].includes(formData.type);
  const isContract = formData.type === 'ugovor';

  // Calculate totals BEFORE the useEffect that uses them
  const subtotalAmount = hasPrices ? round2(items.reduce((sum, item) => sum + item.subtotal, 0)) : 0;
  const totalDiscount = hasPrices ? round2(items.reduce((sum, item) => sum + round2(item.subtotal * (item.discount / 100)), 0)) : 0;
  const totalPdv = hasPrices ? round2(items.reduce((sum, item) => {
    const afterDiscount = round2(item.subtotal - round2(item.subtotal * (item.discount / 100)));
    return sum + round2(afterDiscount * (item.pdv / 100));
  }, 0)) : 0;
  const totalAmount = hasPrices ? round2(items.reduce((sum, item) => sum + item.total, 0)) : 0;

  // Update placeholder values based on form data
  useEffect(() => {
    setPlaceholderValues(prev => ({
      ...prev,
      adresa_kupca: formData.clientAddress,
      ukupna_cijena: totalAmount.toLocaleString('hr-HR', { minimumFractionDigits: 2 }),
      predujam: prev.predujam || '',
      ostatak: prev.predujam ? (totalAmount - parseFloat(prev.predujam.replace(',', '.') || '0')).toLocaleString('hr-HR', { minimumFractionDigits: 2 }) : '',
      datum_ugovora: new Date().toLocaleDateString('hr-HR'),
      mjesto_ugovora: prev.mjesto_ugovora || '',
    }));
  }, [formData.clientAddress, totalAmount]);

  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, unit: 'kom', price: 0, discount: 0, pdv: 25, subtotal: 0, total: 0 }]);
  };

  const addTemplateItem = (template: Article) => {
    const newItem: Omit<DocumentItem, 'id'> = {
      name: template.name,
      quantity: 1,
      unit: template.unit,
      price: template.price,
      discount: 0,
      pdv: template.pdv,
      subtotal: 0,
      total: 0,
    };
    if (hasPrices) {
      const { subtotal, total } = calculateItemTotals(newItem);
      newItem.subtotal = subtotal;
      newItem.total = total;
    }
    setItems([...items, newItem]);
  };

  const saveItemAsTemplate = (item: Omit<DocumentItem, 'id'>) => {
    if (!item.name) return;
    saveAsTemplate.mutate({
      name: item.name,
      unit: item.unit,
      price: item.price,
      pdv: item.pdv,
    });
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Omit<DocumentItem, 'id'>, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate totals when relevant fields change (only for types with prices)
    if (hasPrices && ['quantity', 'price', 'discount', 'pdv'].includes(field)) {
      const { subtotal, total } = calculateItemTotals(newItems[index]);
      newItems[index].subtotal = subtotal;
      newItems[index].total = total;
    }
    
    setItems(newItems);
  };

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => {
      const updated = { ...prev, [key]: value };
      // Auto-calculate ostatak when predujam changes
      if (key === 'predujam') {
        const predujamValue = parseFloat(value.replace(',', '.') || '0');
        updated.ostatak = (totalAmount - predujamValue).toLocaleString('hr-HR', { minimumFractionDigits: 2 });
      }
      return updated;
    });
  };

  // Handle saving new client from modal
  const handleSaveNewClient = async (data: NewClientData) => {
    setIsCreatingClient(true);
    try {
      const result = await createClient.mutateAsync({
        name: data.name,
        client_type: data.client_type,
        oib: data.oib,
        address: data.address,
        phone: data.phone,
        email: data.email,
        notes: data.contact_person ? `Kontakt: ${data.contact_person}` : undefined,
      });
      
      if (result?.client) {
        const client = result.client;
        // Auto-fill form with client data (new or existing)
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          clientOib: client.oib || '',
          clientAddress: [client.address, client.postal_code, client.city].filter(Boolean).join(', '),
          clientPhone: client.phone || '',
          clientEmail: client.email || '',
        }));
        
        // Apply client's default PDV to all items
        if (hasPrices) {
          setItems(prevItems => prevItems.map(item => {
            const updatedItem = { ...item, pdv: client.default_pdv };
            const { subtotal, total } = calculateItemTotals(updatedItem);
            return { ...updatedItem, subtotal, total };
          }));
        }
        
        setShowNewClientModal(false);
      }
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    const errors: typeof validationErrors = {};
    
    // Client name validation
    if (!formData.clientName || formData.clientName.trim() === '') {
      errors.clientName = 'Naziv klijenta je obavezan';
    }
    
    // Client address validation
    if (!formData.clientAddress || formData.clientAddress.trim() === '') {
      errors.clientAddress = 'Adresa klijenta je obavezna';
    }
    
    // OIB validation
    const oibValidation = validateOIB(formData.clientOib);
    if (!oibValidation.valid) {
      errors.clientOib = oibValidation.message;
    }
    
    // Items validation
    const itemsValidation = validateDocumentItems(
      items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        pdv: item.pdv,
        discount: item.discount,
      })),
      hasPrices
    );
    
    if (!itemsValidation.valid && itemsValidation.itemIndex !== undefined) {
      errors.items = [{ index: itemsValidation.itemIndex, message: itemsValidation.message }];
    }
    
    // Set errors and show toast if any
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      const firstError = errors.clientName || errors.clientAddress || errors.clientOib || errors.items?.[0]?.message;
      toast.error(firstError || 'Molimo ispravite greške u obrascu');
      return;
    }

    const documentData = {
      type: formData.type as DocumentType,
      clientName: formData.clientName,
      clientOib: formData.clientOib || undefined,
      clientAddress: formData.clientAddress,
      clientPhone: formData.clientPhone || undefined,
      clientEmail: formData.clientEmail || undefined,
      notes: formData.notes || undefined,
      items,
      templateId: selectedTemplateId || undefined,
      paymentMethod: formData.paymentMethod || undefined,
      validityDays: formData.validityDays,
      deliveryDays: formData.deliveryDays,
      preparedBy: formData.preparedBy || undefined,
      contactPerson: formData.contactPerson || undefined,
      deliveryAddress: formData.deliveryAddress || undefined,
      monter1: formData.monter1 || undefined,
      monter2: formData.monter2 || undefined,
    };

    // Update or create the document
    const document = isEditMode && documentId
      ? await updateDocument.mutateAsync({ id: documentId, data: documentData })
      : await createDocument.mutateAsync(documentData);

    // If it's a contract, save the contract articles
    if (isContract && document?.id) {
      const selectedArticles = contractArticles
        .filter(a => a.is_selected)
        .map((article, index) => {
          // Replace placeholders in content
          let content = article.content;
          Object.entries(placeholderValues).forEach(([key, value]) => {
            content = content.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `{${key}}`);
          });
          return {
            article_number: index + 1,
            title: article.title,
            content,
            sort_order: index,
          };
        });

      await saveDocumentArticles.mutateAsync({
        documentId: document.id,
        articles: selectedArticles,
      });
    }
    
    navigate('/documents');
  };

  const isSaving = createDocument.isPending || updateDocument.isPending;

  if (isEditMode && isLoadingDocument) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background py-4 -mx-4 px-4 border-b border-border shadow-sm flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Natrag
        </Button>
        <Button type="submit" className="gap-2 btn-float" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditMode ? 'Spremi promjene' : 'Spremi dokument'}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Type - show dropdown only when NOT locked */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Vrsta dokumenta</h2>
            {isTypeLocked ? (
              // Read-only display when type is locked
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md border border-border">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {documentTypeLabels[formData.type]}
                </span>
              </div>
            ) : (
              // Editable dropdown when type is not locked
              <Select
                value={formData.type}
                onValueChange={(value: DocumentType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Template Selection */}
            {allTemplates.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <Label className="text-muted-foreground">Predložak dokumenta</Label>
                <Select
                  value={selectedTemplateId || ''}
                  onValueChange={(value) => {
                    setSelectedTemplateId(value);
                    const template = allTemplates.find(t => t.id === value);
                    if (template) {
                      setFormData(prev => ({
                        ...prev,
                        paymentMethod: template.default_payment_method || prev.paymentMethod,
                        validityDays: template.default_validity_days || prev.validityDays,
                        deliveryDays: template.default_delivery_days || prev.deliveryDays,
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberite predložak" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-muted-foreground" />
                          {template.name}
                          {template.is_default && (
                            <span className="text-xs text-primary">(zadani)</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeTemplate && (
                  <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    Koristi predložak: {activeTemplate.name}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Client Info */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Podaci o klijentu</h2>
            
            {/* Add New Client Button - Primary Action */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewClientModal(true)}
              className="w-full mb-4 gap-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 hover:border-primary"
            >
              <Plus className="h-4 w-4" />
              Dodaj novog klijenta
            </Button>
            
            {/* Quick Client Picker */}
            <div className="mb-4">
              <Label className="text-muted-foreground text-sm">Brzi odabir postojećeg klijenta</Label>
              <div className="mt-1.5">
                <ClientAutocomplete
                  value={formData.clientName}
                  onSelect={(client: Client) => {
                    setFormData({
                      ...formData,
                      clientName: client.name,
                      clientOib: client.oib || '',
                      clientAddress: [client.address, client.postal_code, client.city].filter(Boolean).join(', '),
                      clientPhone: client.phone || '',
                      clientEmail: client.email || '',
                    });
                    // Apply client's default PDV to all items
                    if (hasPrices) {
                      setItems(prevItems => prevItems.map(item => {
                        const updatedItem = { ...item, pdv: client.default_pdv };
                        const { subtotal, total } = calculateItemTotals(updatedItem);
                        return { ...updatedItem, subtotal, total };
                      }));
                    }
                  }}
                  placeholder="Odaberi postojećeg klijenta..."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="clientName" className={validationErrors.clientName ? 'text-destructive' : ''}>
                  Naziv klijenta *
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => {
                    setFormData({ ...formData, clientName: e.target.value });
                    if (validationErrors.clientName) {
                      setValidationErrors(prev => ({ ...prev, clientName: undefined }));
                    }
                  }}
                  placeholder="Unesite naziv klijenta"
                  className={cn("mt-1.5", validationErrors.clientName && "border-destructive focus-visible:ring-destructive")}
                />
                {validationErrors.clientName && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.clientName}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="clientOib" className={validationErrors.clientOib ? 'text-destructive' : ''}>
                  OIB
                </Label>
                <Input
                  id="clientOib"
                  value={formData.clientOib}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({ ...formData, clientOib: value });
                    if (validationErrors.clientOib) {
                      setValidationErrors(prev => ({ ...prev, clientOib: undefined }));
                    }
                  }}
                  placeholder="12345678901"
                  maxLength={11}
                  className={cn("mt-1.5", validationErrors.clientOib && "border-destructive focus-visible:ring-destructive")}
                />
                {validationErrors.clientOib && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.clientOib}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="clientAddress" className={validationErrors.clientAddress ? 'text-destructive' : ''}>
                  Adresa *
                </Label>
                <Input
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => {
                    setFormData({ ...formData, clientAddress: e.target.value });
                    if (validationErrors.clientAddress) {
                      setValidationErrors(prev => ({ ...prev, clientAddress: undefined }));
                    }
                  }}
                  placeholder="Unesite adresu"
                  className={cn("mt-1.5", validationErrors.clientAddress && "border-destructive focus-visible:ring-destructive")}
                />
                {validationErrors.clientAddress && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.clientAddress}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="clientPhone">Telefon</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="+385 xx xxx xxxx"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  placeholder="email@primjer.hr"
                  className="mt-1.5"
                />
              </div>
              {/* Kontakt osoba i Adresa isporuke - samo za otpremnice i naloge */}
              {(formData.type === 'otpremnica' || formData.type === 'nalog-dostava-montaza') && (
                <>
                  <div>
                    <Label htmlFor="contactPerson">Kontakt osoba</Label>
                    <Input
                      id="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Ime, prezime, broj telefona kontakt osobe"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="deliveryAddress">Adresa isporuke</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                      placeholder="Adresa za isporuku (ako je različita od adrese klijenta)"
                      className="mt-1.5"
                    />
                  </div>
                </>
              )}
              {/* Monteri - samo za naloge dostave i montaže */}
              {formData.type === 'nalog-dostava-montaza' && (
                <>
                  <div>
                    <Label htmlFor="monter1">Monter 1</Label>
                    <Input
                      id="monter1"
                      value={formData.monter1}
                      onChange={(e) => setFormData({ ...formData, monter1: e.target.value })}
                      placeholder="Ime i prezime montera 1"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monter2">Monter 2</Label>
                    <Input
                      id="monter2"
                      value={formData.monter2}
                      onChange={(e) => setFormData({ ...formData, monter2: e.target.value })}
                      placeholder="Ime i prezime montera 2"
                      className="mt-1.5"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <div className="sticky top-20 z-40 bg-card -mx-6 px-6 py-3 mb-4 border-b border-border/50 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Stavke</h2>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj stavku
              </Button>
            </div>

            {/* Quick Templates */}
            <QuickTemplates 
              onSelectTemplate={addTemplateItem} 
              className="mb-4 pb-4 border-b border-border/50"
            />
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-3">
                  {/* First row - Name, Quantity, Unit */}
                  <div className="grid gap-3 sm:grid-cols-12 items-start">
                    <div className={hasPrices ? "sm:col-span-6" : "sm:col-span-6"}>
                      <Label>Naziv</Label>
                      <div className="mt-1.5">
                        <ArticleAutocomplete
                          value={item.name}
                          onChange={(value) => updateItem(index, 'name', value)}
                          onSelect={(article: Article) => {
                            const newItems = [...items];
                            newItems[index] = {
                              ...newItems[index],
                              name: article.name,
                              code: article.code || undefined,
                              unit: article.unit,
                              price: article.price,
                              pdv: article.pdv,
                            };
                            if (hasPrices) {
                              const { subtotal, total } = calculateItemTotals(newItems[index]);
                              newItems[index].subtotal = subtotal;
                              newItems[index].total = total;
                            }
                            setItems(newItems);
                          }}
                          placeholder="Naziv stavke"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Količina</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="mt-1.5"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label>Jedinica</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateItem(index, 'unit', value)}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kom">kom</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="m²">m²</SelectItem>
                          <SelectItem value="usluga">usluga</SelectItem>
                          <SelectItem value="sat">sat</SelectItem>
                          <SelectItem value="kpl">kpl</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Second row - Price, Discount, PDV, Total (only for ponuda) */}
                  {hasPrices && (
                    <div className="grid gap-3 sm:grid-cols-12 items-end">
                      <div className="sm:col-span-3">
                        <Label>Cijena (€)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Rabat (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={item.discount}
                          onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>PDV (%)</Label>
                        <Select
                          value={item.pdv.toString()}
                          onValueChange={(value) => updateItem(index, 'pdv', parseFloat(value))}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="13">13%</SelectItem>
                            <SelectItem value="25">25%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="sm:col-span-2 text-right">
                        <Label className="text-muted-foreground">Osnovica</Label>
                        <p className="mt-1.5 py-2 text-sm text-muted-foreground">
                          {formatCurrency(item.subtotal)} €
                        </p>
                      </div>
                      <div className="sm:col-span-2 text-right">
                        <Label>Ukupno</Label>
                        <p className="mt-1.5 py-2 font-semibold text-foreground">
                          {formatCurrency(item.total)} €
                        </p>
                      </div>
                      <div className="sm:col-span-1 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => saveItemAsTemplate(item)}
                          disabled={!item.name || saveAsTemplate.isPending}
                          className="text-muted-foreground hover:text-primary"
                          title="Spremi kao šablonu"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons for non-price types */}
                  {!hasPrices && (
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => saveItemAsTemplate(item)}
                        disabled={!item.name || saveAsTemplate.isPending}
                        className="text-muted-foreground hover:text-primary"
                        title="Spremi kao šablonu"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details for Ponuda */}
          {formData.type === 'ponuda' && (
            <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
              <h2 className="font-semibold text-foreground mb-4">Detalji ponude</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="paymentMethod">Način plaćanja</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Odaberite način plaćanja" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Transakcijski">Transakcijski</SelectItem>
                      <SelectItem value="Gotovinski">Gotovinski</SelectItem>
                      <SelectItem value="Karticama">Karticama</SelectItem>
                      <SelectItem value="Plaćeno po ponudi">Plaćeno po ponudi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preparedBy">Ponudu izradio/la</Label>
                  <Input
                    id="preparedBy"
                    value={formData.preparedBy}
                    onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })}
                    placeholder="Ime i prezime"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatski popunjeno – možete promijeniti po potrebi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h2 className="font-semibold text-foreground mb-4">Napomene</h2>
            <AutoResizeTextarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Dodatne napomene ili upute..."
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6 sticky top-24">
            <h2 className="font-semibold text-foreground mb-4">Sažetak</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vrsta dokumenta</span>
                <span className="font-medium text-foreground">{documentTypeLabels[formData.type]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Broj stavki</span>
                <span className="font-medium text-foreground">{items.filter(i => i.name).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Datum</span>
                <span className="font-medium text-foreground">
                  {new Date().toLocaleDateString('hr-HR')}
                </span>
              </div>
              
              {/* Validity and Delivery Days - editable */}
              {formData.type === 'ponuda' && (
                <div className="border-t border-border pt-3 mt-3 space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Rok valjanosti ponude (dana)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.validityDays}
                      onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) || 15 })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Rok isporuke (dana)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: parseInt(e.target.value) || 60 })}
                      className="mt-1 h-8 text-sm"
                    />
                  </div>
                </div>
              )}
              
              {hasPrices && (
                <div className="border-t border-border pt-3 mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Osnovica</span>
                    <span className="text-foreground">
                      {formatCurrency(subtotalAmount)} €
                    </span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rabat</span>
                      <span className="text-success">
                        -{formatCurrency(totalDiscount)} €
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PDV</span>
                    <span className="text-foreground">
                      {formatCurrency(totalPdv)} €
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="font-medium text-foreground">Ukupno</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(totalAmount)} €
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>

    {/* New Client Modal */}
    <NewClientModal
      open={showNewClientModal}
      onOpenChange={setShowNewClientModal}
      initialName=""
      onSave={handleSaveNewClient}
      isLoading={isCreatingClient}
    />
    </>
  );
}
