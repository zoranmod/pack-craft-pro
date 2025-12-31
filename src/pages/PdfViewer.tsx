import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { downloadPdf } from "@/lib/pdfGenerator";

type ViewerState =
  | { status: "waiting" }
  | { status: "ready"; pdfUrl: string; filename: string }
  | { status: "error"; message: string };

export default function PdfViewer() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [state, setState] = useState<ViewerState>({ status: "waiting" });
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    if (!token) {
      setState({ status: "error", message: "Nedostaje token za PDF." });
      return;
    }

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data as
        | {
            type?: string;
            token?: string;
            blob?: Blob;
            filename?: string;
          }
        | undefined;

      if (!data || data.type !== "LOVABLE_PDF_BLOB") return;
      if (!data.token || data.token !== token) return;
      if (!data.blob) {
        setState({ status: "error", message: "PDF nije ispravno poslan." });
        return;
      }

      const filename = data.filename || "document.pdf";
      blobRef.current = data.blob;

      const pdfUrl = URL.createObjectURL(data.blob);
      document.title = filename;
      setState({ status: "ready", pdfUrl, filename });
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [token]);

  useEffect(() => {
    if (state.status !== "ready") return;
    return () => {
      URL.revokeObjectURL(state.pdfUrl);
    };
  }, [state]);

  const headerContent = (
    <header className="flex items-center justify-between border-b border-border px-4 py-2">
      <div className="text-sm text-muted-foreground">PDF pregled</div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          if (!blobRef.current) return;
          const filename = state.status === "ready" ? state.filename : "document.pdf";
          downloadPdf(blobRef.current, filename);
        }}
        disabled={!blobRef.current}
      >
        Preuzmi
      </Button>
    </header>
  );

  return (
    <main className="h-[100dvh] bg-background">
      {headerContent}

      {state.status === "ready" ? (
        <iframe
          title="PDF"
          src={state.pdfUrl}
          className="h-[calc(100dvh-49px)] w-full"
        />
      ) : (
        <section className="h-[calc(100dvh-49px)] w-full flex items-center justify-center">
          {state.status === "error" ? (
            <p className="text-sm text-destructive">{state.message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Čekam PDF...</p>
          )}
        </section>
      )}
    </main>
  );
}
