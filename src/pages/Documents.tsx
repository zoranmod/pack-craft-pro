import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentType, documentTypeLabels } from '@/types/document';

const Documents = () => {
  const [filter, setFilter] = useState<DocumentType | 'all'>('all');
  const { data: documents = [], isLoading } = useDocuments();

  return (
    <MainLayout 
      title="Svi dokumenti" 
      subtitle={`Ukupno ${documents.length} dokumenata`}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={(v) => setFilter(v as DocumentType | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtriraj po tipu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi dokumenti</SelectItem>
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Link to="/documents/new">
          <Button className="gap-2 btn-float">
            <Plus className="h-4 w-4" />
            Novi dokument
          </Button>
        </Link>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <DocumentList documents={documents} filter={filter} />
      )}
    </MainLayout>
  );
};

export default Documents;
