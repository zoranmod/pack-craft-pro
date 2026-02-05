 /**
  * Helper functions for image processing in PDF generation.
  * Converts image URLs to base64 data URLs for embedding in PDFs.
  */
 
 /**
  * Converts an image URL to a base64 data URL.
  * This is needed because @react-pdf/renderer sometimes fails to load images
  * via URL due to CORS restrictions or timing issues during PDF rendering.
  * 
  * @param url - The URL of the image to convert
  * @returns Promise resolving to a base64 data URL string
  */
 export async function imageUrlToBase64(url: string): Promise<string> {
   const response = await fetch(url);
   const blob = await response.blob();
   return new Promise((resolve, reject) => {
     const reader = new FileReader();
     reader.onloadend = () => resolve(reader.result as string);
     reader.onerror = reject;
     reader.readAsDataURL(blob);
   });
 }
 
 /**
  * Cache for preloaded base64 images to avoid repeated fetches.
  */
 const imageCache = new Map<string, string>();
 
 /**
  * Converts an image URL to base64, with caching for performance.
  * Once an image is loaded, subsequent calls return the cached version.
  * 
  * @param url - The URL of the image to convert
  * @returns Promise resolving to a base64 data URL string
  */
 export async function imageUrlToBase64Cached(url: string): Promise<string> {
   const cached = imageCache.get(url);
   if (cached) {
     return cached;
   }
   
   const base64 = await imageUrlToBase64(url);
   imageCache.set(url, base64);
   return base64;
 }