'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddParameterDialogProps {
  onAdd: (parameter: {
    parameter: string;
    value: number;
    unit: string;
    notes?: string | null;
  }) => Promise<void>;
}

const parameterTypes = [
  { id: 'weight', label: 'Weight', unit: 'kg', min: 0, max: 500, step: 0.1 },
  { id: 'bloodPressureSystolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', min: 0, max: 300, step: 1 },
  { id: 'bloodPressureDiastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', min: 0, max: 200, step: 1 },
  { id: 'bloodSugar', label: 'Blood Sugar', unit: 'mg/dL', min: 0, max: 500, step: 1 },
  { id: 'heartRate', label: 'Heart Rate', unit: 'BPM', min: 0, max: 300, step: 1 },
];

export function AddParameterDialog({ onAdd }: AddParameterDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedParameter = parameterTypes.find((p) => p.id === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType || !value) {
      toast.error('Please fill in all required fields');
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      toast.error('Please enter a valid number');
      return;
    }

    if (selectedParameter) {
      if (numericValue < selectedParameter.min) {
        toast.error(`Value cannot be less than ${selectedParameter.min} ${selectedParameter.unit}`);
        return;
      }
      if (numericValue > selectedParameter.max) {
        toast.error(`Value cannot be more than ${selectedParameter.max} ${selectedParameter.unit}`);
        return;
      }
    }

    setIsLoading(true);
    try {
      await onAdd({
        parameter: selectedType,
        value: numericValue,
        unit: selectedParameter?.unit || '',
        notes: notes || null,
      });
      setOpen(false);
      setValue('');
      setSelectedType('');
      setNotes('');
      toast.success('Parameter added successfully');
    } catch (error) {
      toast.error('Failed to add parameter');
      console.error('Error adding parameter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Log New Parameters
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Parameter</DialogTitle>
          <DialogDescription>
            Log a new health parameter measurement
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Parameter Type</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parameter type" />
              </SelectTrigger>
              <SelectContent>
                {parameterTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <div className="flex items-center gap-2">
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value"
                step={selectedParameter?.step}
                min={selectedParameter?.min}
                max={selectedParameter?.max}
              />
              {selectedParameter && (
                <span className="text-sm text-muted-foreground w-16">
                  {selectedParameter.unit}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="h-20"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            Add Parameter
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 