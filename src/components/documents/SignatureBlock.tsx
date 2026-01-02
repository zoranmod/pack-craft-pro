/**
 * SignatureBlock - Reusable signature block for document templates
 * 
 * Structure:
 * 1. Label (e.g., "Ponudu izradio/la:")
 * 2. Signature line (empty, for signing)
 * 3. Name (below the line)
 * 4. Caption (e.g., "(Potpis)")
 * 
 * Positioned right-aligned, centered content within block
 */

interface SignatureBlockProps {
  label?: string;
  name?: string;
  caption?: string;
  /** Width in mm for print styles */
  widthMm?: number;
  /** For inline styles in PDF/print */
  className?: string;
}

export function SignatureBlock({
  label = 'Ponudu izradio/la:',
  name,
  caption = '(Potpis)',
  widthMm = 75,
  className = '',
}: SignatureBlockProps) {
  return (
    <div
      className={`signature-block ${className}`}
      style={{
        width: `${widthMm}mm`,
        marginLeft: 'auto',
        textAlign: 'center',
      }}
    >
      {/* Label */}
      {label && (
        <p
          style={{
            color: '#000',
            fontSize: '11.5px',
            marginBottom: '2mm',
          }}
        >
          {label}
        </p>
      )}

      {/* Signature line - empty for signing */}
      <div
        className="signature-line"
        style={{
          borderBottom: '1px solid #000',
          width: '100%',
          margin: '10mm 0 3mm',
        }}
      />

      {/* Caption - below the signature line */}
      {caption && (
        <p
          className="signature-caption"
          style={{
            color: '#000',
            fontSize: '10px',
            marginTop: '2mm',
          }}
        >
          {caption}
        </p>
      )}

      {/* Name - below the caption */}
      {name && (
        <p
          className="signature-name"
          style={{
            color: '#000',
            fontSize: '11.5px',
            fontWeight: 600,
            marginTop: '2mm',
          }}
        >
          {name}
        </p>
      )}
    </div>
  );
}
