import { useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { DocumentType, documentTypeLabels } from '@/types/document';

const NewDocument = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;
  const typeParam = searchParams.get('type');

  // Redirect mosquito net quotes to dedicated form
  useEffect(() => {
    if (typeParam === 'ponuda-komarnici' && !isEditMode) {
      navigate('/ponuda-komarnici/nova', { replace: true });
    }
  }, [typeParam, isEditMode, navigate]);

  // Determine if we have a fixed type from the URL
  const hasValidType = typeParam && typeParam in documentTypeLabels;

  // If a specific type is passed in URL, lock it (module-specific entry)
  // If no type or editing, don't lock
  const fixedType = hasValidType ? (typeParam as DocumentType) : undefined;

  // Force fresh form even when navigating to same route/type repeatedly
  const nonce = (location.state as any)?.nonce ?? location.key;
  const formKey = `${id ?? 'new'}-${typeParam ?? 'all'}-${nonce}`;

  // Generate title based on context
  const getTitle = () => {
    if (isEditMode) return "Uredi dokument";
    if (fixedType) {
      const typeLabel = documentTypeLabels[fixedType];
      // Handle special cases
      if (fixedType === 'nalog-dostava-montaza') return 'Novi nalog';
      return `Nov${typeLabel.endsWith('a') ? 'a' : 'i'} ${typeLabel.toLowerCase()}`;
    }
    return "Novi dokument";
  };

  return (
    <MainLayout 
      title={getTitle()} 
      subtitle={isEditMode ? "Uredite postojeći dokument" : fixedType ? undefined : "Kreirajte novi poslovni dokument"}
    >
      <DocumentForm key={formKey} fixedType={fixedType} />
    </MainLayout>
  );
};

export default NewDocument;
