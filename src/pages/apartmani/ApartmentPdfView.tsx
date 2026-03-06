import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ApartmentDocumentPdf, type ApartmentPdfData } from '@/lib/pdf/ApartmentDocumentPdf';
import { PAYMENT_METHODS, type ApartmentDocument } from '@/types/apartment';
import { differenceInCalendarDays } from 'date-fns';
import { imageUrlToBase64Cached } from '@/lib/imageUtils';
import apartmaniLogo from '@/assets/apartmani-spoljar-logo.jpg';

export default function ApartmentPdfView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const didRun = useRef(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (didRun.current || !id) return;
    didRun.current = true;

    (async () => {
      try {
        const { data: doc, error } = await supabase
          .from('apartment_documents')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !doc) throw new Error('Dokument nije pronađen');

        const pdfMeta = (doc.pdf_data || {}) as any;
        const checkIn = pdfMeta.check_in || doc.date;
        const checkOut = pdfMeta.check_out || doc.date;
        const nights = Math.max(0, differenceInCalendarDays(new Date(checkOut), new Date(checkIn)));
        const pricePerNight = nights > 0 ? Number(doc.total_amount) / nights : Number(doc.total_amount);

        let logoBase64: string | null = null;
        try {
          logoBase64 = await imageUrlToBase64Cached(apartmaniLogo);
        } catch {
          // logo optional
        }

        const pdfData: ApartmentPdfData = {
          documentType: doc.document_type,
          number: doc.number,
          date: doc.date,
          guestName: doc.guest_name || '',
          unitName: pdfMeta.unit_name || '',
          checkIn,
          checkOut,
          nights,
          adults: pdfMeta.adults || 1,
          children: pdfMeta.children || 0,
          breakfastIncluded: pdfMeta.breakfast_included || false,
          pricePerNight,
          totalAmount: Number(doc.total_amount),
          paymentMethod: PAYMENT_METHODS.find(p => p.value === doc.payment_method)?.label || doc.payment_method || '',
          depositAmount: doc.deposit_amount ?? undefined,
          validityDays: doc.validity_days ?? undefined,
          notes: doc.notes || undefined,
          logoBase64,
        };

        const blob = await pdf(<ApartmentDocumentPdf data={pdfData} />).toBlob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err: any) {
        console.error('ApartmentPdfView error:', err);
        toast.error('Greška pri generiranju PDF-a');
        didRun.current = false;
      } finally {
        setIsGenerating(false);
      }
    })();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [id]);

  if (isGenerating) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Generiram PDF…</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2 px-3 h-12 bg-background border-b border-border">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Natrag
        </Button>
      </div>
      {blobUrl ? (
        <iframe src={blobUrl} className="flex-1 w-full border-0 pt-12" title="PDF pregled" />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground pt-12">
          Greška pri generiranju PDF-a.
        </div>
      )}
    </div>
  );
}
