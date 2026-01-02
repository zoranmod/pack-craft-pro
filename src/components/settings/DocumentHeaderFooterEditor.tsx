import { useState, useRef } from 'react';
import { Upload, X, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DocumentHeaderFooterSettings, defaultHeaderSettings, defaultFooterSettings } from '@/hooks/useDocumentSettings';
import DOMPurify from 'dompurify';

interface DocumentHeaderFooterEditorProps {
  type: 'header' | 'footer';
  value: DocumentHeaderFooterSettings;
  onChange: (value: DocumentHeaderFooterSettings) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
}

// Sanitize SVG to prevent XSS
function sanitizeSvg(svg: string): string {
  // Only allow safe SVG elements
  const config = {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['svg', 'path', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'use', 'symbol', 'image'],
    ADD_ATTR: ['viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'style', 'class', 'id', 'href', 'xlink:href', 'preserveAspectRatio', 'xmlns', 'xmlns:xlink', 'font-size', 'font-family', 'text-anchor', 'dominant-baseline', 'opacity', 'stop-color', 'stop-opacity', 'offset', 'gradientUnits', 'gradientTransform'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'foreignObject'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
  };
  return DOMPurify.sanitize(svg, config);
}

// Validate SVG string
function isValidSvg(svg: string): boolean {
  if (!svg || !svg.trim()) return false;
  const trimmed = svg.trim();
  return trimmed.startsWith('<svg') && trimmed.includes('</svg>');
}

export function DocumentHeaderFooterEditor({
  type,
  value,
  onChange,
  onSave,
  onReset,
  isSaving,
}: DocumentHeaderFooterEditorProps) {
  const [svgError, setSvgError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const title = type === 'header' ? 'Zaglavlje dokumenta' : 'Podnožje dokumenta';
  const defaults = type === 'header' ? defaultHeaderSettings : defaultFooterSettings;

  const handleSvgChange = (svg: string) => {
    if (svg && !isValidSvg(svg)) {
      setSvgError('Neispravan SVG format. SVG mora počinjati s <svg> tagom.');
    } else {
      setSvgError(null);
    }
    onChange({ ...value, svg: svg || null });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('svg')) {
      setSvgError('Samo SVG datoteke su dopuštene.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (isValidSvg(content)) {
        setSvgError(null);
        onChange({ ...value, svg: sanitizeSvg(content) });
      } else {
        setSvgError('Neispravan SVG format u datoteci.');
      }
    };
    reader.readAsText(file);
  };

  const clearSvg = () => {
    onChange({ ...value, svg: null });
    setSvgError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sanitizedSvg = value.svg ? sanitizeSvg(value.svg) : null;

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {value.enabled ? 'Aktivno - prikazuje se na svim dokumentima' : 'Neaktivno'}
          </p>
        </div>
        <Switch
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
        />
      </div>

      {value.enabled && (
        <>
          {/* SVG Source */}
          <div className="space-y-4">
            <Label className="text-base font-medium">SVG slika (opcionalno)</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Učitaj datoteku</TabsTrigger>
                <TabsTrigger value="paste">Zalijepi SVG kod</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-4">
                <div className="flex items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Odaberi SVG
                  </Button>
                  {value.svg && (
                    <Button type="button" variant="ghost" size="icon" onClick={clearSvg}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="paste" className="mt-4">
                <Textarea
                  placeholder="Zalijepi SVG kod ovdje..."
                  value={value.svg || ''}
                  onChange={(e) => handleSvgChange(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
            {svgError && <p className="text-sm text-destructive">{svgError}</p>}
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Tekst (opcionalno)</Label>
            <Textarea
              placeholder="Unesite tekst koji će se prikazati..."
              value={value.text || ''}
              onChange={(e) => onChange({ ...value, text: e.target.value || null })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Svaki novi red će biti prikazan zasebno.</p>
          </div>

          {/* Alignment */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Poravnanje</Label>
            <ToggleGroup
              type="single"
              value={value.align}
              onValueChange={(align) => {
                if (align) onChange({ ...value, align: align as 'left' | 'center' | 'right' });
              }}
            >
              <ToggleGroupItem value="left" aria-label="Lijevo">
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" aria-label="Sredina">
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" aria-label="Desno">
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Spacing Controls */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Gornji razmak (mm)</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={value.paddingTop}
                onChange={(e) => onChange({ ...value, paddingTop: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Donji razmak (mm)</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={value.paddingBottom}
                onChange={(e) => onChange({ ...value, paddingBottom: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Maksimalna visina (mm)</Label>
              <Input
                type="number"
                min="5"
                max="100"
                value={value.maxHeightMm}
                onChange={(e) => onChange({ ...value, maxHeightMm: Number(e.target.value) })}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Pregled</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" /> Sakrij
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" /> Prikaži
                  </>
                )}
              </Button>
            </div>
            {showPreview && (
              <div
                className="border border-border rounded-lg p-4 bg-white overflow-hidden"
                style={{
                  paddingTop: `${value.paddingTop}mm`,
                  paddingBottom: `${value.paddingBottom}mm`,
                  maxHeight: `${value.maxHeightMm + value.paddingTop + value.paddingBottom}mm`,
                  textAlign: value.align,
                }}
              >
                {sanitizedSvg && (
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
                    className="inline-block"
                    style={{
                      maxHeight: `${value.maxHeightMm}mm`,
                      maxWidth: '100%',
                    }}
                  />
                )}
                {value.text && (
                  <div className="text-sm text-gray-700 whitespace-pre-line mt-2">
                    {value.text}
                  </div>
                )}
                {!sanitizedSvg && !value.text && (
                  <p className="text-sm text-muted-foreground italic">Nema sadržaja za prikaz</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-4">
        <Button onClick={onSave} disabled={isSaving || !!svgError}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Spremi
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Vrati na zadano
        </Button>
      </div>
    </div>
  );
}
