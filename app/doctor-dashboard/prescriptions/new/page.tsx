'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ArrowLeft, Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mock data - replace with API calls
const mockPatients = [
  { id: 'P001', name: 'John Doe' },
  { id: 'P002', name: 'Jane Smith' },
  { id: 'P003', name: 'Alice Brown' },
  { id: 'P004', name: 'Robert Wilson' },
  { id: 'P005', name: 'Emily Davis' },
];

const mockMedications = [
  'Amoxicillin',
  'Ibuprofen',
  'Omeprazole',
  'Ciprofloxacin',
  'Paracetamol',
  'Metformin',
  'Amlodipine',
  'Lisinopril',
];

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionForm {
  patientId: string;
  medications: Medication[];
  notes: string;
}

export default function NewPrescriptionPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PrescriptionForm>({
    patientId: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ],
    notes: '',
  });

  const handleAddMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    }));
  };

  const handleRemoveMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would make an API call to save the prescription
    console.log('Submitting prescription:', formData);
    
    // Mock success - in real app, this would happen after successful API call
    router.push('/doctor-dashboard/prescriptions');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/prescriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prescriptions
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Prescription</h1>
        <p className="text-muted-foreground">
          Create a new prescription for a patient
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>
              Select the patient for this prescription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Patient</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {formData.patientId
                        ? mockPatients.find((patient) => patient.id === formData.patientId)?.name
                        : "Select patient..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search patients..." />
                      <CommandEmpty>No patient found.</CommandEmpty>
                      <CommandGroup>
                        {mockPatients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.id}
                            onSelect={(currentValue) => {
                              setFormData(prev => ({ ...prev, patientId: currentValue }));
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.patientId === patient.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {patient.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
            <CardDescription>
              Add medications to the prescription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.medications.map((medication, index) => (
              <div key={index} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Medication {index + 1}</h4>
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMedication(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Medication Name</Label>
                    <Select
                      value={medication.name}
                      onValueChange={(value) => handleMedicationChange(index, 'name', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMedications.map((med) => (
                          <SelectItem key={med} value={med}>
                            {med}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input
                      placeholder="e.g., 3 times daily"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., 7 days"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Instructions</Label>
                    <Input
                      placeholder="e.g., Take with food"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMedication}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Medication
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Add any additional notes or instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit">Create Prescription</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/doctor-dashboard/prescriptions')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 