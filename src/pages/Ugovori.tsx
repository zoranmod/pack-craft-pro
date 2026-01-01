import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, FileSignature } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { useDebounce } from '@/hooks/useDebounce';
import { DocumentStatus } from '@/types/document';

type StatusFilter = DocumentStatus | 'all';

const Ugovori = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const status = searchParams.get('status') as StatusFilter;
    if (status && ['draft', 'sent', 'accepted', 'rejected', 'pending', 'completed', 'cancelled'].includes(status)) {
      return status;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
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

  // Filter only ugovori
  const filteredDocuments = documents.filter(doc => {
    if (doc.type !== 'ugovor') return false;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const searchLower = debouncedSearch.toLowerCase();
    const matchesSearch = !debouncedSearch || 
      doc.number.toLowerCase().includes(searchLower) ||
      doc.clientName.toLowerCase().includes(searchLower) ||
      doc.clientAddress?.toLowerCase().includes(searchLower) ||
      doc.notes?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

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
      title="Ugovori" 
      subtitle={`Ukupno ${filteredDocuments.length} ugovora`}
    >
      <TableToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Pretraži ugovore..."
        primaryActionLabel="Novi ugovor"
        primaryActionHref="/documents/new?type=ugovor"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileSignature className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {debouncedSearch ? `Nema rezultata za "${debouncedSearch}"` : 'Nema ugovora'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {debouncedSearch ? 'Pokušajte s drugim pojmom' : 'Kreirajte prvi ugovor'}
          </p>
          {!debouncedSearch && (
            <Link to="/documents/new?type=ugovor">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Novi ugovor
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <DocumentList documents={filteredDocuments} filter="ugovor" />
      )}
    </MainLayout>
  );
};

export default Ugovori;
