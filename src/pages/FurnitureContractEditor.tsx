import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { FurnitureContractForm } from '@/components/contracts/FurnitureContractForm';
import { FurnitureContractPreview } from '@/components/contracts/FurnitureContractPreview';
import { getDefaultContractTemplate, ContractTemplate } from '@/data/contractTemplates';
import { useCreateDocument, type CreateDocumentData } from '@/hooks/useDocuments';
import { useSaveDocumentContractArticles } from '@/hooks/useContractArticles';
import { useFurnitureContractTextTemplate } from '@/hooks/useFurnitureContractTextTemplate';
import { toast } from 'sonner';
import { formatDateHR } from '@/lib/utils';

function htmlToPlainText(html: string): string {
  // Browser-only conversion; keeps line breaks reasonably.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const text = doc.body.innerText || '';
  // TipTap sometimes produces extra blank lines; normalize lightly.
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export default function FurnitureContractEditor() {
  const navigate = useNavigate();
  const createDocument = useCreateDocument();
  const saveContractArticles = useSaveDocumentContractArticles();
  const contractTextTemplate = useFurnitureContractTextTemplate();
  
  const template = getDefaultContractTemplate();

  const effectiveTemplate: ContractTemplate = useMemo(() => {
    const html = contractTextTemplate.html;
    if (!html) return template;
    return {
      ...template,
      content: htmlToPlainText(html),
    };
  }, [contractTextTemplate.html, template]);
  
  // Initialize form values with defaults
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    template.fields.forEach(field => {
      if (field.defaultValue) {
        initial[field.key] = field.defaultValue;
      }
      if (field.type === 'date') {
        initial[field.key] = new Date().toISOString().split('T')[0];
      }
    });
    // Generate document number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    initial.broj_dokumenta = `UG-${year}${month}-${random}`;
    return initial;
  });

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  // Validate required fields
  const validateForm = (): boolean => {
    const requiredFields = template.fields.filter(f => f.required);
    const missingFields = requiredFields.filter(f => !values[f.key] || values[f.key].trim() === '');
    
    if (missingFields.length > 0) {
      toast.error(`Popunite obavezna polja: ${missingFields.map(f => f.label).join(', ')}`);
      return false;
    }
    return true;
  };

  // Generate contract content with replaced placeholders
  const generateContractContent = (): string => {
    let content = effectiveTemplate.content;
    
    // Build appliances section
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
    
    const appliancesSection = filledAppliances.length > 0 
      ? `\nUgrađeni uređaji:\n${filledAppliances.join('\n')}` 
      : '';
    
    // Replace all placeholders
    effectiveTemplate.fields.forEach(field => {
      let value = values[field.key] || field.defaultValue || '';
      
      if (field.type === 'date' && value) {
        value = formatDateHR(value);
      }
      
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
      content = content.replace(regex, value);
    });
    
    content = content.replace('{{ugradbeni_uredaji}}', appliancesSection);
    
    return content;
  };

  // Save contract
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const furnitureContractPayload = {
        kind: 'furniture_contract_v1',
        values,
      };

      // Create document
      const documentData: CreateDocumentData = {
        type: 'ugovor',
        clientName: values.kupac_naziv,
        clientAddress: values.kupac_adresa,
        clientOib: values.kupac_oib,
        clientPhone: values.kupac_kontakt,
        customHtmlContent: JSON.stringify(furnitureContractPayload),
        notes: `Specifikacija: ${values.specifikacija || ''}\nRok isporuke: ${values.rok_isporuke || ''}`,
        items: [{
          name: 'Namještaj po mjeri',
          quantity: 1,
          unit: 'komplet',
          price: parseFloat(values.cijena) || 0,
          discount: 0,
          pdv: 25,
          subtotal: parseFloat(values.cijena) || 0,
          total: parseFloat(values.cijena) || 0,
        }],
      };

      const document = await createDocument.mutateAsync(documentData);

      // Save contract as a single article with full content
      const contractContent = generateContractContent();
      await saveContractArticles.mutateAsync({
        documentId: document.id,
        articles: [{
          article_number: 1,
          title: 'Ugovor o izradi namještaja po mjeri',
          content: contractContent,
          sort_order: 0,
        }],
      });

      toast.success('Ugovor je uspješno spremljen!');
      navigate(`/documents/${document.id}`);
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Greška pri spremanju ugovora');
    }
  };

  // Print preview
  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout 
      title="Novi ugovor - Namještaj po mjeri" 
      subtitle="Ugovor o izradi namještaja po mjeri"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ugovor o izradi namještaja po mjeri</h1>
              <p className="text-sm text-muted-foreground">
                Sistemski template s A4 previewom
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Ispis
            </Button>
            <Button onClick={handleSave} disabled={createDocument.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Spremi ugovor
            </Button>
          </div>
        </div>

        {/* Editor Layout: Form left, Preview right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1">
          {/* Form */}
          <div className="print:hidden">
            <FurnitureContractForm 
              fields={template.fields}
              values={values}
              onChange={handleChange}
            />
          </div>

          {/* Preview */}
          <div className="print:w-full">
            <div className="sticky top-4 max-h-[calc(100vh-6rem)] overflow-auto">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 print:hidden">
                Pregled ugovora (A4)
              </h3>
              <div className="transform origin-top-left scale-[0.7] lg:scale-[0.65] xl:scale-[0.75] print:scale-100">
                <FurnitureContractPreview template={effectiveTemplate} values={values} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
