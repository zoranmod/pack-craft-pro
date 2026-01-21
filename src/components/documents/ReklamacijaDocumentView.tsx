import { Document } from '@/types/document';
import { formatDateHR } from '@/lib/utils';

interface ReklamacijaDocumentViewProps {
  document: Document;
  companySettings?: any;
}

export function ReklamacijaDocumentView({ document, companySettings }: ReklamacijaDocumentViewProps) {
  const settings = companySettings;
  
  return (
    <div className="space-y-6">
      {/* Document Title */}
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-wide">REKLAMACIJSKI ZAPISNIK</h1>
      </div>

      {/* Supplier and Document Info */}
      <div className="flex justify-between items-start">
        <div className="space-y-1 text-sm">
          <div className="flex">
            <span className="w-20 font-medium">Dobavljač:</span>
            <span>{document.supplierName || ''}</span>
          </div>
          <div className="flex">
            <span className="w-20 font-medium">Adresa:</span>
            <span>{document.supplierAddress || ''}</span>
          </div>
          <div className="flex">
            <span className="w-20 font-medium">OIB:</span>
            <span>{document.supplierOib || ''}</span>
          </div>
          <div className="flex">
            <span className="w-20 font-medium">Kontakt:</span>
            <span>{document.supplierContact || ''}</span>
          </div>
        </div>
        <div className="text-right text-sm space-y-1">
          <div>
            <span className="font-medium">Dokument broj: </span>
            <span className="font-bold">{document.number}</span>
          </div>
          <div>
            <span className="font-medium">U Županji: </span>
            <span>{formatDateHR(document.date)}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="border-r border-border px-3 py-2 text-left font-medium w-12">r.br</th>
              <th className="border-r border-border px-3 py-2 text-left font-medium w-28">Šifra artikla</th>
              <th className="border-r border-border px-3 py-2 text-left font-medium">Naziv artikla</th>
              <th className="border-r border-border px-3 py-2 text-center font-medium w-20">Jed.mjera</th>
              <th className="border-r border-border px-3 py-2 text-center font-medium w-20">Količina</th>
              <th className="px-3 py-2 text-left font-medium w-28">Broj računa</th>
            </tr>
          </thead>
          <tbody>
            {document.items.length > 0 ? (
              document.items.map((item, index) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="border-r border-border px-3 py-2">{index + 1}</td>
                  <td className="border-r border-border px-3 py-2">{item.code || ''}</td>
                  <td className="border-r border-border px-3 py-2">{item.name}</td>
                  <td className="border-r border-border px-3 py-2 text-center">{item.unit}</td>
                  <td className="border-r border-border px-3 py-2 text-center">{item.quantity}</td>
                  <td className="px-3 py-2">{item.invoiceNumber || ''}</td>
                </tr>
              ))
            ) : (
              <tr className="border-t border-border">
                <td className="border-r border-border px-3 py-2">1</td>
                <td className="border-r border-border px-3 py-2"></td>
                <td className="border-r border-border px-3 py-2"></td>
                <td className="border-r border-border px-3 py-2"></td>
                <td className="border-r border-border px-3 py-2"></td>
                <td className="px-3 py-2"></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      {document.notes && (
        <div className="text-sm">
          <span className="font-medium">Napomena: </span>
          <span className="whitespace-pre-wrap">{document.notes}</span>
        </div>
      )}

      {/* Pickup Date */}
      <div className="text-sm mt-8">
        <span className="font-medium">Datum preuzimanja: </span>
        <span>{document.pickupDate ? formatDateHR(document.pickupDate) : '_________________'}</span>
      </div>

      {/* Signatures */}
      <div className="mt-12 pt-8">
        <div className="flex justify-between items-end">
          {/* Received By */}
          <div className="text-center">
            <div className="text-sm mb-1">Robu preuzeo:</div>
            <div className="text-sm font-medium mb-8">{document.receivedBy || ''}</div>
            <div className="border-t border-border w-40 pt-2 text-sm text-muted-foreground">
              (potpis)
            </div>
          </div>

          {/* Stamp placeholder */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground">MP</div>
          </div>

          {/* Company Representative */}
          <div className="text-center">
            <div className="text-sm mb-1">za {settings?.company_name || 'Akord d.o.o.'}:</div>
            <div className="text-sm font-medium mb-8">{document.companyRepresentative || ''}</div>
            <div className="border-t border-border w-40 pt-2 text-sm text-muted-foreground">
              (potpis)
            </div>
          </div>
        </div>

        {/* Second MP */}
        <div className="text-center mt-4">
          <div className="text-sm text-muted-foreground">MP</div>
        </div>
      </div>
    </div>
  );
}