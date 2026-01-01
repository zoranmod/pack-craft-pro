import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Generates an optimized PDF from an HTML element.
 * Uses balanced settings for good quality and reasonable file size (~1-3MB).
 */
export async function generatePdfFromElement(element: HTMLElement): Promise<Blob> {
  // Clone the element to avoid modifying the original
  const clone = element.cloneNode(true) as HTMLElement;
  
  // A4 dimensions at 96 DPI (screen pixels)
  const a4Width = 794;
  const a4Height = 1123;
  
  // Quality settings - balanced for good quality and reasonable file size
  const scale = 2;
  const imageQuality = 0.82;
  
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
    const maxDim = 400;
    if (img.naturalWidth > maxDim || img.naturalHeight > maxDim) {
      const imgScale = Math.min(maxDim / img.naturalWidth, maxDim / img.naturalHeight);
      img.style.width = `${img.naturalWidth * imgScale}px`;
      img.style.height = `${img.naturalHeight * imgScale}px`;
    }
  });
  
  // Enhance text sharpness
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
          table { border-collapse: collapse !important; }
          td, th { border-color: #000 !important; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });
    
    // Create PDF with compression enabled
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    
    // Convert canvas to JPEG with good quality
    const imgData = canvas.toDataURL('image/jpeg', imageQuality);
    
    // Add the image with FAST compression
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    
    return pdf.output('blob');
  } finally {
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
