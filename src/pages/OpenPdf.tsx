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

export default function OpenPdf() {
  const { id } = useParams();
  const navigate = useNavigate();
  const didRun = useRef(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

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

        setBlobUrl(url);
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

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

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

  const isBusy = isLoadingDocument || isLoadingTemplate || isGenerating;

  if (isBusy) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Generiram PDF…</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-2 p-2 border-b bg-background shrink-0">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Natrag
        </Button>
      </div>
      {blobUrl ? (
        <iframe src={blobUrl} className="flex-1 w-full border-0" title="PDF pregled" />
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Greška pri generiranju PDF-a.
        </div>
      )}
    </div>
  );
}
