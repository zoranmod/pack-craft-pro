import { useMosquitoNetQuoteItems } from '@/hooks/useMosquitoNetData';
import { Document, documentTypeLabels } from '@/types/document';
import { formatDateHR, formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface MosquitoNetDocumentViewProps {
  document: Document;
  companySettings?: any;
}

export function MosquitoNetDocumentView({ document, companySettings }: MosquitoNetDocumentViewProps) {
  const { data: quoteItems = [], isLoading } = useMosquitoNetQuoteItems(document.id);

  // Split items by section
  const komarnici = quoteItems.filter(item => item.section_type === 'komarnici');
  const mjerenje = quoteItems.filter(item => item.section_type === 'mjerenje');
  const ugradnja = quoteItems.filter(item => item.section_type === 'ugradnja');

  // Calculate totals
  const komarnikTotal = komarnici.reduce((sum, item) => sum + (item.total || 0), 0);
  const mjerenjeTotal = mjerenje.reduce((sum, item) => sum + (item.total || 0), 0);
  const ugradnjaTotal = ugradnja.reduce((sum, item) => sum + (item.total || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div style={{ fontSize: '11.5px', color: '#000' }}>
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="font-bold" style={{ fontSize: '19px', letterSpacing: '0.5px' }}>
          PONUDA ZA IZRADU KOMARNIKA
        </h2>
      </div>

      {/* 2-column layout: buyer left, metadata right */}
      <div className="grid grid-cols-2 gap-4 mb-6 items-start">
        {/* Left: Client Info */}
        <div style={{ fontSize: '13px' }}>
          <h3 className="font-medium mb-1">KUPAC / NARUČITELJ</h3>
          <p className="font-semibold">{document.clientName}</p>
          <p>{document.clientAddress}</p>
          {document.clientOib && <p>JIB: {document.clientOib}</p>}
          {document.clientPhone && <p>Tel: {document.clientPhone}</p>}
          {document.clientEmail && <p>Email: {document.clientEmail}</p>}
        </div>

        {/* Right: Document metadata */}
        <div className="text-right" style={{ fontSize: '12px' }}>
          <p className="font-semibold" style={{ marginBottom: '2px' }}>{document.number}</p>
          <p>Datum: {formatDateHR(document.date)}</p>
        </div>
      </div>

      {/* KOMARNICI Section */}
      {komarnici.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 border-b-2 border-primary pb-1">KOMARNICI</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '4px', textAlign: 'left', width: '5%' }}>R.br.</th>
                <th style={{ padding: '4px', textAlign: 'left' }}>Artikl</th>
                <th style={{ padding: '4px', textAlign: 'center', width: '10%' }}>Širina</th>
                <th style={{ padding: '4px', textAlign: 'center', width: '10%' }}>Visina</th>
                <th style={{ padding: '4px', textAlign: 'center', width: '8%' }}>Kom</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '10%' }}>m²/kom</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '10%' }}>€/m²</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '12%' }}>Ukupno €</th>
              </tr>
            </thead>
            <tbody>
              {komarnici.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px' }}>{index + 1}.</td>
                  <td style={{ padding: '4px' }}>{item.product_name || '-'}</td>
                  <td style={{ padding: '4px', textAlign: 'center' }}>{item.width_cm} cm</td>
                  <td style={{ padding: '4px', textAlign: 'center' }}>{item.height_cm} cm</td>
                  <td style={{ padding: '4px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '4px', textAlign: 'right' }}>{item.calculated_m2?.toFixed(4)}</td>
                  <td style={{ padding: '4px', textAlign: 'right' }}>{item.unit_price?.toFixed(2)}</td>
                  <td style={{ padding: '4px', textAlign: 'right', fontWeight: 500 }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan={7} style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>Ukupno komarnici:</td>
                <td style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>{komarnikTotal.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* MJERENJE Section */}
      {mjerenje.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 border-b-2 border-primary pb-1">MJERENJE</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '4px', textAlign: 'left', width: '5%' }}>R.br.</th>
                <th style={{ padding: '4px', textAlign: 'left' }}>Lokacija</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '15%' }}>Cijena mjerenja €</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '15%' }}>Ukupno €</th>
              </tr>
            </thead>
            <tbody>
              {mjerenje.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px' }}>{index + 1}.</td>
                  <td style={{ padding: '4px' }}>{item.location_name || '-'}</td>
                  <td style={{ padding: '4px', textAlign: 'right' }}>{item.measurement_price?.toFixed(2)}</td>
                  <td style={{ padding: '4px', textAlign: 'right', fontWeight: 500 }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan={3} style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>Ukupno mjerenje:</td>
                <td style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>{mjerenjeTotal.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* UGRADNJA Section */}
      {ugradnja.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 border-b-2 border-primary pb-1">UGRADNJA</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <th style={{ padding: '4px', textAlign: 'left', width: '5%' }}>R.br.</th>
                <th style={{ padding: '4px', textAlign: 'left' }}>Lokacija</th>
                <th style={{ padding: '4px', textAlign: 'center', width: '10%' }}>Prozori</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '10%' }}>€/prozor</th>
                <th style={{ padding: '4px', textAlign: 'center', width: '10%' }}>Vrata</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '10%' }}>€/vrata</th>
                <th style={{ padding: '4px', textAlign: 'right', width: '12%' }}>Ukupno €</th>
              </tr>
            </thead>
            <tbody>
              {ugradnja.map((item, index) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '4px' }}>{index + 1}.</td>
                  <td style={{ padding: '4px' }}>{item.location_name || '-'}</td>
                  <td style={{ padding: '4px', textAlign: 'center' }}>{item.window_count || 0}</td>
                  <td style={{ padding: '4px', textAlign: 'right' }}>{item.window_price?.toFixed(2)}</td>
                  <td style={{ padding: '4px', textAlign: 'center' }}>{item.door_count || 0}</td>
                  <td style={{ padding: '4px', textAlign: 'right' }}>{item.door_price?.toFixed(2)}</td>
                  <td style={{ padding: '4px', textAlign: 'right', fontWeight: 500 }}>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan={6} style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>Ukupno ugradnja:</td>
                <td style={{ padding: '4px', textAlign: 'right', fontWeight: 600 }}>{ugradnjaTotal.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Grand Total - calculated from items, not document.totalAmount */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1" style={{ fontSize: '12px' }}>
          <div className="flex justify-between pt-2" style={{ borderTop: '3px solid #000' }}>
            <span className="font-bold">SVEUKUPNO:</span>
            <span className="font-bold text-lg">{(komarnikTotal + mjerenjeTotal + ugradnjaTotal).toFixed(2)} €</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {document.notes && (
        <div className="mb-4 p-2 rounded" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
          <p className="font-medium mb-1">Napomena</p>
          <p>{document.notes}</p>
        </div>
      )}

      {/* Signature Section */}
      <div className="mt-6 pt-4 border-t border-gray-300">
        <div className="flex justify-between items-end">
          <div style={{ width: '200px' }}>
            <p className="text-center mb-1">M.P.</p>
          </div>
          <div style={{ width: '200px' }}>
            <p className="text-sm mb-1">Ponudu izradio/la:</p>
            <div style={{ borderBottom: '1px solid #666', height: '30px' }}></div>
            <p className="text-xs text-center text-muted-foreground mt-1">(Potpis)</p>
            {document.preparedBy && (
              <p className="text-center font-medium mt-1">{document.preparedBy}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
