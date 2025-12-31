import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';
import { Document, documentTypeLabels } from '@/types/document';
import { formatDateHR, formatCurrency, round2 } from '@/lib/utils';

// Initialize pdfmake with fonts
pdfMake.vfs = pdfFonts.vfs;

interface CompanySettings {
  company_name?: string | null;
  address?: string | null;
  oib?: string | null;
  iban?: string | null;
  phone_main?: string | null;
  email_info?: string | null;
  website?: string | null;
  director_name?: string | null;
}

interface DocumentTemplate {
  show_validity_days?: boolean;
  show_delivery_days?: boolean;
  show_discount_column?: boolean;
  show_pdv_breakdown?: boolean;
}

interface GeneratePdfOptions {
  document: Document;
  companySettings?: CompanySettings | null;
  template?: DocumentTemplate | null;
  enrichedItems?: Array<{
    id: string;
    name: string;
    code?: string;
    unit: string;
    quantity: number;
    price: number;
    discount: number;
    pdv: number;
    subtotal: number;
    total: number;
  }>;
}

// Document types that should show prices
const PRICE_DOCUMENT_TYPES = ['ponuda', 'racun', 'ugovor'];

// Footer lines - exactly 2 lines, hard-coded
const FOOTER_LINE_1 = 'www.akord-zupanja.hr ⸰ info@akord-zupanja.hr ⸰ Besplatan info tel: 0800 9455';
const FOOTER_LINE_2 = 'Maloprodaja +385 32 830 345 ⸰ Veleprodaja +385 32 830 346 ⸰ Projektiranje namještaja +385 32 638 776 ⸰ Računovodstvo +385 32 638 900';

export function generateDocumentPdf(options: GeneratePdfOptions): Promise<Blob> {
  const { document, companySettings, template, enrichedItems } = options;
  const items = enrichedItems || document.items || [];
  const hasPrices = PRICE_DOCUMENT_TYPES.includes(document.type);

  // Build table body
  const tableBody: TableCell[][] = [];
  
  // Table header
  const headerRow: TableCell[] = [
    { text: 'R.br.', style: 'tableHeader', alignment: 'center' },
    { text: 'Šifra', style: 'tableHeader' },
    { text: 'Naziv', style: 'tableHeader' },
    { text: 'Jed.', style: 'tableHeader', alignment: 'center' },
    { text: 'Kol.', style: 'tableHeader', alignment: 'center' },
  ];
  
  if (hasPrices) {
    headerRow.push(
      { text: 'Cijena', style: 'tableHeader', alignment: 'right' },
      { text: 'Rabat', style: 'tableHeader', alignment: 'right' },
      { text: 'PDV', style: 'tableHeader', alignment: 'right' },
      { text: 'Ukupno', style: 'tableHeader', alignment: 'right' }
    );
  }
  tableBody.push(headerRow);

  // Table rows
  items.forEach((item, index) => {
    const row: TableCell[] = [
      { text: `${index + 1}.`, alignment: 'center' },
      { text: item.code || '' },
      { text: item.name },
      { text: item.unit, alignment: 'center' },
      { text: String(item.quantity), alignment: 'center' },
    ];
    
    if (hasPrices) {
      row.push(
        { text: `${formatCurrency(item.price)} €`, alignment: 'right' },
        { text: item.discount > 0 ? `${round2(item.discount)}%` : '', alignment: 'right' },
        { text: `${round2(item.pdv)}%`, alignment: 'right' },
        { text: `${formatCurrency(item.total)} €`, alignment: 'right', bold: true }
      );
    }
    tableBody.push(row);
  });

  // Calculate totals
  const subtotalSum = items.reduce((sum, item) => sum + item.subtotal, 0);
  const discountSum = items.reduce((sum, item) => sum + round2(item.subtotal * item.discount / 100), 0);
  const pdvSum = items.reduce((sum, item) => {
    const afterDiscount = round2(item.subtotal - round2(item.subtotal * item.discount / 100));
    return sum + round2(afterDiscount * item.pdv / 100);
  }, 0);
  const hasDiscount = items.some(item => item.discount > 0);

  // Build content
  const content: Content[] = [];

  // Header section with logo placeholder and company name
  content.push({
    columns: [
      {
        width: '*',
        text: companySettings?.company_name || 'AKORD d.o.o.',
        style: 'companyName',
      },
      {
        width: 'auto',
        text: [
          { text: companySettings?.address || '', style: 'companyInfo' },
          companySettings?.oib ? { text: `\nOIB: ${companySettings.oib}`, style: 'companyInfo' } : '',
        ],
        alignment: 'right',
      },
    ],
    margin: [0, 0, 0, 5],
  });

  // Horizontal line under header
  content.push({
    canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cccccc' }],
    margin: [0, 0, 0, 15],
  });

  // Document title - centered
  content.push({
    text: documentTypeLabels[document.type].toUpperCase(),
    style: 'documentTitle',
    alignment: 'center',
    margin: [0, 0, 0, 15],
  });

  // Two column layout: Buyer left, Meta right
  content.push({
    columns: [
      // Left: Buyer info
      {
        width: '55%',
        stack: [
          { text: 'KUPAC / NARUČITELJ', style: 'sectionLabel', margin: [0, 0, 0, 3] },
          { text: document.clientName, bold: true, fontSize: 11 },
          { text: document.clientAddress, fontSize: 10 },
          document.clientOib ? { text: `OIB: ${document.clientOib}`, fontSize: 10 } : null,
          document.clientPhone ? { text: `Tel: ${document.clientPhone}`, fontSize: 10 } : null,
          document.clientEmail ? { text: `Email: ${document.clientEmail}`, fontSize: 10 } : null,
          document.contactPerson ? { text: `Kontakt: ${document.contactPerson}`, fontSize: 10 } : null,
          document.deliveryAddress ? { text: `\nAdresa isporuke:\n${document.deliveryAddress}`, fontSize: 10, margin: [0, 5, 0, 0] } : null,
        ].filter(Boolean) as Content[],
      },
      // Right: Document metadata
      {
        width: '45%',
        stack: [
          { text: document.number, bold: true, fontSize: 12, alignment: 'right' },
          { text: `Datum: ${formatDateHR(document.date)}`, fontSize: 10, alignment: 'right' },
          document.validityDays && template?.show_validity_days !== false
            ? { text: `Rok valjanosti: ${document.validityDays} dana`, fontSize: 10, alignment: 'right' }
            : null,
          document.deliveryDays && template?.show_delivery_days !== false
            ? { text: `Rok isporuke: ${document.deliveryDays} dana`, fontSize: 10, alignment: 'right' }
            : null,
          document.paymentMethod
            ? { text: `Način plaćanja: ${document.paymentMethod}`, fontSize: 10, alignment: 'right' }
            : null,
        ].filter(Boolean) as Content[],
        alignment: 'right',
      },
    ],
    margin: [0, 0, 0, 15],
  });

  // Items table
  const tableWidths = hasPrices
    ? [25, 45, '*', 30, 30, 55, 40, 35, 60]
    : [30, 50, '*', 40, 40];

  content.push({
    table: {
      headerRows: 1,
      widths: tableWidths,
      body: tableBody,
    },
    layout: {
      hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
      vLineWidth: () => 0,
      hLineColor: (i: number) => i === 1 ? '#333333' : '#cccccc',
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 4,
      paddingBottom: () => 4,
    },
    margin: [0, 0, 0, 15],
  });

  // Totals section (only for price documents)
  if (hasPrices) {
    const totalsTableBody: TableCell[][] = [
      [
        { text: 'Osnovica:', fontSize: 10 },
        { text: `${formatCurrency(subtotalSum)} €`, fontSize: 10, alignment: 'right' as const },
      ],
    ];
    
    if (hasDiscount) {
      totalsTableBody.push([
        { text: 'Rabat:', fontSize: 10 },
        { text: `-${formatCurrency(discountSum)} €`, fontSize: 10, alignment: 'right' as const },
      ]);
    }
    
    if (template?.show_pdv_breakdown !== false) {
      totalsTableBody.push([
        { text: 'PDV (25%):', fontSize: 10 },
        { text: `${formatCurrency(pdvSum)} €`, fontSize: 10, alignment: 'right' as const },
      ]);
    }
    
    totalsTableBody.push([
      { text: 'UKUPNO:', bold: true, fontSize: 12 },
      { text: `${formatCurrency(document.totalAmount)} €`, bold: true, fontSize: 12, alignment: 'right' as const },
    ]);

    content.push({
      columns: [
        { width: '*', text: '' },
        {
          width: 180,
          table: {
            widths: ['*', 80],
            body: totalsTableBody,
          },
          layout: {
            hLineWidth: (i: number, node: any) => i === node.table.body.length - 1 ? 1 : 0,
            vLineWidth: () => 0,
            hLineColor: () => '#333333',
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
        },
      ],
      margin: [0, 0, 0, 15] as [number, number, number, number],
    });
  }

  // Notes
  if (document.notes) {
    content.push({
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { text: 'Napomena', bold: true, fontSize: 10, margin: [0, 0, 0, 3] },
                { text: document.notes, fontSize: 10 },
              ],
              fillColor: '#f5f5f5',
              margin: [5, 5, 5, 5],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
      },
      margin: [0, 0, 0, 15],
    });
  }

  // Signature section for Ponuda
  if (document.type === 'ponuda') {
    content.push({
      columns: [
        { width: '*', text: '' },
        {
          width: 200,
          stack: [
            { text: 'M.P.', alignment: 'center', fontSize: 10, margin: [0, 0, 0, 10] },
            document.preparedBy ? { text: `Ponudu izradio/la:\n${document.preparedBy}`, alignment: 'center', fontSize: 10, margin: [0, 0, 0, 15] } : null,
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5 }], alignment: 'center', margin: [25, 0, 25, 3] },
            { text: '(Potpis)', alignment: 'center', fontSize: 9 },
          ].filter(Boolean) as Content[],
        },
      ],
      margin: [0, 20, 0, 0],
    });
  }

  // Signature section for Otpremnica/Nalog
  if (document.type === 'otpremnica' || document.type === 'nalog-dostava-montaza') {
    content.push({
      stack: [
        {
          columns: [
            { width: 80, text: 'Robu preuzeo:', fontSize: 10 },
            { width: 120, canvas: [{ type: 'line', x1: 0, y1: 10, x2: 100, y2: 10, lineWidth: 0.5 }] },
            { width: 50, text: 'MP', fontSize: 10, alignment: 'center' },
            { width: '*', text: '' },
            { width: 120, stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 100, y2: 10, lineWidth: 0.5 }] },
              { text: '(potpis)', fontSize: 8, alignment: 'center', margin: [0, 2, 0, 0] },
            ]},
          ],
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            { width: 80, text: 'Za tvrtku:', fontSize: 10 },
            { width: 120, canvas: [{ type: 'line', x1: 0, y1: 10, x2: 100, y2: 10, lineWidth: 0.5 }] },
            { width: 50, text: 'MP', fontSize: 10, alignment: 'center' },
            { width: '*', text: '' },
            { width: 120, stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 10, x2: 100, y2: 10, lineWidth: 0.5 }] },
              { text: '(potpis)', fontSize: 8, alignment: 'center', margin: [0, 2, 0, 0] },
            ]},
          ],
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            { width: 'auto', text: 'Robu izdao skladištar (puno ime i prezime):', fontSize: 10 },
            { width: 150, canvas: [{ type: 'line', x1: 0, y1: 10, x2: 140, y2: 10, lineWidth: 0.5 }] },
          ],
        },
      ],
      margin: [0, 20, 0, 0],
    });
  }

  // Build document definition
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [30, 30, 30, 60], // left, top, right, bottom (60 for footer)
    content,
    footer: (currentPage: number, pageCount: number) => ({
      stack: [
        { text: 'Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.', alignment: 'center', fontSize: 8, color: '#666666', margin: [30, 0, 30, 5] },
        { text: FOOTER_LINE_1, alignment: 'center', fontSize: 6, color: '#555555', margin: [30, 0, 30, 1] },
        { text: FOOTER_LINE_2, alignment: 'center', fontSize: 6, color: '#555555', margin: [30, 0, 30, 0] },
      ],
    }),
    styles: {
      companyName: {
        fontSize: 16,
        bold: true,
        color: '#333333',
      },
      companyInfo: {
        fontSize: 9,
        color: '#666666',
      },
      documentTitle: {
        fontSize: 16,
        bold: true,
        color: '#000000',
      },
      sectionLabel: {
        fontSize: 9,
        bold: true,
        color: '#333333',
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        fillColor: '#333333',
        color: '#ffffff',
      },
    },
    defaultStyle: {
      fontSize: 10,
      color: '#000000',
    },
    info: {
      title: document.number,
      author: companySettings?.company_name || 'Akord d.o.o.',
      subject: documentTypeLabels[document.type],
    },
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function printPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const iframe = window.document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  window.document.body.appendChild(iframe);
  
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.print();
      // Clean up after print dialog closes
      setTimeout(() => {
        window.document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      }, 1000);
    }, 100);
  };
}
