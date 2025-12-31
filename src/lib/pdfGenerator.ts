import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a PDF from an HTML element by rendering it to a canvas.
 * This ensures the PDF looks identical to the preview.
 */
export async function generatePdfFromElement(element: HTMLElement): Promise<Blob> {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Set fixed dimensions for A4 at 96 DPI (screen)
  // A4: 210mm x 297mm = 794px x 1123px at 96 DPI
  const a4Width = 794;
  const a4Height = 1123;
  
  // Create a container for rendering - visible but off-screen via z-index
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: ${a4Width}px;
    height: ${a4Height}px;
    overflow: hidden;
    background: #ffffff;
    z-index: -9999;
    pointer-events: none;
  `;
  
  // Style the clone with flexbox to ensure footer renders correctly
  clone.style.cssText = `
    width: ${a4Width}px !important;
    height: ${a4Height}px !important;
    min-height: ${a4Height}px !important;
    max-height: ${a4Height}px !important;
    overflow: hidden !important;
    margin: 0 !important;
    box-shadow: none !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
  `;
  
  // Ensure doc-body and doc-footer have correct flex styles
  const docBody = clone.querySelector('.doc-body') as HTMLElement;
  const docFooter = clone.querySelector('.doc-footer') as HTMLElement;
  
  if (docBody) {
    docBody.style.cssText += 'flex: 1 !important; overflow: hidden !important;';
  }
  
  if (docFooter) {
    docFooter.style.cssText += 'flex-shrink: 0 !important; margin-top: auto !important;';
  }
  
  container.appendChild(clone);
  document.body.appendChild(container);
  
  try {
    // Render to canvas with high resolution
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: a4Width,
      height: a4Height,
      windowWidth: a4Width,
      windowHeight: a4Height,
    });
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    // Add the canvas as image - exactly A4 size (210x297mm)
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    return pdf.output('blob');
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
}

/**
 * Downloads a PDF blob as a file
 */
export function downloadPdf(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Opens the PDF for printing using a hidden iframe (avoids popup blockers)
 */
export function printPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  
  // Create hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: none;';
  iframe.src = url;
  
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      // Fallback: download the PDF
      downloadPdf(blob, 'document.pdf');
    }
    
    // Cleanup after delay
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      URL.revokeObjectURL(url);
    }, 60000);
  };
  
  document.body.appendChild(iframe);
}
