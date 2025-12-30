import { Calendar } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

const Kalendar = () => {
  return (
    <MainLayout 
      title="Kalendar" 
      subtitle="Pregled rokova i isporuka"
    >
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Kalendar (uskoro)</h3>
        <p className="text-muted-foreground">Ovdje će biti prikazani rokovi, isporuke i termini montaže</p>
      </div>
    </MainLayout>
  );
};

export default Kalendar;
