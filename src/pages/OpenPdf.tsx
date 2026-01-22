import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDocument } from "@/hooks/useDocuments";
import { useCompanySettings } from "@/hooks/useSettings";
import { useActiveTemplate } from "@/hooks/useActiveTemplate";
import { useArticles } from "@/hooks/useArticles";
import { usePonudaLayoutSettings } from "@/hooks/usePonudaLayoutSettings";
import { generatePdfObjectUrl } from "@/lib/pdfGenerator";

/**
 * Opens a PDF in a new tab reliably (no popup), by rendering a protected route
 * that generates the PDF and then navigates the tab to the blob URL.
 */
export default function OpenPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const didRun = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: document, error: documentError, isLoading: isLoadingDocument } = useDocument(id);
  const { data: companySettings } = useCompanySettings();
  const { data: articlesData } = useArticles({ pageSize: 1000 });
  const { data: ponudaLayoutSettings } = usePonudaLayoutSettings();

  const { template, isLoading: isLoadingTemplate } = useActiveTemplate(
    document?.templateId,
    document?.type || "ponuda"
  );

  const enrichedItems = useMemo(() => {
    if (!document?.items) return [];
    if (!articlesData?.articles) return document.items;

    const articleCodeMap = new Map<string, string>();
    articlesData.articles.forEach((article) => {
      if (article.code) {
        articleCodeMap.set(article.name.toLowerCase(), article.code);
      }
    });

    return document.items.map((item) => ({
      ...item,
      code: item.code || articleCodeMap.get(item.name.toLowerCase()) || "",
    }));
  }, [document?.items, articlesData?.articles]);

  useEffect(() => {
    if (didRun.current) return;

    if (isLoadingDocument || isLoadingTemplate) return;
    if (!document) return;

    didRun.current = true;
    setIsGenerating(true);

    (async () => {
      try {
        const mpYMm = document.type === "ponuda" ? ponudaLayoutSettings?.mp.yMm ?? 0 : 0;

        const url = await generatePdfObjectUrl(
          document,
          template,
          companySettings,
          enrichedItems,
          mpYMm
        );

        // Display the PDF in this tab. Use assign so browser Back can return.
        window.location.assign(url);

        // Keep blob alive for viewer load.
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } catch (error) {
        console.error("OpenPdf PDF generation error:", error);
        toast.error("Greška pri generiranju PDF-a");
        didRun.current = false;
      } finally {
        setIsGenerating(false);
      }
    })();
  }, [
    companySettings,
    document,
    enrichedItems,
    isLoadingDocument,
    isLoadingTemplate,
    ponudaLayoutSettings?.mp.yMm,
    template,
  ]);

  const isBusy = isLoadingDocument || isLoadingTemplate || isGenerating;

  if (documentError) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-destructive font-medium">Greška pri učitavanju dokumenta.</div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag
        </Button>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-destructive font-medium">Nedostaje ID dokumenta.</div>
        <Link to="/documents">
          <Button variant="outline">Natrag na dokumente</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Natrag
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <Loader2 className={isBusy ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
          <div>
            <div className="font-medium text-foreground">Generiram PDF…</div>
            <div className="text-sm text-muted-foreground">
              Ovo može potrajati nekoliko sekundi. Tab će se automatski prebaciti na PDF.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
