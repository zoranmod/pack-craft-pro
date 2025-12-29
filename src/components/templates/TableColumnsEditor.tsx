import { useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TableColumnsEditorProps {
  columns: string[];
  onChange: (columns: string[]) => void;
}

const availableColumns = [
  { value: 'rbr', label: 'R.br.' },
  { value: 'sifra', label: 'Šifra' },
  { value: 'naziv', label: 'Naziv' },
  { value: 'jmj', label: 'Jmj' },
  { value: 'kolicina', label: 'Količina' },
  { value: 'cijena', label: 'Cijena' },
  { value: 'rabat', label: 'Rabat %' },
  { value: 'cijena_s_rabatom', label: 'Cijena s rabatom' },
  { value: 'pdv', label: 'PDV %' },
  { value: 'pdv_iznos', label: 'PDV iznos' },
  { value: 'ukupno', label: 'Ukupno' },
];

export const TableColumnsEditor = ({ columns, onChange }: TableColumnsEditorProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addColumn = (value: string) => {
    if (!columns.includes(value)) {
      onChange([...columns, value]);
    }
  };

  const removeColumn = (index: number) => {
    const newColumns = [...columns];
    newColumns.splice(index, 1);
    onChange(newColumns);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newColumns = [...columns];
    const draggedColumn = newColumns[draggedIndex];
    newColumns.splice(draggedIndex, 1);
    newColumns.splice(index, 0, draggedColumn);
    onChange(newColumns);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getColumnLabel = (value: string) => {
    return availableColumns.find((col) => col.value === value)?.label || value;
  };

  const unusedColumns = availableColumns.filter((col) => !columns.includes(col.value));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Povucite za promjenu redoslijeda. Kliknite X za uklanjanje.
        </p>
        <div className="flex flex-wrap gap-2">
          {columns.map((column, index) => (
            <div
              key={column}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-1 bg-muted px-2 py-1 rounded-md cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm">{getColumnLabel(column)}</span>
              <button
                type="button"
                onClick={() => removeColumn(index)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {unusedColumns.length > 0 && (
        <div className="flex items-center gap-2">
          <Select onValueChange={addColumn}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Dodaj stupac..." />
            </SelectTrigger>
            <SelectContent>
              {unusedColumns.map((col) => (
                <SelectItem key={col.value} value={col.value}>
                  {col.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
