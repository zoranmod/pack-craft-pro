import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { format, isBefore, addDays } from 'date-fns';
import { hr } from 'date-fns/locale';
import { useEmployeeDocuments } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';

// Helper function to sanitize URL for safe rendering
const getSafeUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url;
    }
  } catch {
    // Invalid URL
  }
  return null;
};

interface EmployeeDocumentsSectionProps {
  employeeId: string;
}

export function EmployeeDocumentsSection({ employeeId }: EmployeeDocumentsSectionProps) {
  const { documents, isLoading } = useEmployeeDocuments(employeeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getExpiryStatus = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const warningDate = addDays(today, 30);
    
    if (isBefore(expiry, today)) {
      return { label: 'Isteklo', variant: 'destructive' as const, icon: AlertCircle };
    } else if (isBefore(expiry, warningDate)) {
      return { label: 'Uskoro ističe', variant: 'secondary' as const, icon: AlertCircle };
    }
    return null;
  };

  // Group documents by type
  const documentTypes = documents?.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, typeof documents>) || {};

  // Check for expiring documents
  const expiringDocs = documents?.filter(doc => {
    const status = getExpiryStatus(doc.expiry_date);
    return status !== null;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Moji dokumenti</CardTitle>
          <CardDescription>Pregled osobnih dokumenata</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold">{documents?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Ukupno dokumenata</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              {expiringDocs.length > 0 ? (
                <>
                  <p className="text-2xl font-bold text-orange-500">{expiringDocs.length}</p>
                  <p className="text-sm text-muted-foreground">Ističe/Isteklo</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-green-500">✓</p>
                  <p className="text-sm text-muted-foreground">Svi dokumenti u redu</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning for expiring documents */}
      {expiringDocs.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
              Upozorenje o dokumentima
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {expiringDocs.map(doc => {
                const status = getExpiryStatus(doc.expiry_date);
                return (
                  <li key={doc.id} className="text-sm text-orange-700 dark:text-orange-400">
                    <span className="font-medium">{doc.document_name}</span>
                    {' - '}
                    {status?.label}: {format(new Date(doc.expiry_date!), 'dd.MM.yyyy.', { locale: hr })}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Svi dokumenti</CardTitle>
        </CardHeader>
        <CardContent>
          {documents && documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => {
                const expiryStatus = getExpiryStatus(doc.expiry_date);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.document_name}</p>
                        <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                        {doc.expiry_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Vrijedi do: {format(new Date(doc.expiry_date), 'dd.MM.yyyy.', { locale: hr })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expiryStatus && (
                        <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                      )}
                      {getSafeUrl(doc.file_url) && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={getSafeUrl(doc.file_url)!} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Nemate dokumenata</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
