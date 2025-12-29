import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

type StatusFilter = 'all' | 'pending' | 'completed';

const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const { data: documents = [], isLoading } = useDocuments();

  // Read status filter from URL on mount
  useEffect(() => {
    const status = searchParams.get('status') as StatusFilter;
    if (status && ['pending', 'completed'].includes(status)) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  // Filter documents by type and status
  const filteredDocuments = documents.filter(doc => {
    const matchesType = filter === 'all' || doc.type === filter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <MainLayout 
      title="Svi dokumenti" 
      subtitle={`Ukupno ${filteredDocuments.length} dokumenata`}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
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
          <Select value={statusFilter} onValueChange={(v) => handleStatusFilterChange(v as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtriraj po statusu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="pending">Na čekanju</SelectItem>
              <SelectItem value="completed">Završeno</SelectItem>
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
        <DocumentList documents={filteredDocuments} filter={filter} />
      )}
    </MainLayout>
  );
};

export default Documents;
