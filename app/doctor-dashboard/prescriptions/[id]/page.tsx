'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Pill, User, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

// Mock data - replace with actual API calls
const mockPrescriptions = [
  {
    id: 1,
    patientName: 'John Doe',
    medications: [
      {
        name: 'Amoxicillin',
        dosage: '500mg',
        frequency: '3 times daily',
        duration: '7 days',
        instructions: 'Take with food',
      },
    ],
    date: '2024-03-15T10:00:00Z',
    status: 'active',
    patientDetails: {
      age: 35,
      contact: '+1 234-567-8900',
      email: 'john.doe@email.com'
    },
    notes: 'For bacterial infection treatment',
    nextRefillDate: '2024-03-22T10:00:00Z'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    medications: [
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        frequency: 'As needed',
        duration: '14 days',
        instructions: 'Take for pain relief',
      },
      {
        name: 'Omeprazole',
        dosage: '20mg',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Take before breakfast',
      },
    ],
    date: '2024-03-14T14:30:00Z',
    status: 'active',
    patientDetails: {
      age: 28,
      contact: '+1 234-567-8901',
      email: 'jane.smith@email.com'
    },
    notes: 'For chronic pain management',
    nextRefillDate: '2024-03-28T14:30:00Z'
  }
];

export default function PrescriptionDetailsPage() {
  const params = useParams();
  const prescriptionId = Number(params.id);
  
  const prescription = mockPrescriptions.find(p => p.id === prescriptionId);

  if (!prescription) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/prescriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prescriptions
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Prescription Not Found</CardTitle>
            <CardDescription>
              The requested prescription could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/prescriptions">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Prescriptions
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescription Details</h1>
        <p className="text-muted-foreground">
          Viewing prescription information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescription Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(prescription.date), 'PPP')}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  prescription.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {prescription.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Next Refill Date</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(prescription.nextRefillDate), 'PPP')}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{prescription.notes}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{prescription.patientName}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {prescription.patientDetails.age} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {prescription.patientDetails.contact}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {prescription.patientDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{medication.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Dosage</p>
                      <p className="text-muted-foreground">{medication.dosage}</p>
                    </div>
                    <div>
                      <p className="font-medium">Frequency</p>
                      <p className="text-muted-foreground">{medication.frequency}</p>
                    </div>
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">{medication.duration}</p>
                    </div>
                    <div>
                      <p className="font-medium">Instructions</p>
                      <p className="text-muted-foreground">{medication.instructions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          Renew Prescription
        </Button>
        <Button variant="outline">
          Print Prescription
        </Button>
      </div>
    </div>
  );
} 