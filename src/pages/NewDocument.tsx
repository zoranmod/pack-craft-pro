import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentForm } from '@/components/documents/DocumentForm';

const NewDocument = () => {
  return (
    <MainLayout 
      title="Novi dokument" 
      subtitle="Kreirajte novi poslovni dokument"
    >
      <DocumentForm />
    </MainLayout>
  );
};

export default NewDocument;
