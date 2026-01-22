import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useFurnitureContractTemplate, type FurnitureContractBgSlot } from '@/hooks/useFurnitureContractTemplate';

function SlotRow({
  slot,
  title,
  signedUrl,
  isUploading,
  onFile,
}: {
  slot: FurnitureContractBgSlot;
  title: string;
  signedUrl: string | null;
  isUploading: boolean;
  onFile: (slot: FurnitureContractBgSlot, file: File) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">Upload PNG za pozadinu (A4)</div>
        </div>
        {signedUrl ? (
          <a
            className="text-sm text-primary underline"
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
          >
            Pregled
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">Nije postavljeno</span>
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor={`bg-${slot}`}>Datoteka</Label>
          <Input
            id={`bg-${slot}`}
            type="file"
            accept="image/png"
            disabled={isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFile(slot, file);
            }}
          />
        </div>
        <div className="flex items-end">
          <Button type="button" variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" />
            Odaberi i učitaj
          </Button>
        </div>
      </div>
    </div>
  );
}

export function FurnitureContractTemplateUploader() {
  const { data, isLoading, upload } = useFurnitureContractTemplate();

  const handleFile = async (slot: FurnitureContractBgSlot, file: File) => {
    if (file.type && file.type !== 'image/png') {
      toast.error('Molim učitajte PNG datoteku.');
      return;
    }
    try {
      await upload.mutateAsync({ slot, file });
      toast.success('Pozadina je učitana.');
    } catch (e: any) {
      toast.error('Greška pri uploadu: ' + (e?.message || 'nepoznato'));
    }
  };

  const isUploading = upload.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ugovor 1:1 (pozadine)</CardTitle>
          <CardDescription>Učitaj 3 pozadinske slike predloška (p1/p2/p3).</CardDescription>
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
        <CardTitle>Ugovor 1:1 (pozadine)</CardTitle>
        <CardDescription>
          Ovo zamjenjuje slanje slika u chat. Nakon upload-a, PDF generiranje uvijek koristi ove pozadine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <SlotRow
          slot="p1"
          title="Stranica 1"
          signedUrl={data?.signedUrls.p1 ?? null}
          isUploading={isUploading}
          onFile={handleFile}
        />
        <Separator />
        <SlotRow
          slot="p2"
          title="Stranica 2"
          signedUrl={data?.signedUrls.p2 ?? null}
          isUploading={isUploading}
          onFile={handleFile}
        />
        <Separator />
        <SlotRow
          slot="p3"
          title="Stranica 3"
          signedUrl={data?.signedUrls.p3 ?? null}
          isUploading={isUploading}
          onFile={handleFile}
        />
      </CardContent>
    </Card>
  );
}
