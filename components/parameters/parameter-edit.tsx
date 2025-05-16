'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ParameterEditProps {
  value: number;
  unit: string;
  onSave: (value: number, unit: string) => Promise<void>;
  min?: number;
  max?: number;
  step?: number;
  parameter: string;
}

const parameterUnits = {
  weight: 'kg',
  bloodPressureSystolic: 'mmHg',
  bloodPressureDiastolic: 'mmHg',
  bloodSugar: 'mg/dL',
  heartRate: 'BPM',
};

export function ParameterEdit({
  value,
  unit,
  onSave,
  min,
  max,
  step = 0.1,
  parameter,
}: ParameterEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedValue(value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValue(value);
  };

  const handleSave = async () => {
    if (min !== undefined && editedValue < min) {
      toast.error(`Value cannot be less than ${min} ${unit}`);
      return;
    }
    if (max !== undefined && editedValue > max) {
      toast.error(`Value cannot be more than ${max} ${unit}`);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editedValue, parameterUnits[parameter as keyof typeof parameterUnits] || unit);
      setIsEditing(false);
      toast.success('Parameter updated successfully');
    } catch (error) {
      toast.error('Failed to update parameter');
      console.error('Error updating parameter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editedValue}
          onChange={(e) => setEditedValue(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-24"
        />
        <Label className="text-sm font-medium">{unit}</Label>
      </div>
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSave}
          disabled={isLoading}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 