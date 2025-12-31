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
  
  // Create a container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${a4Width}px`;
  container.style.height = `${a4Height}px`;
  container.style.overflow = 'hidden';
  container.style.backgroundColor = '#ffffff';
  
  // Style the clone to fit exactly
  clone.style.width = `${a4Width}px`;
  clone.style.height = `${a4Height}px`;
  clone.style.minHeight = `${a4Height}px`;
  clone.style.maxHeight = `${a4Height}px`;
  clone.style.overflow = 'hidden';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.transform = 'none';
  
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
 * Opens the PDF in a new tab for printing
 */
export function printPdf(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Clean up URL after a delay
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}
