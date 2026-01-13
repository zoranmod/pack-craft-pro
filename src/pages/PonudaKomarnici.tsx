import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, FileText, Settings } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { documentStatusLabels } from '@/types/document';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

export default function PonudaKomarnici() {
  const navigate = useNavigate();
  const { data: allDocuments = [], isLoading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only mosquito net quotes
  const documents = allDocuments.filter(doc => doc.type === 'ponuda-komarnici');

  // Filter by search
  const filteredDocuments = documents.filter(doc => 
    doc.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'accepted': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <MainLayout title="Ponude za komarnik">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Ponude za komarnik</h1>
            <p className="text-muted-foreground">Upravljajte ponudama za izradu komarnika</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/settings/komarnici-cjenik')}>
              <Settings className="h-4 w-4 mr-2" />
              Cjenik
            </Button>
            <Button onClick={() => navigate('/documents/new?type=ponuda-komarnici')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova ponuda
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pretraži po broju ili klijentu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Documents list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lista ponuda ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Učitavanje...</div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Nema rezultata pretrage' : 'Nema ponuda za komarnik'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => navigate('/documents/new?type=ponuda-komarnici')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Kreiraj prvu ponudu
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Broj</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Klijent</TableHead>
                    <TableHead>Iznos</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map(doc => (
                    <TableRow 
                      key={doc.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/documents/${doc.id}`)}
                    >
                      <TableCell className="font-medium">{doc.number}</TableCell>
                      <TableCell>
                        {format(new Date(doc.date), 'dd.MM.yyyy', { locale: hr })}
                      </TableCell>
                      <TableCell>{doc.clientName}</TableCell>
                      <TableCell className="font-medium">{doc.totalAmount.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(doc.status)}>
                          {documentStatusLabels[doc.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
