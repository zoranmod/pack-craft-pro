import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { WysiwygEditor } from '@/components/contracts/WysiwygEditor';
import { furnitureContractTemplate } from '@/data/contractTemplates';
import { useFurnitureContractTextTemplate } from '@/hooks/useFurnitureContractTextTemplate';

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function plainTextToHtml(text: string) {
  // Very small helper: preserve paragraphs and line breaks.
  const paragraphs = text.split(/\n\n+/g);
  return paragraphs
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('');
}

const VARIABLES = [
  'broj_dokumenta',
  'mjesto',
  'datum',
  'kupac_naziv',
  'kupac_adresa',
  'kupac_oib',
  'kupac_kontakt',
  'specifikacija',
  'cijena',
  'rok_isporuke',
  'predujam',
  'jamstvo',
  'prodavatelj_potpis',
  'kupac_potpis',
  'datum_potpisa',
  'ugradbeni_uredaji',
] as const;

export function FurnitureContractTextTemplateEditor() {
  const { html, isLoading, save, clear } = useFurnitureContractTextTemplate();

  const defaultHtml = useMemo(() => plainTextToHtml(furnitureContractTemplate.content), []);
  const initial = useMemo(() => html ?? defaultHtml, [html, defaultHtml]);

  const [content, setContent] = useState(initial);

  useEffect(() => {
    setContent(initial);
  }, [initial]);

  const isBusy = save.isPending || clear.isPending;

  const handleSave = async () => {
    try {
      await save.mutateAsync({ html: content });
      toast.success('Tekst predloška ugovora je spremljen.');
    } catch (e: any) {
      toast.error('Greška pri spremanju: ' + (e?.message || 'nepoznato'));
    }
  };

  const handleReset = async () => {
    try {
      await clear.mutateAsync();
      toast.success('Predložak je vraćen na zadani tekst.');
    } catch (e: any) {
      toast.error('Greška pri resetu: ' + (e?.message || 'nepoznato'));
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ugovor (tekst predloška)</CardTitle>
          <CardDescription>WYSIWYG tekst koji se koristi za sve nove ugovore.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Učitavam…
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ugovor (tekst predloška)</CardTitle>
        <CardDescription>
          Ovdje uređujete tekst koji se koristi za sve buduće ugovore “Namještaj po mjeri”. Placeholder varijable ostaju u
          formatu <span className="font-mono">{'{{var}}'}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Varijable (copy/paste):{' '}
          <div className="mt-2 flex flex-wrap gap-2">
            {VARIABLES.map((v) => (
              <span key={v} className="font-mono text-xs px-2 py-1 rounded-md border border-border">
                {'{{'}{v}{'}}'}
              </span>
            ))}
          </div>
        </div>

        <Separator />

        <WysiwygEditor content={content} onChange={setContent} editorClassName="min-h-[320px]" />

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset} disabled={isBusy}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Vrati na zadano
          </Button>
          <Button type="button" onClick={handleSave} disabled={isBusy}>
            {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Spremi tekst
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
