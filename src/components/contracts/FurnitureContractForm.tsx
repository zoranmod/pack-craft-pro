import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ContractTemplateField } from '@/data/contractTemplates';

interface FurnitureContractFormProps {
  fields: ContractTemplateField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function FurnitureContractForm({ fields, values, onChange }: FurnitureContractFormProps) {
  const categories = [
    { key: 'basic', title: 'Osnovni podaci', icon: '📋' },
    { key: 'buyer', title: 'Podaci o kupcu', icon: '👤' },
    { key: 'finance', title: 'Predmet i financije', icon: '💰' },
    { key: 'appliances', title: 'Ugrađeni uređaji (opcionalno)', icon: '🔌' },
    { key: 'signature', title: 'Potpisi', icon: '✍️' },
  ];

  const renderField = (field: ContractTemplateField) => {
    const value = values[field.key] || field.defaultValue || '';
    
    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="resize-none"
          />
        </div>
      );
    }

    if (field.type === 'date') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id={field.key}
            type="date"
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
          />
        </div>
      );
    }

    if (field.type === 'number') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className="flex items-center gap-1">
            {field.label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            id={field.key}
            type="number"
            step="0.01"
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className="flex items-center gap-1">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={field.key}
          type="text"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-220px)] pr-2">
      {categories.map((category) => {
        const categoryFields = fields.filter((f) => f.category === category.key);
        if (categoryFields.length === 0) return null;

        return (
          <Card key={category.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span>{category.icon}</span>
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.key === 'appliances' ? (
                <div className="grid grid-cols-2 gap-4">
                  {categoryFields.map(renderField)}
                </div>
              ) : (
                categoryFields.map(renderField)
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
