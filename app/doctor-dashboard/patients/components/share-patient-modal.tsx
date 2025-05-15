'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
}

// Mock data - replace with actual API call
const mockDoctors: Doctor[] = [
  {
    id: 'D001',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    hospital: 'Central Hospital',
  },
  {
    id: 'D002',
    name: 'Dr. Michael Williams',
    specialty: 'Neurologist',
    hospital: 'City Medical Center',
  },
  {
    id: 'D003',
    name: 'Dr. Emily Brown',
    specialty: 'Pediatrician',
    hospital: 'Children\'s Hospital',
  },
  {
    id: 'D004',
    name: 'Dr. David Wilson',
    specialty: 'Oncologist',
    hospital: 'Cancer Research Center',
  },
  {
    id: 'D005',
    name: 'Dr. Jessica Martinez',
    specialty: 'Dermatologist',
    hospital: 'Skin Care Clinic',
  },
];

interface SharePatientModalProps {
  patientName: string;
  patientId: string;
}

export function SharePatientModal({ patientName, patientId }: SharePatientModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const filteredDoctors = mockDoctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleShare = async () => {
    // Here you would make an API call to share the patient with selected doctors
    console.log('Sharing patient', patientId, 'with doctors:', selectedDoctors);
    
    // Mock success - in real app, this would happen after successful API call
    setOpen(false);
    setSelectedDoctors([]);
  };

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Share</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Patient Record</DialogTitle>
          <DialogDescription>
            Share {patientName}&apos;s medical record with other doctors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors by name, specialty, or hospital..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center space-x-4 rounded-lg border p-4"
              >
                <Checkbox
                  id={doctor.id}
                  checked={selectedDoctors.includes(doctor.id)}
                  onCheckedChange={() => toggleDoctor(doctor.id)}
                />
                <div className="flex-1">
                  <label
                    htmlFor={doctor.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {doctor.name}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {doctor.specialty} • {doctor.hospital}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSelectedDoctors([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={selectedDoctors.length === 0}
            >
              Share with Selected Doctors
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 