import { useDocumentFooterSettings, DocumentHeaderFooterSettings } from '@/hooks/useDocumentSettings';
import DOMPurify from 'dompurify';

interface GlobalDocumentFooterProps {
  settings?: DocumentHeaderFooterSettings;
}

function sanitizeSvg(svg: string): string {
  const config = {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['svg', 'path', 'g', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath', 'mask', 'use', 'symbol', 'image'],
    ADD_ATTR: ['viewBox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points', 'transform', 'style', 'class', 'id', 'href', 'xlink:href', 'preserveAspectRatio', 'xmlns', 'xmlns:xlink', 'font-size', 'font-family', 'text-anchor', 'dominant-baseline', 'opacity', 'stop-color', 'stop-opacity', 'offset', 'gradientUnits', 'gradientTransform'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'foreignObject'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
  };
  return DOMPurify.sanitize(svg, config);
}

export function GlobalDocumentFooter({ settings: propSettings }: GlobalDocumentFooterProps) {
  const { data: fetchedSettings } = useDocumentFooterSettings();
  const settings = propSettings || fetchedSettings;

  if (!settings?.enabled) return null;

  const sanitizedSvg = settings.svg ? sanitizeSvg(settings.svg) : null;
  const hasContent = sanitizedSvg || settings.text;

  if (!hasContent) return null;

  return (
    <div
      className="global-document-footer"
      style={{
        paddingTop: `${settings.paddingTop}mm`,
        paddingBottom: `${settings.paddingBottom}mm`,
        maxHeight: `${settings.maxHeightMm + settings.paddingTop + settings.paddingBottom}mm`,
        overflow: 'hidden',
        textAlign: settings.align,
      }}
    >
      {settings.text && (
        <div
          className="text-sm text-gray-700 whitespace-pre-line"
          style={{ marginBottom: sanitizedSvg ? '2mm' : 0 }}
        >
          {settings.text}
        </div>
      )}
      {sanitizedSvg && (
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
          className="inline-block global-footer-svg"
          style={{
            maxHeight: `${settings.maxHeightMm}mm`,
            maxWidth: '100%',
          }}
        />
      )}
    </div>
  );
}
