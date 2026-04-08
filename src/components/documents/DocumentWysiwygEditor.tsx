import { useState, useEffect } from 'react';
import { FileCode, Save, X, Eye, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { WysiwygEditor } from '@/components/contracts/WysiwygEditor';
import { Document, documentTypeLabels } from '@/types/document';
import { formatDateHR, formatCurrency } from '@/lib/utils';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface DocumentWysiwygEditorProps {
  document: Document;
  companySettings?: {
    company_name?: string | null;
    address?: string | null;
    oib?: string | null;
    iban?: string | null;
  } | null;
  onClose?: () => void;
}

// Generate default HTML content from document data
const generateDefaultContent = (doc: Document, companySettings?: DocumentWysiwygEditorProps['companySettings']): string => {
  const typeLabel = documentTypeLabels[doc.type] || 'Dokument';
  
  // Generate items table HTML
  const itemsTableHtml = doc.items && doc.items.length > 0 ? `
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <thead>
    <tr style="background-color: #1a365d; color: white;">
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">R.br.</th>
      <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Naziv</th>
      <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Kol.</th>
      <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Jed.</th>
      <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Cijena</th>
      <th style="padding: 8px; text-align: right; border: 1px solid #ddd;">Ukupno</th>
    </tr>
  </thead>
  <tbody>
    ${doc.items.map((item, i) => `
    <tr style="background-color: ${i % 2 === 0 ? '#f9fafb' : '#ffffff'};">
      <td style="padding: 8px; border: 1px solid #ddd;">${i + 1}.</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
      <td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${item.unit}</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.price)}</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(item.total)}</td>
    </tr>`).join('')}
  </tbody>
  <tfoot>
    <tr style="font-weight: bold; background-color: #e5e7eb;">
      <td colspan="5" style="padding: 8px; text-align: right; border: 1px solid #ddd;">UKUPNO:</td>
      <td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(doc.totalAmount)}</td>
    </tr>
  </tfoot>
</table>` : '';

  return `
<h1 style="text-align: center; font-size: 1.5em; margin-bottom: 16px;">${typeLabel.toUpperCase()}</h1>

<div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
  <div>
    <p><strong>Broj dokumenta:</strong> ${doc.number}</p>
    <p><strong>Datum:</strong> ${formatDateHR(doc.date)}</p>
  </div>
</div>

<div style="background-color: #f9fafb; padding: 12px; border-radius: 4px; margin-bottom: 16px;">
  <p style="font-weight: 600; margin-bottom: 4px;">Klijent:</p>
  <p><strong>${doc.clientName}</strong></p>
  <p>${doc.clientAddress}</p>
  ${doc.clientOib ? `<p>OIB: ${doc.clientOib}</p>` : ''}
  ${doc.clientPhone ? `<p>Tel: ${doc.clientPhone}</p>` : ''}
  ${doc.clientEmail ? `<p>Email: ${doc.clientEmail}</p>` : ''}
</div>

${itemsTableHtml}

<div style="text-align: right; margin-top: 16px;">
  <p style="font-size: 1.25em; font-weight: bold; color: #1a365d;">
    UKUPNO: ${formatCurrency(doc.totalAmount)}
  </p>
</div>

${doc.notes ? `
<div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #ddd;">
  <p><strong>Napomene:</strong></p>
  <p>${doc.notes}</p>
</div>` : ''}

<hr style="margin: 32px 0;" />

<p style="text-align: center; font-size: 0.875em; color: #666;">
  Dokument je pisan na računalu i pravovaljan je bez potpisa i pečata.
</p>
`;
};

export function DocumentWysiwygEditor({ document, companySettings, onClose }: DocumentWysiwygEditorProps) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState<string>('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize content from document or generate default
  useEffect(() => {
    if (document.customHtmlContent) {
      setContent(document.customHtmlContent);
    } else {
      setContent(generateDefaultContent(document, companySettings));
    }
  }, [document, companySettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ custom_html_content: content })
        .eq('id', document.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['document', document.id] });
      toast.success('Prilagođeni sadržaj spremljen');
      onClose?.();
    } catch (error) {
      console.error('Error saving custom content:', error);
      toast.error('Greška pri spremanju');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCustomContent = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('documents')
        .update({ custom_html_content: null })
        .eq('id', document.id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['document', document.id] });
      toast.success('Vraćeno na standardni prikaz');
      onClose?.();
    } catch (error) {
      console.error('Error clearing custom content:', error);
      toast.error('Greška pri brisanju');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">WYSIWYG Editor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreview(!isPreview)}
            >
              {isPreview ? (
                <>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Uredi
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Pregled
                </>
              )}
            </Button>
            {document.customHtmlContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCustomContent}
                disabled={isSaving}
              >
                Vrati standard
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              Spremi
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Uredite sadržaj dokumenta po želji. Ovaj prilagođeni prikaz koristit će se pri ispisu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPreview ? (
          <div 
            className="prose prose-sm max-w-none p-4 border rounded-lg bg-white min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        ) : (
          <WysiwygEditor
            content={content}
            onChange={setContent}
            placeholder="Dizajnirajte svoj dokument..."
            editorClassName="min-h-[400px]"
          />
        )}
      </CardContent>
    </Card>
  );
}
