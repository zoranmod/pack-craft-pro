import { Button } from '@/components/ui/button';
import { Move, Save, RotateCcw, X } from 'lucide-react';

interface LayoutEditorProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  documentType: string;
  draftMpYMm: number;
  onDraftChange: (value: number) => void;
  onSave: () => void;
  onReset: () => void;
  isSaving: boolean;
}

export function LayoutEditor({ 
  isEditing, 
  onToggleEdit, 
  documentType,
  draftMpYMm,
  onDraftChange,
  onSave,
  onReset,
  isSaving,
}: LayoutEditorProps) {
  // Only show for ponuda
  if (documentType !== 'ponuda') {
    return null;
  }

  if (!isEditing) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="rounded-lg"
        onClick={onToggleEdit}
      >
        <Move className="mr-2 h-4 w-4" />
        Uredi raspored
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
      <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
        M.P. pomak: {draftMpYMm > 0 ? '+' : ''}{draftMpYMm}mm
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          onClick={() => onDraftChange(draftMpYMm - 1)}
        >
          ↑
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2"
          onClick={() => onDraftChange(draftMpYMm + 1)}
        >
          ↓
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2"
        onClick={onReset}
        title="Reset na default"
      >
        <RotateCcw className="h-3 w-3" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2"
        onClick={onToggleEdit}
      >
        <X className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        className="h-7 px-2"
        onClick={onSave}
        disabled={isSaving}
      >
        <Save className="h-3 w-3 mr-1" />
        Spremi
      </Button>
    </div>
  );
}
