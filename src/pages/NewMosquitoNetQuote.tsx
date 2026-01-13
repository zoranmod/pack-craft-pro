import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { MosquitoNetQuoteForm } from '@/components/documents/MosquitoNetQuoteForm';

export default function NewMosquitoNetQuote() {
  const { id } = useParams();
  
  return (
    <MainLayout title={id ? "Uredi ponudu za komarnik" : "Nova ponuda za komarnik"}>
      <MosquitoNetQuoteForm documentId={id} />
    </MainLayout>
  );
}
