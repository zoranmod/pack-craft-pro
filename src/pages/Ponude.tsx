import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, FileText } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentStatus } from '@/types/document';

type StatusFilter = DocumentStatus | 'all';

const Ponude = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const status = searchParams.get('status') as StatusFilter;
    if (status && ['draft', 'sent', 'accepted', 'rejected', 'pending', 'completed', 'cancelled'].includes(status)) {
      return status;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { data: documents = [], isLoading } = useDocuments();

  useEffect(() => {
    const status = searchParams.get('status') as StatusFilter;
    if (status && ['draft', 'sent', 'accepted', 'rejected', 'pending', 'completed', 'cancelled'].includes(status)) {
      setStatusFilter(status);
    }
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  // Filter only ponude
  const filteredDocuments = documents.filter(doc => {
    if (doc.type !== 'ponuda') return false;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      doc.number.toLowerCase().includes(searchLower) ||
      doc.clientName.toLowerCase().includes(searchLower) ||
      doc.clientAddress?.toLowerCase().includes(searchLower) ||
      doc.notes?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const clearSearch = () => {
    setSearchQuery('');
    searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as StatusFilter);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  return (
    <MainLayout 
      title="Ponude" 
      subtitle={`Ukupno ${filteredDocuments.length} ponuda`}
    >
      <TableToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchQuery={searchQuery}
        onClearSearch={clearSearch}
        primaryActionLabel="Nova ponuda"
        primaryActionHref="/documents/new?type=ponuda"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nema ponuda</h3>
          <p className="text-muted-foreground mb-4">Kreirajte prvu ponudu</p>
          <Link to="/documents/new?type=ponuda">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova ponuda
            </Button>
          </Link>
        </div>
      ) : (
        <DocumentList documents={filteredDocuments} filter="ponuda" />
      )}
    </MainLayout>
  );
};

export default Ponude;
