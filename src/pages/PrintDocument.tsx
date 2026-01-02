import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDocument } from '@/hooks/useDocuments';
import { useCompanySettings } from '@/hooks/useSettings';
import { useDocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useArticles } from '@/hooks/useArticles';
import { Document, documentTypeLabels } from '@/types/document';
import { MemorandumHeader } from '@/components/documents/MemorandumHeader';
import { MemorandumFooter } from '@/components/documents/MemorandumFooter';
import { ContractDocumentView } from '@/components/documents/ContractDocumentView';
import { SignatureBlock } from '@/components/documents/SignatureBlock';
import { formatDateHR, formatCurrency, round2 } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { generateAndDownloadPdf } from '@/lib/pdfGenerator';
import { toast } from 'sonner';

// Shared document body content (table, totals, signatures) - no header/footer
export function DocumentBodyContent({
  document,
  template,
  companySettings,
  enrichedItems,
  hasPrices
}: {
  document: Document;
  template?: any;
  companySettings?: any;
  enrichedItems: any[];
  hasPrices: boolean;
}) {
  // For otpremnica, use full column names
  const isOtpremnica = document.type === 'otpremnica' || document.type === 'nalog-dostava-montaza';
  const unitLabel = isOtpremnica ? 'Jedinica' : 'Jed.';
  const qtyLabel = isOtpremnica ? 'Količina' : 'Kol.';
  return <>
      {/* Document Header - 2-column grid: left (client info), right (metadata) */}
      {/* Title centered above the grid */}
      <div className="text-center mb-4">
        <h2 className="font-bold" style={{
        color: '#000',
        fontSize: '19px',
        letterSpacing: '0.5px'
      }}>
          {documentTypeLabels[document.type].toUpperCase()}
        </h2>
      </div>

      {/* 2-column layout: buyer left, metadata right, aligned at top */}
      <div className="grid grid-cols-2 gap-4 mb-4 items-start">
        {/* Left: Client Info */}
        <div style={{
        fontSize: '13px'
      }}>
          <h3 className="font-medium mb-1" style={{
          color: '#000'
        }}>KUPAC / NARUČITELJ</h3>
          <p className="font-semibold" style={{
          color: '#000'
        }}>{document.clientName}</p>
          <p style={{
          color: '#000'
        }}>{document.clientAddress}</p>
          {document.clientOib && <p style={{
          color: '#000'
        }}>OIB: {document.clientOib}</p>}
          {document.clientPhone && <p style={{
          color: '#000'
        }}>Tel: {document.clientPhone}</p>}
          {document.clientEmail && <p style={{
          color: '#000'
        }}>Email: {document.clientEmail}</p>}
          {document.contactPerson && <p style={{
          color: '#000'
        }}>Kontakt: {document.contactPerson}</p>}
          {document.deliveryAddress && <div className="mt-1">
              <p className="font-medium" style={{
            color: '#000'
          }}>Adresa isporuke:</p>
              <p style={{
            color: '#000'
          }}>{document.deliveryAddress}</p>
            </div>}
        </div>

        {/* Right: Document metadata */}
        <div className="text-right" style={{
        fontSize: '12px'
      }}>
          <p className="font-semibold" style={{
          color: '#000',
          marginBottom: '2px'
        }}>
            {document.number}
          </p>
          <p style={{
          color: '#000'
        }}>Datum: {formatDateHR(document.date)}</p>
          {document.validityDays && template?.show_validity_days && <p style={{
          color: '#000'
        }}>Rok valjanosti: {document.validityDays} dana</p>}
          {document.deliveryDays && template?.show_delivery_days && <p style={{
          color: '#000'
        }}>Rok isporuke: {document.deliveryDays} dana</p>}
          {document.paymentMethod && <p style={{
          color: '#000'
        }}>Način plaćanja: {document.paymentMethod}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4">
        <table style={{
        width: '100%',
        tableLayout: 'fixed',
        borderCollapse: 'collapse',
        fontSize: '11.5px'
      }}>
          <colgroup>
            {hasPrices ? <>
                <col style={{
              width: '5%'
            }} /> {/* R.br. */}
                <col style={{
              width: '10%'
            }} /> {/* Šifra */}
                <col style={{
              width: '35%'
            }} /> {/* Naziv */}
                <col style={{
              width: '8%'
            }} /> {/* Jed. */}
                <col style={{
              width: '8%'
            }} /> {/* Kol. */}
                <col style={{
              width: '10%'
            }} /> {/* Cijena */}
                {template?.show_discount_column !== false && <col style={{
              width: '8%'
            }} />}
                <col style={{
              width: '6%'
            }} /> {/* PDV */}
                <col style={{
              width: '10%'
            }} /> {/* Ukupno */}
              </> : <>
                <col style={{
              width: '6%'
            }} /> {/* R.br. */}
                <col style={{
              width: '12%'
            }} /> {/* Šifra */}
                <col style={{
              width: '54%'
            }} /> {/* Naziv - reduced to fit longer labels */}
                <col style={{
              width: '14%'
            }} /> {/* Jedinica - wider for full text */}
                <col style={{
              width: '14%'
            }} /> {/* Količina - wider for full text */}
              </>}
          </colgroup>
          <thead>
            <tr style={{
            borderBottom: '2px solid #1a1a1a'
          }}>
              <th style={{
              padding: '2mm 1mm',
              textAlign: 'left',
              fontWeight: 600,
              color: '#000',
              verticalAlign: 'top'
            }}>R.br.</th>
              <th style={{
              padding: '2mm 1mm',
              textAlign: 'left',
              fontWeight: 600,
              color: '#000',
              verticalAlign: 'top'
            }}>Šifra</th>
              <th style={{
              padding: '2mm 1mm',
              textAlign: 'left',
              fontWeight: 600,
              color: '#000',
              verticalAlign: 'top'
            }}>Naziv</th>
              <th style={{
              padding: '2mm 1mm',
              textAlign: 'center',
              fontWeight: 600,
              color: '#000',
              verticalAlign: 'top',
              whiteSpace: 'nowrap'
            }}>{unitLabel}</th>
              <th style={{
              padding: '2mm 1mm',
              textAlign: 'center',
              fontWeight: 600,
              color: '#000',
              verticalAlign: 'top',
              whiteSpace: 'nowrap'
            }}>{qtyLabel}</th>
              {hasPrices && <>
                  <th style={{
                padding: '2mm 1mm',
                textAlign: 'right',
                fontWeight: 600,
                color: '#000',
                verticalAlign: 'top'
              }}>Cijena</th>
                  {template?.show_discount_column !== false && <th style={{
                padding: '2mm 1mm',
                textAlign: 'right',
                fontWeight: 600,
                color: '#000',
                verticalAlign: 'top'
              }}>Rabat</th>}
                  <th style={{
                padding: '2mm 1mm',
                textAlign: 'right',
                fontWeight: 600,
                color: '#000',
                verticalAlign: 'top'
              }}>PDV</th>
                  <th style={{
                padding: '2mm 1mm',
                textAlign: 'right',
                fontWeight: 600,
                color: '#000',
                verticalAlign: 'top'
              }}>Ukupno</th>
                </>}
            </tr>
          </thead>
          <tbody>
            {enrichedItems.map((item, index) => <tr key={item.id} style={{
            borderBottom: '1px solid #ccc'
          }}>
                <td style={{
              padding: '2mm 1mm',
              color: '#000',
              verticalAlign: 'top'
            }}>{index + 1}.</td>
                <td style={{
              padding: '2mm 1mm',
              color: '#000',
              verticalAlign: 'top'
            }}>{item.code || ''}</td>
                <td style={{
              padding: '2mm 1mm',
              color: '#000',
              verticalAlign: 'top',
              overflowWrap: 'anywhere'
            }}>{item.name}</td>
                <td style={{
              padding: '2mm 1mm',
              color: '#000',
              verticalAlign: 'top',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>{item.unit}</td>
                <td style={{
              padding: '2mm 1mm',
              color: '#000',
              verticalAlign: 'top',
              textAlign: 'center',
              whiteSpace: 'nowrap'
            }}>{item.quantity}</td>
                {hasPrices && <>
                    <td style={{
                padding: '2mm 1mm',
                color: '#000',
                verticalAlign: 'top',
                textAlign: 'right'
              }}>{formatCurrency(item.price)} €</td>
                    {template?.show_discount_column !== false && <td style={{
                padding: '2mm 1mm',
                color: '#000',
                verticalAlign: 'top',
                textAlign: 'right'
              }}>{item.discount > 0 ? `${round2(item.discount)}%` : ''}</td>}
                    <td style={{
                padding: '2mm 1mm',
                color: '#000',
                verticalAlign: 'top',
                textAlign: 'right'
              }}>{round2(item.pdv)}%</td>
                    <td style={{
                padding: '2mm 1mm',
                color: '#000',
                verticalAlign: 'top',
                textAlign: 'right',
                fontWeight: 500
              }}>{formatCurrency(item.total)} €</td>
                  </>}
              </tr>)}
          </tbody>
        </table>
      </div>

      {/* Totals - only show for document types with prices */}
      {hasPrices && <div className="flex justify-end mb-4">
          <div className="w-64 space-y-1" style={{
        fontSize: '11.5px'
      }}>
            <div className="flex justify-between">
              <span style={{
            color: '#000'
          }}>Osnovica:</span>
              <span style={{
            color: '#000'
          }}>
                {formatCurrency(document.items.reduce((sum, item) => sum + item.subtotal, 0))} €
              </span>
            </div>
            {document.items.some(item => item.discount > 0) && <div className="flex justify-between">
                <span style={{
            color: '#000'
          }}>Rabat:</span>
                <span style={{
            color: '#000'
          }}>
                  -{formatCurrency(document.items.reduce((sum, item) => sum + round2(item.subtotal * item.discount / 100), 0))} €
                </span>
              </div>}
            {template?.show_pdv_breakdown !== false && <div className="flex justify-between">
                <span style={{
            color: '#000'
          }}>PDV (25%):</span>
                <span style={{
            color: '#000'
          }}>
                  {formatCurrency(document.items.reduce((sum, item) => {
              const afterDiscount = round2(item.subtotal - round2(item.subtotal * item.discount / 100));
              return sum + round2(afterDiscount * item.pdv / 100);
            }, 0))} €
                </span>
              </div>}
            <div className="flex justify-between pt-1 border-t-2 border-gray-800">
              <span className="font-bold" style={{
            color: '#000'
          }}>UKUPNO:</span>
              <span className="font-bold" style={{
            color: '#000'
          }}>
                {formatCurrency(document.totalAmount)} €
              </span>
            </div>
          </div>
        </div>}

      {/* Notes */}
      {document.notes && <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded" style={{
      fontSize: '11.5px'
    }}>
          <p className="font-medium mb-1" style={{
        color: '#000'
      }}>Napomena</p>
          <p style={{
        color: '#000'
      }}>{document.notes}</p>
        </div>}

      {/* Stamp & Signature Section for Ponuda */}
      {document.type === 'ponuda' && <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="text-center mb-3">
            <p style={{
          color: '#000',
          fontSize: '11.5px'
        }}>M.P.</p>
          </div>
          <div className="flex justify-end">
            <SignatureBlock label="Ponudu izradio/la:" name={document.preparedBy || undefined} caption="(Potpis)" widthMm={75} />
          </div>
        </div>}

      {/* Signature Section for Otpremnica */}
      {document.type === 'otpremnica' && <div className="mt-4 pt-3 border-t border-gray-300" style={{
      fontSize: '11.5px'
    }}>
          {/* Row 1: Robu preuzeo */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr',
        alignItems: 'end',
        paddingTop: '6mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>Robu preuzeo:</span>
            <div style={{
          borderBottom: '1px solid #666',
          minHeight: '4mm'
        }}></div>
            <div style={{
          textAlign: 'center',
          color: '#000'
        }}>MP</div>
            <div style={{
          borderBottom: '1px solid #666',
          minHeight: '4mm'
        }}></div>
          </div>
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr'
      }}>
            <div></div>
            <div></div>
            <div></div>
            <div style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#000',
          marginTop: '1mm'
        }}>(potpis)</div>
          </div>

          {/* Row 2: Za tvrtku - auto-filled with preparedBy */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr',
        alignItems: 'end',
        paddingTop: '8mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>Za tvrtku:</span>
            <div style={{
          borderBottom: '1px solid #666',
          textAlign: 'center',
          position: 'relative',
          minHeight: '4mm'
        }}>
              {document.preparedBy && <span style={{
            color: '#000',
            fontSize: '11px',
            position: 'absolute',
            bottom: '2mm',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }} className="text-sm">
                  {document.preparedBy}
                </span>}
            </div>
            <div style={{
          textAlign: 'center',
          color: '#000'
        }}>MP</div>
            <div style={{
          borderBottom: '1px solid #666',
          minHeight: '4mm'
        }}></div>
          </div>
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr'
      }}>
            <div></div>
            <div></div>
            <div></div>
            <div style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#000',
          marginTop: '1mm'
        }}>(potpis)</div>
          </div>

          {/* Row 3: Robu izdao skladištar */}
          <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        marginTop: '10mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>Robu izdao skladištar (puno ime i prezime):</span>
            <div style={{
          flex: 1,
          borderBottom: '1px solid #666',
          marginLeft: '2mm',
          maxWidth: '100mm'
        }}></div>
          </div>
        </div>}

      {/* Signature Section for Nalog dostave i montaže */}
      {document.type === 'nalog-dostava-montaza' && <div className="mt-4 pt-3 border-t border-gray-300" style={{
      fontSize: '11.5px'
    }}>
          {/* Row 1: Robu preuzeo */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr',
        alignItems: 'end',
        paddingTop: '6mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>Robu preuzeo:</span>
            <div style={{
          borderBottom: '1px solid #666',
          minHeight: '4mm'
        }}></div>
            <div style={{
          textAlign: 'center',
          color: '#000'
        }}>MP</div>
            <div style={{
          borderBottom: '1px solid #666',
          minHeight: '4mm'
        }}></div>
          </div>
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr'
      }}>
            <div></div>
            <div></div>
            <div></div>
            <div style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#000',
          marginTop: '1mm'
        }}>(potpis)</div>
          </div>

          {/* Row 2: Za tvrtku - auto-filled with preparedBy */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr',
        alignItems: 'end',
        paddingTop: '8mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>Za tvrtku:</span>
            <div style={{
          borderBottom: '1px solid #666',
          textAlign: 'center',
          position: 'relative',
          minHeight: '4mm'
        }}>
              {document.preparedBy && <span style={{
            color: '#000',
            fontSize: '11px',
            position: 'absolute',
            bottom: '2mm',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }} className="text-base">
                  {document.preparedBy}
                </span>}
            </div>
            <div style={{
          textAlign: 'center',
          color: '#000'
        }}>MP</div>
            <div style={{
          borderBottom: '1px solid #666',
          minHeight: '4mm'
        }}></div>
          </div>
          <div style={{
        display: 'grid',
        gridTemplateColumns: '24mm 1fr 14mm 1fr'
      }}>
            <div></div>
            <div></div>
            <div></div>
            <div style={{
          textAlign: 'center',
          fontSize: '9px',
          color: '#000',
          marginTop: '1mm'
        }}>(potpis)</div>
          </div>

          {/* Row 3: Monter 1 */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '20mm 1fr',
        alignItems: 'end',
        marginTop: '10mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>
        </span>
            <div style={{
          borderBottom: '1px solid #666',
          textAlign: 'center',
          position: 'relative',
          minHeight: '4mm',
          maxWidth: '80mm'
        }}>
              {document.monter1 && <span style={{
            color: '#000',
            fontSize: '11px',
            position: 'absolute',
            bottom: '2mm',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }} className="text-base">
                  {document.monter1}
                </span>}
            </div>
          </div>

          {/* Row 4: Monter 2 */}
          <div style={{
        display: 'grid',
        gridTemplateColumns: '20mm 1fr',
        alignItems: 'end',
        marginTop: '6mm'
      }}>
            <span style={{
          color: '#000',
          whiteSpace: 'nowrap'
        }}>
        </span>
            <div style={{
          borderBottom: '1px solid #666',
          textAlign: 'center',
          position: 'relative',
          minHeight: '4mm',
          maxWidth: '80mm'
        }}>
              {document.monter2 && <span style={{
            color: '#000',
            fontSize: '11px',
            position: 'absolute',
            bottom: '2mm',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap'
          }} className="text-base">
                  {document.monter2}
                </span>}
            </div>
          </div>
        </div>}
    </>;
}

// Full A4 document with header, content, and footer
export function DocumentContent({
  document,
  template,
  companySettings,
  enrichedItems,
  hasPrices,
  forPrint = false
}: {
  document: Document;
  template?: any;
  companySettings?: any;
  enrichedItems: any[];
  hasPrices: boolean;
  forPrint?: boolean;
}) {
  const isContract = document.type === 'ugovor';

  // Get print settings from companySettings or use defaults
  const footerBottomMm = companySettings?.print_footer_bottom_mm ?? 14;
  const footerMaxHeightMm = companySettings?.print_footer_max_height_mm ?? 14;
  const contentBottomPaddingMm = companySettings?.print_content_bottom_padding_mm ?? 42;

  // Apply CSS variables for print layout
  const printStyles = {
    '--print-footer-bottom-mm': `${footerBottomMm}mm`,
    '--print-footer-max-height-mm': `${footerMaxHeightMm}mm`,
    '--print-content-bottom-padding-mm': `${contentBottomPaddingMm}mm`
  } as React.CSSProperties;
  if (isContract) {
    return <ContractDocumentView document={document} companySettings={companySettings} />;
  }
  return <div className="a4-page" style={{
    ...printStyles,
    fontFamily: template?.font_family || 'Arial',
    fontSize: '11.5px'
  }}>
      <div className="doc-body">
        <MemorandumHeader />
        <DocumentBodyContent document={document} template={template} companySettings={companySettings} enrichedItems={enrichedItems} hasPrices={hasPrices} />
      </div>
      
      <div className="doc-footer">
        <p className="legal-note">
          Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
        </p>
        <MemorandumFooter />
      </div>
    </div>;
}
const PrintDocument = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasPrinted = useRef(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Check if we should skip auto-print (for manual PDF save)
  const noPrint = searchParams.get('noPrint') === 'true';
  const {
    data: document,
    isLoading,
    error
  } = useDocument(id || '');
  const {
    data: companySettings
  } = useCompanySettings();
  const {
    data: template
  } = useDocumentTemplate(document?.templateId);
  const {
    data: articlesData
  } = useArticles({
    pageSize: 1000
  });

  // Document types that should NOT show prices
  const hasPrices = document?.type ? ['ponuda', 'racun', 'ugovor'].includes(document.type) : true;

  // Enrich items with codes from articles
  const enrichedItems = useMemo(() => {
    if (!document?.items) return [];
    if (!articlesData?.articles) return document.items;
    const articleCodeMap = new Map<string, string>();
    articlesData.articles.forEach(article => {
      if (article.code) {
        articleCodeMap.set(article.name.toLowerCase(), article.code);
      }
    });
    return document.items.map(item => ({
      ...item,
      code: item.code || articleCodeMap.get(item.name.toLowerCase()) || ''
    }));
  }, [document?.items, articlesData?.articles]);

  // Handle PDF download
  const handleSavePdf = async () => {
    if (!document || isPdfGenerating) return;
    
    setIsPdfGenerating(true);
    try {
      await generateAndDownloadPdf(document, template, companySettings, enrichedItems);
      toast.success('PDF uspješno spremljen');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Greška pri generiranju PDF-a');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  // Auto-print after content loads (unless noPrint is set)
  useEffect(() => {
    if (document && !isLoading && !hasPrinted.current && !noPrint) {
      const timer = setTimeout(() => {
        hasPrinted.current = true;
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [document, isLoading, noPrint]);
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white print:hidden">
        <p className="text-lg">Učitavanje dokumenta...</p>
      </div>;
  }
  if (error || !document) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-white print:hidden">
        <p className="text-lg text-red-600 mb-4">
          {error ? `Greška: ${error.message}` : 'Dokument nije pronađen'}
        </p>
        <Button onClick={() => navigate(-1)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag
        </Button>
      </div>;
  }
  return <>
      {/* Minimal inline styles - main print rules in index.css */}
      <style>{`
        @media screen {
          body { background: #e5e5e5; }
        }
      `}</style>

      {/* Controls - hidden on print */}
      <div className="print-controls fixed top-4 left-4 z-50 flex gap-2">
        <Button onClick={() => navigate(-1)} variant="outline" className="shadow-lg bg-white">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag
        </Button>
        <Button onClick={handleSavePdf} className="shadow-lg" disabled={isPdfGenerating}>
          {isPdfGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isPdfGenerating ? 'Generiram...' : 'Spremi PDF'}
        </Button>
      </div>

      {/* Document content - clean A4 page */}
      <div className="py-8 print:py-0 print:bg-white flex justify-center" style={{
        minHeight: 'auto'
      }}>
        <DocumentContent document={document} template={template} companySettings={companySettings} enrichedItems={enrichedItems} hasPrices={hasPrices} forPrint={true} />
      </div>
    </>;
};
export default PrintDocument;