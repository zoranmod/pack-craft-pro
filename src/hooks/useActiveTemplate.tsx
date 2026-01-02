import { useDocumentTemplate, useDefaultTemplate, DocumentTemplate, getDefaultTemplate } from './useDocumentTemplates';
import { DocumentType } from '@/types/document';

export interface ActiveTemplateResult {
  template: DocumentTemplate | null;
  isLoading: boolean;
  isUsingDefault: boolean;
  isUsingFallback: boolean;
  templateSource: 'document' | 'default' | 'fallback';
}

/**
 * Hook that resolves the active template for a document.
 * Priority:
 * 1. Document's saved template_id
 * 2. Default template for document type
 * 3. Built-in fallback defaults
 */
export function useActiveTemplate(
  templateId: string | undefined | null,
  documentType: DocumentType
): ActiveTemplateResult {
  // Try to load the specific template if ID is provided
  const { data: specificTemplate, isLoading: isLoadingSpecific } = useDocumentTemplate(
    templateId || undefined
  );
  
  // Always load the default template for this type as fallback
  const { data: defaultTemplate, isLoading: isLoadingDefault } = useDefaultTemplate(documentType);

  const isLoading = (templateId ? isLoadingSpecific : false) || isLoadingDefault;

  // Determine which template to use
  if (templateId && specificTemplate) {
    return {
      template: specificTemplate,
      isLoading,
      isUsingDefault: false,
      isUsingFallback: false,
      templateSource: 'document',
    };
  }

  if (defaultTemplate) {
    return {
      template: defaultTemplate,
      isLoading,
      isUsingDefault: true,
      isUsingFallback: false,
      templateSource: 'default',
    };
  }

  // Fallback to built-in defaults
  const fallbackDefaults = getDefaultTemplate();
  const fallbackTemplate: DocumentTemplate = {
    id: 'fallback',
    user_id: '',
    document_type: documentType,
    name: 'Zadane postavke',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...fallbackDefaults,
  };

  return {
    template: fallbackTemplate,
    isLoading,
    isUsingDefault: false,
    isUsingFallback: true,
    templateSource: 'fallback',
  };
}
