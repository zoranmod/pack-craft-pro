import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
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

interface ArticleImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExcelRow {
  [key: string]: string | number | undefined;
}

interface ColumnMapping {
  code: string;
  name: string;
  price: string;
  purchasePrice: string;
  stock: string;
  barcode: string;
}

const EMPTY_MAPPING: ColumnMapping = {
  code: '',
  name: '',
  price: '',
  purchasePrice: '',
  stock: '',
  barcode: '',
};

export function ArticleImportDialog({ open, onOpenChange }: ArticleImportDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>(EMPTY_MAPPING);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResults, setImportResults] = useState<{ success: number; failed: number }>({ success: 0, failed: 0 });

  const resetState = () => {
    setStep('upload');
    setExcelData([]);
    setColumns([]);
    setMapping(EMPTY_MAPPING);
    setImportProgress({ current: 0, total: 0 });
    setImportResults({ success: 0, failed: 0 });
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

        // Auto-detect column mappings
        const autoMapping: ColumnMapping = { ...EMPTY_MAPPING };
        cols.forEach(col => {
          const lowerCol = col.toLowerCase();
          if (lowerCol.includes('roba') || lowerCol.includes('šifra') || lowerCol.includes('sifra')) {
            autoMapping.code = col;
          } else if (lowerCol.includes('naziv') || lowerCol.includes('ime') || lowerCol.includes('name')) {
            autoMapping.name = col;
          } else if (lowerCol.includes('mpcijena') || lowerCol.includes('maloprodajna') || lowerCol.includes('prodajna')) {
            autoMapping.price = col;
          } else if (lowerCol.includes('vpcijena') || lowerCol.includes('veleprodajna') || lowerCol.includes('nabavna')) {
            autoMapping.purchasePrice = col;
          } else if (lowerCol.includes('stanje') || lowerCol.includes('zaliha') || lowerCol.includes('količina') || lowerCol.includes('kolicina')) {
            autoMapping.stock = col;
          } else if (lowerCol.includes('barkod') || lowerCol.includes('barcode') || lowerCol.includes('ean')) {
            autoMapping.barcode = col;
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
      toast.error('Naziv artikla je obavezan');
      return;
    }

    setStep('importing');
    setImportProgress({ current: 0, total: excelData.length });
    
    let success = 0;
    let failed = 0;

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const name = String(row[mapping.name] || '').trim();
      
      if (!name) {
        failed++;
        setImportProgress({ current: i + 1, total: excelData.length });
        continue;
      }

      const articleData = {
        user_id: user.id,
        name,
        code: mapping.code ? String(row[mapping.code] || '').trim() || null : null,
        price: mapping.price ? parseFloat(String(row[mapping.price]).replace(',', '.')) || 0 : 0,
        purchase_price: mapping.purchasePrice ? parseFloat(String(row[mapping.purchasePrice]).replace(',', '.')) || 0 : 0,
        stock: mapping.stock ? parseFloat(String(row[mapping.stock]).replace(',', '.')) || 0 : 0,
        barcode: mapping.barcode ? String(row[mapping.barcode] || '').trim() || null : null,
        unit: 'kom',
        pdv: 25,
      };

      const { error } = await supabase.from('articles').insert(articleData);
      
      if (error) {
        console.error('Insert error:', error);
        failed++;
      } else {
        success++;
      }
      
      setImportProgress({ current: i + 1, total: excelData.length });
    }

    setImportResults({ success, failed });
    queryClient.invalidateQueries({ queryKey: ['articles'] });
    
    if (success > 0) {
      toast.success(`Uspješno uvezeno ${success} artikala`);
    }
    if (failed > 0) {
      toast.error(`${failed} artikala nije uvezeno`);
    }
  };

  const previewData = excelData.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetState();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Uvoz artikala iz Excel-a
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
              <div>
                <Label>Šifra (ROBA)</Label>
                <Select value={mapping.code || "__skip__"} onValueChange={(v) => setMapping({ ...mapping, code: v === "__skip__" ? "" : v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi stupac" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">-- Preskoči --</SelectItem>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Naziv *</Label>
                <Select value={mapping.name || "__skip__"} onValueChange={(v) => setMapping({ ...mapping, name: v === "__skip__" ? "" : v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi stupac" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prodajna cijena (MPCIJENA)</Label>
                <Select value={mapping.price || "__skip__"} onValueChange={(v) => setMapping({ ...mapping, price: v === "__skip__" ? "" : v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi stupac" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">-- Preskoči --</SelectItem>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nabavna cijena (VPCIJENA)</Label>
                <Select value={mapping.purchasePrice || "__skip__"} onValueChange={(v) => setMapping({ ...mapping, purchasePrice: v === "__skip__" ? "" : v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi stupac" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">-- Preskoči --</SelectItem>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stanje/Zaliha</Label>
                <Select value={mapping.stock || "__skip__"} onValueChange={(v) => setMapping({ ...mapping, stock: v === "__skip__" ? "" : v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi stupac" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">-- Preskoči --</SelectItem>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Barkod</Label>
                <Select value={mapping.barcode || "__skip__"} onValueChange={(v) => setMapping({ ...mapping, barcode: v === "__skip__" ? "" : v })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Odaberi stupac" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__skip__">-- Preskoči --</SelectItem>
                    {columns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                          {mapping.code === col && <Badge className="ml-2" variant="outline">Šifra</Badge>}
                          {mapping.price === col && <Badge className="ml-2" variant="outline">Cijena</Badge>}
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
                  {importProgress.current} / {importProgress.total} artikala
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
                Uvezi {excelData.length} artikala
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
