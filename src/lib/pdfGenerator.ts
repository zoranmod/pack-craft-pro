import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates a high-quality PDF from an HTML element.
 * Uses high DPI rendering for crisp text and lines.
 */
export async function generatePdfFromElement(element: HTMLElement): Promise<Blob> {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // A4 dimensions at 96 DPI (screen pixels)
  // A4: 210mm x 297mm = 794px x 1123px at 96 DPI
  const a4Width = 794;
  const a4Height = 1123;
  
  // High resolution scale for print quality (3x = ~288 DPI)
  const scale = 3;
  
  // Create a container for rendering
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
  
  // Style the clone for precise A4 rendering
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
    -webkit-font-smoothing: antialiased !important;
    -moz-osx-font-smoothing: grayscale !important;
    text-rendering: optimizeLegibility !important;
  `;
  
  // Ensure doc-body and doc-footer have correct flex styles
  const docBody = clone.querySelector('.doc-body') as HTMLElement;
  const docFooter = clone.querySelector('.doc-footer') as HTMLElement;
  
  if (docBody) {
    docBody.style.cssText += 'flex: 1 1 auto !important; overflow: hidden !important; min-height: 0 !important;';
  }
  
  if (docFooter) {
    docFooter.style.cssText += 'flex-shrink: 0 !important; margin-top: auto !important;';
  }
  
  // Enhance text sharpness in all elements
  const allElements = clone.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
    htmlEl.style.setProperty('text-rendering', 'optimizeLegibility', 'important');
  });
  
  container.appendChild(clone);
  document.body.appendChild(container);
  
  // Wait for fonts and images to load
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 100));
  
  try {
    // Render to canvas with high resolution for print quality
    const canvas = await html2canvas(clone, {
      scale: scale, // 3x scale for ~288 DPI print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: a4Width,
      height: a4Height,
      windowWidth: a4Width,
      windowHeight: a4Height,
      imageTimeout: 15000,
      // Ensure sharp rendering
      onclone: (clonedDoc) => {
        // Apply print-quality styles to cloned document
        const style = clonedDoc.createElement('style');
        style.textContent = `
          * {
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
          table {
            border-collapse: collapse !important;
          }
          td, th {
            border-color: #000 !important;
          }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: false, // Disable compression for maximum quality
    });
    
    // Use PNG format for crisp text (lossless)
    // Higher quality than JPEG for text and line art
    const imgData = canvas.toDataURL('image/png');
    
    // Add the canvas as image - exactly A4 size (210x297mm)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'NONE');
    
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
