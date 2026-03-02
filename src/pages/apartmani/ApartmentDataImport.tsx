import { useState } from 'react';
import { ApartmentLayout } from '@/components/apartmani/ApartmentLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useOwnerUserId } from '@/hooks/useOwnerUserId';
import { toast } from 'sonner';
import { Upload, Check, Loader2, DollarSign, FileText, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

// Hardcoded price list from Excel
const PRICE_LIST = [
  { unit_type: 'apartment', persons: 1, price_without_breakfast: 50, price_with_breakfast: 60 },
  { unit_type: 'apartment', persons: 2, price_without_breakfast: 60, price_with_breakfast: 80 },
  { unit_type: 'apartment', persons: 3, price_without_breakfast: 80, price_with_breakfast: 110 },
  { unit_type: 'apartment', persons: 4, price_without_breakfast: 100, price_with_breakfast: 140 },
  { unit_type: 'apartment', persons: 5, price_without_breakfast: 120, price_with_breakfast: 170 },
  { unit_type: 'apartment', persons: 6, price_without_breakfast: 140, price_with_breakfast: 200 },
  { unit_type: 'room', persons: 1, price_without_breakfast: 50, price_with_breakfast: 60 },
  { unit_type: 'room', persons: 2, price_without_breakfast: 60, price_with_breakfast: 80 },
  { unit_type: 'room', persons: 3, price_without_breakfast: 80, price_with_breakfast: 110 },
];

// Hardcoded invoices from Excel
const INVOICES = [
  { number: 'R-1/2026', payment_method: 'BOOKING', date: '2026-01-19', total_amount: 360 },
  { number: 'R-2/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-01-20', total_amount: 200 },
  { number: 'R-3/2026', payment_method: 'BOOKING', date: '2026-01-20', total_amount: 100 },
  { number: 'R-4/2026', payment_method: 'GOTOVINSKI', date: '2026-01-30', total_amount: 114 },
  { number: 'R-5/2026', payment_method: 'GOTOVINSKI', date: '2026-01-30', total_amount: 228 },
  { number: 'R-6/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-05', total_amount: 158 },
  { number: 'R-7/2026', payment_method: 'GOTOVINSKI', date: '2026-02-07', total_amount: 456 },
  { number: 'R-8/2026', payment_method: 'GOTOVINSKI', date: '2026-02-16', total_amount: 148 },
  { number: 'R-9/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-17', total_amount: 100 },
  { number: 'R-10/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-17', total_amount: 655 },
  { number: 'R-11/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 150 },
  { number: 'R-12/2026', payment_method: 'GOTOVINSKI', date: '2026-02-19', total_amount: 40 },
  { number: 'R-13/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 110 },
  { number: 'R-14/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 210 },
  { number: 'R-15/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 74 },
  { number: 'R-16/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 57 },
  { number: 'R-17/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 202 },
  { number: 'R-18/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 78 },
  { number: 'R-19/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-19', total_amount: 57 },
  { number: 'R-20/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-21', total_amount: 57 },
  { number: 'R-21/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-21', total_amount: 202 },
  { number: 'R-22/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-21', total_amount: 57 },
  { number: 'R-23/2026', payment_method: 'TRANSAKCIJSKI', date: '2026-02-21', total_amount: 2660 },
  { number: 'R-24/2026', payment_method: 'GOTOVINSKI', date: '2026-02-26', total_amount: 100 },
];

interface SupplierRow {
  name: string;
  city: string;
  postal_code: string;
  address: string;
  oib: string;
  contact_person: string;
}

function parseExcelSuppliers(file: File): Promise<SupplierRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // The supplier data is on the 7th sheet (index 6) or we search for it
        // Try multiple sheets to find the one with supplier data
        const suppliers: SupplierRow[] = [];
        const seen = new Set<string>();
        
        for (let i = 0; i < workbook.SheetNames.length; i++) {
          const sheet = workbook.Sheets[workbook.SheetNames[i]];
          const rows = XLSX.utils.sheet_to_json<any>(sheet, { header: 1, defval: '' });
          
          for (const row of rows) {
            // Look for rows that have a name in col 0, a code-like value in col 1, city in col 2, address in col 3, OIB in col 4
            const name = String(row[0] || '').trim();
            const code = String(row[1] || '').trim();
            const cityPostal = String(row[2] || '').trim();
            const address = String(row[3] || '').trim();
            const oib = String(row[4] || '').trim();
            const contact = String(row[5] || '').trim();
            
            // Skip header rows and empty rows
            if (!name || name === 'Naziv' || name === 'KUPAC' || name === 'Kupac:') continue;
            // Must have OIB-like field (numeric, at least 8 digits)
            if (!oib || !/^\d{8,}$/.test(oib.replace(/\D/g, ''))) continue;
            // Skip if already seen (dedup by OIB)
            const cleanOib = oib.replace(/\D/g, '');
            if (seen.has(cleanOib)) continue;
            seen.add(cleanOib);
            
            // Parse city and postal code
            let city = cityPostal;
            let postal_code = '';
            
            // Format could be "Zagreb, 10000" or just "ZAGREB"
            const commaMatch = cityPostal.match(/^(.+),\s*(\d+)$/);
            if (commaMatch) {
              city = commaMatch[1].trim();
              postal_code = commaMatch[2].trim();
            } else if (/^\d+$/.test(code)) {
              // If the code column looks like a postal code (5 digits), use city from col 2
              postal_code = code.length === 5 ? code : '';
            }
            
            // Parse contact person (format: "Name, Phone, Email")
            let contact_person = '';
            if (contact) {
              const contactParts = contact.split(',');
              contact_person = contactParts[0]?.trim() || '';
            }
            
            suppliers.push({
              name,
              city: city || '',
              postal_code: postal_code || '',
              address: address || '',
              oib: cleanOib,
              contact_person,
            });
          }
        }
        
        resolve(suppliers);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export default function ApartmentDataImport() {
  const { user } = useAuth();
  const ownerUserId = useOwnerUserId();
  const [priceImported, setPriceImported] = useState(false);
  const [invoiceImported, setInvoiceImported] = useState(false);
  const [supplierImported, setSupplierImported] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [supplierCount, setSupplierCount] = useState(0);

  const importPriceList = async () => {
    if (!ownerUserId) { toast.error('Niste prijavljeni'); return; }
    setPriceLoading(true);
    try {
      // Delete existing prices first
      await supabase.from('apartment_price_list').delete().eq('owner_user_id', ownerUserId);
      
      const rows = PRICE_LIST.map(p => ({ ...p, owner_user_id: ownerUserId }));
      const { error } = await supabase.from('apartment_price_list').insert(rows);
      if (error) throw error;
      setPriceImported(true);
      toast.success(`Cjenik importiran (${rows.length} stavki)`);
    } catch (e: any) {
      toast.error('Greška: ' + e.message);
    } finally {
      setPriceLoading(false);
    }
  };

  const importInvoices = async () => {
    if (!ownerUserId) { toast.error('Niste prijavljeni'); return; }
    setInvoiceLoading(true);
    try {
      const rows = INVOICES.map(inv => ({
        owner_user_id: ownerUserId,
        number: inv.number,
        document_type: 'racun',
        date: inv.date,
        total_amount: inv.total_amount,
        payment_method: inv.payment_method.toLowerCase(),
        status: 'completed',
      }));
      const { error } = await supabase.from('apartment_documents').insert(rows);
      if (error) throw error;
      setInvoiceImported(true);
      toast.success(`Računi importirani (${rows.length} stavki)`);
    } catch (e: any) {
      toast.error('Greška: ' + e.message);
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleSupplierFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setSupplierLoading(true);
    try {
      const suppliers = await parseExcelSuppliers(file);
      if (suppliers.length === 0) {
        toast.error('Nije pronađen niti jedan dobavljač u Excelu');
        return;
      }
      
      // Batch insert in chunks of 50
      const chunkSize = 50;
      let inserted = 0;
      for (let i = 0; i < suppliers.length; i += chunkSize) {
        const chunk = suppliers.slice(i, i + chunkSize).map(s => ({
          user_id: user.id,
          name: s.name,
          city: s.city || null,
          postal_code: s.postal_code || null,
          address: s.address || null,
          oib: s.oib || null,
          contact_person: s.contact_person || null,
        }));
        const { error } = await supabase.from('dobavljaci').insert(chunk);
        if (error) throw error;
        inserted += chunk.length;
      }
      
      setSupplierCount(inserted);
      setSupplierImported(true);
      toast.success(`Dobavljači importirani (${inserted} zapisa)`);
    } catch (e: any) {
      toast.error('Greška pri importu: ' + e.message);
    } finally {
      setSupplierLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <ApartmentLayout title="Import podataka">
      <div className="max-w-2xl space-y-4">
        {/* Price List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cjenik apartmana
            </CardTitle>
            <CardDescription>
              9 stavki: Apartman (1-6 osoba) i Soba (1-3 osobe), s/bez doručka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={importPriceList}
              disabled={priceLoading || priceImported}
            >
              {priceLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {priceImported && <Check className="h-4 w-4" />}
              {priceImported ? 'Importirano ✓' : 'Importiraj cjenik'}
            </Button>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Evidencija računa
            </CardTitle>
            <CardDescription>
              24 računa iz 2026. godine (gotovinski, transakcijski, Booking)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={importInvoices}
              disabled={invoiceLoading || invoiceImported}
            >
              {invoiceLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {invoiceImported && <Check className="h-4 w-4" />}
              {invoiceImported ? 'Importirano ✓' : 'Importiraj račune'}
            </Button>
          </CardContent>
        </Card>

        {/* Suppliers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Baza dobavljača (Akord ERP)
            </CardTitle>
            <CardDescription>
              Odaberite Excel datoteku (Apartmani_2026.xlsm) — sustav će automatski parsirati dobavljače i unijeti ih u bazu.
              {supplierImported && ` Importirano: ${supplierCount} zapisa.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {supplierImported ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600" />
                Importirano {supplierCount} dobavljača
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".xlsx,.xlsm,.xls"
                  onChange={handleSupplierFile}
                  disabled={supplierLoading}
                  className="max-w-xs"
                />
                {supplierLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importiranje...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ApartmentLayout>
  );
}
