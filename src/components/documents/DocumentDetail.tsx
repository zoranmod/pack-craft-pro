import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Download, Printer, Mail, Trash2 } from 'lucide-react';
import { Document, documentTypeLabels, documentStatusLabels } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DocumentDetailProps {
  documents: Document[];
}

const statusStyles: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/10 text-warning border-warning/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function DocumentDetail({ documents }: DocumentDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const document = documents.find(d => d.id === id);
  
  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-foreground">Dokument nije pronađen</p>
        <Button variant="ghost" onClick={() => navigate('/documents')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag na listu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{document.number}</h1>
              <Badge variant="outline" className={cn(statusStyles[document.status])}>
                {documentStatusLabels[document.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground">{documentTypeLabels[document.type]}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Ispis
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="mr-2 h-4 w-4" />
            Pošalji
          </Button>
          <Link to={`/documents/${id}/edit`}>
            <Button size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Uredi
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-8">
            {/* Document Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-foreground gradient-primary bg-clip-text text-transparent">
                  DocuFlow
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Vaša tvrtka d.o.o.</p>
                <p className="text-sm text-muted-foreground">Ulica 123, 10000 Zagreb</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{document.number}</p>
                <p className="text-sm text-muted-foreground">{documentTypeLabels[document.type]}</p>
                <p className="text-sm text-muted-foreground mt-2">Datum: {document.date}</p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Client Info */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">KLIJENT</h3>
              <p className="font-semibold text-foreground">{document.clientName}</p>
              <p className="text-muted-foreground">{document.clientAddress}</p>
              {document.clientPhone && (
                <p className="text-muted-foreground">Tel: {document.clientPhone}</p>
              )}
              {document.clientEmail && (
                <p className="text-muted-foreground">Email: {document.clientEmail}</p>
              )}
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 text-left text-sm font-medium text-muted-foreground">Stavka</th>
                    <th className="py-3 text-center text-sm font-medium text-muted-foreground">Količina</th>
                    <th className="py-3 text-center text-sm font-medium text-muted-foreground">Jed.</th>
                    <th className="py-3 text-right text-sm font-medium text-muted-foreground">Cijena</th>
                    <th className="py-3 text-right text-sm font-medium text-muted-foreground">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {document.items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-4 text-foreground">{item.name}</td>
                      <td className="py-4 text-center text-foreground">{item.quantity}</td>
                      <td className="py-4 text-center text-muted-foreground">{item.unit}</td>
                      <td className="py-4 text-right text-foreground">{item.price.toLocaleString('hr-HR')} €</td>
                      <td className="py-4 text-right font-medium text-foreground">{item.total.toLocaleString('hr-HR')} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Osnovica</span>
                  <span className="text-foreground">{document.totalAmount.toLocaleString('hr-HR')} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PDV (25%)</span>
                  <span className="text-foreground">{(document.totalAmount * 0.25).toLocaleString('hr-HR')} €</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">UKUPNO</span>
                  <span className="text-xl font-bold text-primary">
                    {(document.totalAmount * 1.25).toLocaleString('hr-HR')} €
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {document.notes && (
              <div className="mt-8 p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">NAPOMENE</h3>
                <p className="text-foreground">{document.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4">Status dokumenta</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={cn(statusStyles[document.status])}>
                  {documentStatusLabels[document.status]}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kreirano</span>
                <span className="text-foreground">
                  {new Date(document.createdAt).toLocaleDateString('hr-HR')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ažurirano</span>
                <span className="text-foreground">
                  {new Date(document.updatedAt).toLocaleDateString('hr-HR')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl shadow-card border border-border/50 p-6">
            <h3 className="font-semibold text-foreground mb-4">Brze akcije</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Preuzmi kao PDF
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-2 h-4 w-4" />
                Pošalji emailom
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Obriši dokument
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
