'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getDoctors, sharePatient, getSharedDoctors, Doctor } from '../actions';
import { Share2, Stethoscope, Building2 } from 'lucide-react';

interface SharePatientModalProps {
  patientId: string;
  patientName: string;
}

export function SharePatientModal({ patientId, patientName }: SharePatientModalProps) {
  const [open, setOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadDoctors();
    }
  }, [open]);

  const loadDoctors = async () => {
    try {
      const [doctorsList, sharedDoctors] = await Promise.all([
        getDoctors(),
        getSharedDoctors(patientId)
      ]);
      setDoctors(doctorsList);
      setSelectedDoctors(sharedDoctors);
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load doctors list",
      });
    }
  };

  const handleShare = async () => {
    if (selectedDoctors.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one doctor to share with",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sharePatient(patientId, selectedDoctors);
      toast({
        title: "Success",
        description: "Patient shared successfully",
      });
      setOpen(false);
      setSelectedDoctors([]);
    } catch (error) {
      console.error('Failed to share patient:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to share patient",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Patient</DialogTitle>
          <DialogDescription>
            Share {patientName} with other doctors
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedDoctors.includes(doctor.id)
                    ? 'bg-primary/5 border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={doctor.id}
                  checked={selectedDoctors.includes(doctor.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDoctors([...selectedDoctors, doctor.id]);
                    } else {
                      setSelectedDoctors(selectedDoctors.filter(id => id !== doctor.id));
                    }
                  }}
                  className="mt-1"
                />
                <Label
                  htmlFor={doctor.id}
                  className="flex-1 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{doctor.name}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      {doctor.specialty && (
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>{doctor.specialty}</span>
                        </div>
                      )}
                      {doctor.hospital && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{doctor.hospital}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
            {doctors.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No doctors available to share with
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleShare}
            disabled={isLoading || selectedDoctors.length === 0}
          >
            {isLoading ? 'Sharing...' : 'Share'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 