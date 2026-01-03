import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SupplierImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExcelRow {
  [key: string]: string | number | undefined;
}

interface ColumnMapping {
  name: string;
  oib: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  contactPerson: string;
  notes: string;
}

const EMPTY_MAPPING: ColumnMapping = {
  name: '',
  oib: '',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  email: '',
  contactPerson: '',
  notes: '',
};

export function SupplierImportDialog({ open, onOpenChange }: SupplierImportDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing'>('upload');
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>(EMPTY_MAPPING);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState<{ success: number; failed: number; skipped: number }>({ success: 0, failed: 0, skipped: 0 });

  const resetState = () => {
    setStep('upload');
    setExcelData([]);
    setColumns([]);
    setMapping(EMPTY_MAPPING);
    setImportProgress({ current: 0, total: 0 });
    setImportResults({ success: 0, failed: 0, skipped: 0 });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, { defval: '' });
        
        if (jsonData.length === 0) {
          toast.error('Excel datoteka je prazna');
          return;
        }

        const cols = Object.keys(jsonData[0]);
        setColumns(cols);
        setExcelData(jsonData);

        // Auto-detect column mappings based on common column names
        const autoMapping: ColumnMapping = { ...EMPTY_MAPPING };
        cols.forEach(col => {
          const lowerCol = col.toLowerCase();
          if (lowerCol.includes('naziv') || lowerCol.includes('ime') || lowerCol.includes('name') || lowerCol.includes('tvrtka') || lowerCol.includes('firma')) {
            autoMapping.name = col;
          } else if (lowerCol.includes('oib') || lowerCol.includes('matični')) {
            autoMapping.oib = col;
          } else if (lowerCol.includes('ulica') || lowerCol.includes('adresa') || lowerCol.includes('address')) {
            autoMapping.address = col;
          } else if (lowerCol.includes('grad') || lowerCol.includes('mjesto') || lowerCol.includes('city')) {
            autoMapping.city = col;
          } else if (lowerCol.includes('poštanski') || lowerCol.includes('postanski') || lowerCol.includes('zip') || lowerCol.includes('postal')) {
            autoMapping.postalCode = col;
          } else if (lowerCol.includes('telefon') || lowerCol.includes('phone') || lowerCol.includes('tel') || lowerCol.includes('mob')) {
            autoMapping.phone = col;
          } else if (lowerCol.includes('email') || lowerCol.includes('e-mail') || lowerCol.includes('mail')) {
            autoMapping.email = col;
          } else if (lowerCol.includes('kontakt') || lowerCol.includes('contact') || lowerCol.includes('osoba')) {
            autoMapping.contactPerson = col;
          } else if (lowerCol.includes('napomena') || lowerCol.includes('notes') || lowerCol.includes('ostalo') || lowerCol.includes('komentar')) {
            autoMapping.notes = col;
          }
        });
        setMapping(autoMapping);
        setStep('mapping');
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error('Greška pri čitanju Excel datoteke');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!user || !mapping.name) {
      toast.error('Naziv dobavljača je obavezan');
      return;
    }

    setStep('importing');
    setImportProgress({ current: 0, total: excelData.length });
    
    let success = 0;
    let failed = 0;
    let skipped = 0;

    // First, get existing OIBs to check for duplicates
    const { data: existingSuppliers } = await supabase
      .from('dobavljaci')
      .select('oib')
      .eq('user_id', user.id)
      .is('deleted_at', null);
    
    const existingOibs = new Set(
      existingSuppliers?.map(s => s.oib?.trim()).filter(Boolean) || []
    );

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const name = String(row[mapping.name] || '').trim();
      
      if (!name) {
        failed++;
        setImportProgress({ current: i + 1, total: excelData.length });
        continue;
      }

      const oib = mapping.oib ? String(row[mapping.oib] || '').trim() : null;
      
      // Skip if OIB already exists
      if (oib && existingOibs.has(oib)) {
        skipped++;
        setImportProgress({ current: i + 1, total: excelData.length });
        continue;
      }

      const supplierData = {
        user_id: user.id,
        name,
        oib: oib || null,
        address: mapping.address ? String(row[mapping.address] || '').trim() || null : null,
        city: mapping.city ? String(row[mapping.city] || '').trim() || null : null,
        postal_code: mapping.postalCode ? String(row[mapping.postalCode] || '').trim() || null : null,
        phone: mapping.phone ? String(row[mapping.phone] || '').trim() || null : null,
        email: mapping.email ? String(row[mapping.email] || '').trim() || null : null,
        contact_person: mapping.contactPerson ? String(row[mapping.contactPerson] || '').trim() || null : null,
        notes: mapping.notes ? String(row[mapping.notes] || '').trim() || null : null,
      };

      const { error } = await supabase.from('dobavljaci').insert(supplierData);
      
      if (error) {
        console.error('Insert error:', error);
        failed++;
      } else {
        success++;
        if (oib) existingOibs.add(oib); // Add to set to prevent duplicates within same import
      }
      
      setImportProgress({ current: i + 1, total: excelData.length });
    }

    setImportResults({ success, failed, skipped });
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    
    if (success > 0) {
      toast.success(`Uspješno uvezeno ${success} dobavljača`);
    }
    if (skipped > 0) {
      toast.info(`${skipped} dobavljača preskočeno (već postoje)`);
    }
    if (failed > 0) {
      toast.error(`${failed} dobavljača nije uvezeno`);
    }
  };

  const previewData = excelData.slice(0, 5);

  const MappingSelect = ({ label, value, field, required = false }: { label: string; value: string; field: keyof ColumnMapping; required?: boolean }) => (
    <div>
      <Label>{label}{required && ' *'}</Label>
      <Select 
        value={value || "__skip__"} 
        onValueChange={(v) => setMapping({ ...mapping, [field]: v === "__skip__" ? "" : v })}
      >
        <SelectTrigger className="mt-1.5">
          <SelectValue placeholder="Odaberi stupac" />
        </SelectTrigger>
        <SelectContent>
          {!required && <SelectItem value="__skip__">-- Preskoči --</SelectItem>}
          {columns.map(col => (
            <SelectItem key={col} value={col}>{col}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Uvoz dobavljača iz Excel-a
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="py-8">
            <div 
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Odaberi Excel datoteku</h3>
              <p className="text-muted-foreground text-sm">Podržani formati: .xlsx, .xls, .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MappingSelect label="Naziv" value={mapping.name} field="name" required />
              <MappingSelect label="OIB" value={mapping.oib} field="oib" />
              <MappingSelect label="Kontakt osoba" value={mapping.contactPerson} field="contactPerson" />
              <MappingSelect label="Telefon" value={mapping.phone} field="phone" />
              <MappingSelect label="Email" value={mapping.email} field="email" />
              <MappingSelect label="Adresa" value={mapping.address} field="address" />
              <MappingSelect label="Poštanski broj" value={mapping.postalCode} field="postalCode" />
              <MappingSelect label="Grad" value={mapping.city} field="city" />
              <MappingSelect label="Napomene" value={mapping.notes} field="notes" />
            </div>

            <div>
              <h4 className="font-medium mb-2">Pregled podataka ({excelData.length} redaka)</h4>
              <ScrollArea className="h-64 border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map(col => (
                        <TableHead key={col} className="whitespace-nowrap">
                          {col}
                          {mapping.name === col && <Badge className="ml-2" variant="secondary">Naziv</Badge>}
                          {mapping.oib === col && <Badge className="ml-2" variant="outline">OIB</Badge>}
                          {mapping.contactPerson === col && <Badge className="ml-2" variant="outline">Kontakt</Badge>}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, idx) => (
                      <TableRow key={idx}>
                        {columns.map(col => (
                          <TableCell key={col} className="whitespace-nowrap">
                            {String(row[col] || '-')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {excelData.length > 5 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Prikazano prvih 5 od {excelData.length} redaka
                </p>
              )}
            </div>
          </div>
        )}

        {step === 'importing' && (
          <div className="py-8 text-center">
            {importProgress.current < importProgress.total ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <h3 className="text-lg font-medium mb-2">Uvoz u tijeku...</h3>
                <p className="text-muted-foreground">
                  {importProgress.current} / {importProgress.total} dobavljača
                </p>
                <div className="w-full max-w-xs mx-auto mt-4 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Uvoz završen!</h3>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{importResults.success}</div>
                    <div className="text-sm text-muted-foreground">Uspješno</div>
                  </div>
                  {importResults.skipped > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-amber-500">{importResults.skipped}</div>
                      <div className="text-sm text-muted-foreground">Preskočeno</div>
                    </div>
                  )}
                  {importResults.failed > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">{importResults.failed}</div>
                      <div className="text-sm text-muted-foreground">Neuspješno</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={resetState}>
                Natrag
              </Button>
              <Button onClick={handleImport} disabled={!mapping.name}>
                Uvezi {excelData.length} dobavljača
              </Button>
            </>
          )}
          {step === 'importing' && importProgress.current >= importProgress.total && (
            <Button onClick={() => onOpenChange(false)}>
              Zatvori
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
