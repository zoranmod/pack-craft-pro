import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentForm } from '@/components/documents/DocumentForm';

const NewDocument = () => {
  const { id } = useParams();
  const isEditMode = !!id;

  return (
    <MainLayout 
      title={isEditMode ? "Uredi dokument" : "Novi dokument"} 
      subtitle={isEditMode ? "Uredite postojeći dokument" : "Kreirajte novi poslovni dokument"}
    >
      <DocumentForm />
    </MainLayout>
  );
};

export default NewDocument;
