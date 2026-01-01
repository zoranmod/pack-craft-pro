/**
 * Opens the print route for a document and triggers the browser's native print dialog.
 * This creates a vector PDF with selectable text and small file size.
 * 
 * @param documentId - The ID of the document to print
 */
export function openPrintDialog(documentId: string): void {
  // Open the print route in a new window
  const printUrl = `/print/${documentId}`;
  const printWindow = window.open(printUrl, '_blank');
  
  if (!printWindow) {
    // If popup was blocked, navigate directly
    window.location.href = printUrl;
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
