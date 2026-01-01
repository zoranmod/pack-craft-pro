import { useParams, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentForm } from '@/components/documents/DocumentForm';
import { DocumentType, documentTypeLabels } from '@/types/document';

const NewDocument = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = !!id;

  // Determine if we have a fixed type from the URL
  const typeParam = searchParams.get('type');
  const hasValidType = typeParam && typeParam in documentTypeLabels;
  
  // If a specific type is passed in URL, lock it (module-specific entry)
  // If no type or editing, don't lock
  const fixedType = hasValidType ? (typeParam as DocumentType) : undefined;

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
      <DocumentForm fixedType={fixedType} />
    </MainLayout>
  );
};

export default NewDocument;
