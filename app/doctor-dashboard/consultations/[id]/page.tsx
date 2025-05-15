'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Stethoscope, User, ArrowLeft, Calendar, Clock } from 'lucide-react';
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
const mockConsultations = [
  {
    id: 1,
    patientName: 'John Doe',
    type: 'Initial Consultation',
    date: '2024-03-20T10:00:00Z',
    duration: 30,
    symptoms: 'Fever, headache',
    status: 'scheduled',
    patientDetails: {
      age: 35,
      contact: '+1 234-567-8900',
      email: 'john.doe@email.com'
    },
    vitalSigns: {
      bloodPressure: '120/80',
      temperature: '38.5°C',
      heartRate: '88 bpm',
      respiratoryRate: '16/min'
    },
    notes: 'Patient presenting with flu-like symptoms',
    recommendations: 'Rest, hydration, and monitoring temperature'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    type: 'Follow-up',
    date: '2024-03-20T14:30:00Z',
    duration: 15,
    symptoms: 'Blood pressure check',
    status: 'scheduled',
    patientDetails: {
      age: 28,
      contact: '+1 234-567-8901',
      email: 'jane.smith@email.com'
    },
    vitalSigns: {
      bloodPressure: '118/75',
      temperature: '36.8°C',
      heartRate: '72 bpm',
      respiratoryRate: '14/min'
    },
    notes: 'Regular follow-up for blood pressure monitoring',
    recommendations: 'Continue current medication, maintain healthy diet'
  }
];

export default function ConsultationDetailsPage() {
  const params = useParams();
  const consultationId = Number(params.id);
  
  const consultation = mockConsultations.find(c => c.id === consultationId);

  if (!consultation) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/consultations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Consultations
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Consultation Not Found</CardTitle>
            <CardDescription>
              The requested consultation could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/consultations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Consultations
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Consultation Details</h1>
        <p className="text-muted-foreground">
          Viewing consultation information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{consultation.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(consultation.date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(consultation.date), 'p')} ({consultation.duration} mins)</span>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  consultation.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {consultation.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Symptoms</p>
              <p className="text-sm text-muted-foreground">{consultation.symptoms}</p>
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
              <span className="font-medium">{consultation.patientName}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {consultation.patientDetails.age} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {consultation.patientDetails.contact}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {consultation.patientDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vital Signs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(consultation.vitalSigns).map(([key, value]) => (
                <div key={key}>
                  <p className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">Clinical Notes</p>
              <p className="text-sm text-muted-foreground">{consultation.notes}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Recommendations</p>
              <p className="text-sm text-muted-foreground">{consultation.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          Update Consultation
        </Button>
        <Button variant="outline">
          Print Summary
        </Button>
      </div>
    </div>
  );
} 