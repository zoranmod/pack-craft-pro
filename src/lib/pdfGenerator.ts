import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export type PdfQuality = 'normal' | 'high';

interface PdfOptions {
  quality?: PdfQuality;
}

/**
 * Generates an optimized PDF from an HTML element.
 * 'normal' = smaller file size (~0.5-3MB), good for sharing
 * 'high' = larger file size, best for printing
 */
export async function generatePdfFromElement(
  element: HTMLElement, 
  options: PdfOptions = {}
): Promise<Blob> {
  const { quality = 'normal' } = options;
  
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // A4 dimensions at 96 DPI (screen pixels)
  const a4Width = 794;
  const a4Height = 1123;
  
  // Quality settings
  const isHighQuality = quality === 'high';
  const scale = isHighQuality ? 3 : 2; // 2x for normal, 3x for high
  const imageFormat = isHighQuality ? 'PNG' : 'JPEG';
  const imageQuality = isHighQuality ? 1.0 : 0.82; // JPEG quality
  
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
  
  // Optimize images in clone to reduce size
  const images = clone.querySelectorAll('img');
  images.forEach((img) => {
    // Limit image dimensions to reduce memory usage
    const maxDim = isHighQuality ? 800 : 400;
    if (img.naturalWidth > maxDim || img.naturalHeight > maxDim) {
      const scale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
      img.style.width = `${img.naturalWidth * scale}px`;
      img.style.height = `${img.naturalHeight * scale}px`;
    }
  });
  
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
    // Render to canvas
    const canvas = await html2canvas(clone, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: a4Width,
      height: a4Height,
      windowWidth: a4Width,
      windowHeight: a4Height,
      imageTimeout: 15000,
      onclone: (clonedDoc) => {
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
    
    // Create PDF with compression enabled
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true, // Enable compression for smaller file size
    });
    
    // Convert canvas to image data
    const imgData = canvas.toDataURL(
      imageFormat === 'PNG' ? 'image/png' : 'image/jpeg',
      imageQuality
    );
    
    // Add the image - use FAST compression for JPEG, NONE for PNG
    const compression = imageFormat === 'PNG' ? 'NONE' : 'FAST';
    pdf.addImage(imgData, imageFormat, 0, 0, 210, 297, undefined, compression);
    
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
