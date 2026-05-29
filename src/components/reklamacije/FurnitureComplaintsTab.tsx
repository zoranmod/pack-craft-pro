import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  FurnitureComplaint,
  useFurnitureComplaints,
  useDeleteFurnitureComplaint,
} from '@/hooks/useFurnitureComplaints';
import { FurnitureComplaintFormDialog } from './FurnitureComplaintFormDialog';

const STATUS_LABEL: Record<string, string> = {
  otvoreno: 'Otvoreno',
  u_tijeku: 'U tijeku',
  rijeseno: 'Riješeno',
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('hr-HR') : '—';

function buildPrintHtml(rows: FurnitureComplaint[]) {
  const today = new Date().toLocaleDateString('hr-HR');
  const body = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.customer_name)}</td>
        <td>${escapeHtml(r.customer_location ?? '')}</td>
        <td>${escapeHtml(r.customer_phone ?? '')}</td>
        <td>${escapeHtml(r.description ?? '')}</td>
        <td>${fmt(r.entry_date)}</td>
        <td>${fmt(r.deadline_date)}</td>
        <td>${STATUS_LABEL[r.status] ?? r.status}</td>
      </tr>`,
    )
    .join('');

  // Fill the rest of the A4 page with empty rows so the list can be filled in by hand.
  // Roughly 18 rows fit on an A4 page after header/title; pad to multiples of 18.
  const ROWS_PER_PAGE = 18;
  const used = rows.length;
  const remainder = used % ROWS_PER_PAGE;
  const emptyCount = used === 0 ? ROWS_PER_PAGE : (remainder === 0 ? 0 : ROWS_PER_PAGE - remainder);
  const emptyRow = `<tr>${'<td>&nbsp;</td>'.repeat(7)}</tr>`;
  const emptyRows = emptyRow.repeat(emptyCount);

  return `<!doctype html><html><head><meta charset="utf-8"><title>Lista reklamacija</title>
  <style>
    @page { size: A4; margin: 14mm; }
    body { font-family: Arial, sans-serif; color: #000; font-size: 13pt; }
    h1 { font-size: 20pt; margin: 0 0 4px; }
    .meta { margin-bottom: 14px; font-size: 12pt; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 6px 8px; text-align: left; vertical-align: top; }
    th { background: #fff; font-weight: bold; }
    tr { page-break-inside: avoid; }
    td.empty { height: 28px; }
  </style></head><body>
    <h1>Lista reklamacija</h1>
    <div class="meta">Datum ispisa: ${today} &middot; Ukupno: ${rows.length}</div>
    <table>
      <thead><tr>
        <th>Ime i prezime</th><th>Lokacija kupca</th><th>Broj telefona</th>
        <th>Opis reklamacije</th><th>Datum upisa</th><th>Rok za rješavanje</th><th>Status</th>
      </tr></thead>
      <tbody>${body}${emptyRows}</tbody>
    </table>
    <script>window.onload=()=>{window.print();}</script>
  </body></html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );
}

export function FurnitureComplaintsTab() {
  const { data = [], isLoading } = useFurnitureComplaints();
  const del = useDeleteFurnitureComplaint();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FurnitureComplaint | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = q
      ? data.filter(
          (r) =>
            r.customer_name.toLowerCase().includes(q) ||
            (r.customer_location ?? '').toLowerCase().includes(q),
        )
      : data;
    // sort by deadline ascending, nulls last
    return [...rows].sort((a, b) => {
      if (!a.deadline_date && !b.deadline_date) return 0;
      if (!a.deadline_date) return 1;
      if (!b.deadline_date) return -1;
      return a.deadline_date.localeCompare(b.deadline_date);
    });
  }, [data, search]);

  const handleAdd = () => { setEditing(null); setOpen(true); };
  const handleEdit = (r: FurnitureComplaint) => { setEditing(r); setOpen(true); };
  const handleDelete = (r: FurnitureComplaint) => {
    if (confirm(`Obrisati reklamaciju za "${r.customer_name}"?`)) del.mutate(r.id);
  };
  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) return;
    w.document.write(buildPrintHtml(filtered));
    w.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži po imenu ili lokaciji..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Ispiši listu
        </Button>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Dodaj reklamaciju
        </Button>
      </div>

      <div className="border border-border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ime i prezime</TableHead>
              <TableHead>Lokacija kupca</TableHead>
              <TableHead>Broj telefona</TableHead>
              <TableHead>Opis reklamacije</TableHead>
              <TableHead>Datum upisa</TableHead>
              <TableHead>Rok za rješavanje</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akcije</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Učitavanje...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nema reklamacija</TableCell></TableRow>
            ) : filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.customer_name}</TableCell>
                <TableCell>{r.customer_location || '—'}</TableCell>
                <TableCell>{r.customer_phone || '—'}</TableCell>
                <TableCell className="max-w-[280px] truncate" title={r.description ?? ''}>
                  {r.description || '—'}
                </TableCell>
                <TableCell>{fmt(r.entry_date)}</TableCell>
                <TableCell>{fmt(r.deadline_date)}</TableCell>
                <TableCell>{STATUS_LABEL[r.status] ?? r.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(r)} title="Uredi">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(r)} title="Obriši">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FurnitureComplaintFormDialog open={open} onOpenChange={setOpen} editing={editing} />
    </div>
  );
}