import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentDetail } from '@/components/documents/DocumentDetail';
import { useDocument } from '@/hooks/useDocuments';
import { Skeleton } from '@/components/ui/skeleton';

const DocumentView = () => {
  const { id } = useParams();
  const { data: document, isLoading, error } = useDocument(id || '');

  if (isLoading) {
    return (
      <MainLayout title="Učitavanje..." subtitle="Molimo pričekajte">
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Pregled dokumenta" 
      subtitle="Detalji odabranog dokumenta"
    >
      <DocumentDetail document={document} error={error?.message} />
    </MainLayout>
  );
};

export default DocumentView;
