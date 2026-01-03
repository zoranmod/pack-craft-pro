import { useMemo } from 'react';
import { ContractTemplate } from '@/data/contractTemplates';
import { MemorandumHeader } from '@/components/documents/MemorandumHeader';
import { MemorandumFooter } from '@/components/documents/MemorandumFooter';
import { formatDateHR } from '@/lib/utils';

interface FurnitureContractPreviewProps {
  template: ContractTemplate;
  values: Record<string, string>;
}

export function FurnitureContractPreview({ template, values }: FurnitureContractPreviewProps) {
  // Build appliances section if any are filled
  const appliancesSection = useMemo(() => {
    const applianceFields = ['pecnica', 'ploca', 'napa', 'perilica', 'hladnjak', 'mikrovalna'];
    const applianceLabels: Record<string, string> = {
      pecnica: 'Pećnica',
      ploca: 'Ploča za kuhanje',
      napa: 'Napa',
      perilica: 'Perilica suđa',
      hladnjak: 'Hladnjak',
      mikrovalna: 'Mikrovalna',
    };
    
    const filledAppliances = applianceFields
      .filter(key => values[key] && values[key].trim() !== '')
      .map(key => `• ${applianceLabels[key]}: ${values[key]}`);
    
    if (filledAppliances.length === 0) return '';
    
    return `\nUgrađeni uređaji:\n${filledAppliances.join('\n')}`;
  }, [values]);

  // Replace placeholders with actual values
  const processedContent = useMemo(() => {
    let content = template.content;
    
    // Replace all placeholders
    template.fields.forEach(field => {
      let value = values[field.key] || field.defaultValue || '';
      
      // Format dates
      if (field.type === 'date' && value) {
        value = formatDateHR(value);
      }
      
      // Format price with € symbol
      if (field.key === 'cijena' && value) {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          value = new Intl.NumberFormat('hr-HR', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          }).format(numValue);
        }
      }
      
      const regex = new RegExp(`\\{\\{${field.key}\\}\\}`, 'g');
      content = content.replace(regex, value || '________________');
    });
    
    // Replace appliances section
    content = content.replace('{{ugradbeni_uredaji}}', appliancesSection);
    
    return content;
  }, [template, values, appliancesSection]);

  // Split content into sections for better formatting
  const sections = processedContent.split('\n\n');

  return (
    <div className="a4-page-multipage bg-white shadow-lg" style={{ fontSize: '11px', lineHeight: '1.5' }}>
      <div className="doc-body">
        <MemorandumHeader />
        
        <div className="mt-4 space-y-3">
          {sections.map((section, index) => {
            const lines = section.split('\n');
            const firstLine = lines[0];
            
            // Title
            if (index === 0 && firstLine.includes('UGOVOR O IZRADI')) {
              return (
                <div key={index} className="text-center mb-6">
                  <h1 className="text-lg font-bold text-primary uppercase tracking-wide">
                    {firstLine}
                  </h1>
                </div>
              );
            }
            
            // Document number and date
            if (firstLine.startsWith('Dokument broj:')) {
              return (
                <div key={index} className="text-right text-sm text-muted-foreground mb-4">
                  {lines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              );
            }
            
            // Section headers (UGOVORNE STRANE, POTPISI)
            if (firstLine === 'UGOVORNE STRANE' || firstLine === 'POTPISI') {
              return (
                <div key={index} className="mt-6">
                  <h2 className="text-sm font-bold text-primary border-b border-primary pb-1 mb-3">
                    {firstLine}
                  </h2>
                  {lines.slice(1).map((line, i) => (
                    <p key={i} className="text-sm whitespace-pre-wrap">{line}</p>
                  ))}
                </div>
              );
            }
            
            // Articles (Članak X.)
            if (firstLine.startsWith('Članak')) {
              return (
                <div key={index} className="mt-3">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {firstLine}
                  </h3>
                  {lines.slice(1).map((line, i) => (
                    <p key={i} className="text-sm whitespace-pre-wrap">{line}</p>
                  ))}
                </div>
              );
            }
            
            // KUPAC / PRODAVATELJ sections
            if (firstLine === 'KUPAC:' || firstLine === 'PRODAVATELJ:') {
              return (
                <div key={index} className="bg-muted/30 p-3 rounded border border-border/50 mb-2">
                  <p className="font-semibold text-sm">{firstLine}</p>
                  {lines.slice(1).map((line, i) => (
                    <p key={i} className="text-sm">{line}</p>
                  ))}
                </div>
              );
            }
            
            // Signature lines
            if (firstLine.startsWith('Za PRODAVATELJA:') || firstLine.startsWith('KUPAC:') && index > 5) {
              return (
                <div key={index} className="flex justify-between mt-8 pt-4">
                  {lines.map((line, i) => (
                    <div key={i} className="text-center w-1/3">
                      <p className="text-sm border-t border-foreground pt-2 mt-8">{line}</p>
                    </div>
                  ))}
                </div>
              );
            }
            
            // Default paragraph
            return (
              <div key={index} className="text-sm whitespace-pre-wrap">
                {lines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="doc-footer">
        <p className="legal-note text-xs text-center text-muted-foreground mb-2">
          Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
        </p>
        <MemorandumFooter />
      </div>
    </div>
  );
}
