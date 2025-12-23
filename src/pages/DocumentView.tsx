import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentDetail } from '@/components/documents/DocumentDetail';
import { mockDocuments } from '@/data/mockDocuments';

const DocumentView = () => {
  return (
    <MainLayout 
      title="Pregled dokumenta" 
      subtitle="Detalji odabranog dokumenta"
    >
      <DocumentDetail documents={mockDocuments} />
    </MainLayout>
  );
};

export default DocumentView;
