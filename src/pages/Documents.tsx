import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Loader2, FileText, Filter } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DocumentList } from '@/components/documents/DocumentList';
import { TableToolbar } from '@/components/ui/table-toolbar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDocuments } from '@/hooks/useDocuments';
import { useDebounce } from '@/hooks/useDebounce';
import { useYearFilter } from '@/hooks/useYearFilter';
import { DocumentType, DocumentStatus, documentTypeLabels } from '@/types/document';

type StatusFilter = DocumentStatus | 'all';

// Valid statuses for filtering (excluding rejected and pending)
const validFilterStatuses = ['draft', 'sent', 'accepted', 'completed', 'cancelled'];

const Documents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const status = searchParams.get('status');
    // Map deprecated statuses to valid ones
    if (status === 'pending') return 'draft';
    if (status === 'rejected') return 'all';
    if (status && validFilterStatuses.includes(status)) {
      return status as StatusFilter;
    }
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data: documents = [], isLoading } = useDocuments();
  const { filterByYear, yearLabel } = useYearFilter();

  // Read URL parameters on mount and redirect deprecated statuses
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'pending') {
      searchParams.set('status', 'draft');
      setSearchParams(searchParams, { replace: true });
      setStatusFilter('draft');
    } else if (status === 'rejected') {
      searchParams.delete('status');
      setSearchParams(searchParams, { replace: true });
      setStatusFilter('all');
    } else if (status && validFilterStatuses.includes(status)) {
      setStatusFilter(status as StatusFilter);
    }
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams, setSearchParams]);

  // Filter documents by type, status, year and search query
  const filteredDocuments = documents.filter(doc => {
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesYear = filterByYear(doc.date);
    
    const searchLower = debouncedSearch.toLowerCase();
    const matchesSearch = !debouncedSearch || 
      doc.number.toLowerCase().includes(searchLower) ||
      doc.clientName.toLowerCase().includes(searchLower) ||
      doc.clientAddress?.toLowerCase().includes(searchLower) ||
      doc.notes?.toLowerCase().includes(searchLower);
    
    return matchesType && matchesStatus && matchesYear && matchesSearch;
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
      title="Svi dokumenti" 
      subtitle={`Ukupno ${filteredDocuments.length} dokumenata`}
    >
      <TableToolbar
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Pretraži sve dokumente..."
        primaryActionLabel="Novi dokument"
        primaryActionHref="/documents/new"
        yearLabel={yearLabel}
      >
        {/* Type filter as additional child */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DocumentType | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Tip dokumenta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi tipovi</SelectItem>
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </TableToolbar>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {debouncedSearch ? `Nema rezultata za "${debouncedSearch}"` : 'Nema dokumenata'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {debouncedSearch ? 'Pokušajte s drugim pojmom' : 'Kreirajte prvi dokument'}
          </p>
          {!debouncedSearch && (
            <Link to="/documents/new">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Novi dokument
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <DocumentList documents={filteredDocuments} filter={typeFilter} />
      )}
    </MainLayout>
  );
};

export default Documents;
