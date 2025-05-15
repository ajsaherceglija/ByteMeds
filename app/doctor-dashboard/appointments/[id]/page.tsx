'use client';

import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
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
const mockAppointments = [
  {
    id: 1,
    patientName: 'John Doe',
    date: '2024-03-20T10:00:00Z',
    duration: 30,
    type: 'Check-up',
    status: 'upcoming',
    patientDetails: {
      age: 35,
      contact: '+1 234-567-8900',
      email: 'john.doe@email.com'
    },
    notes: 'Regular check-up appointment'
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    date: '2024-03-20T11:00:00Z',
    duration: 45,
    type: 'Follow-up',
    status: 'upcoming',
    patientDetails: {
      age: 28,
      contact: '+1 234-567-8901',
      email: 'jane.smith@email.com'
    },
    notes: 'Follow-up for previous treatment'
  },
  // ... other appointments
];

export default function AppointmentDetailsPage() {
  const params = useParams();
  const appointmentId = Number(params.id);
  
  const appointment = mockAppointments.find(a => a.id === appointmentId);

  if (!appointment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Appointment Not Found</CardTitle>
            <CardDescription>
              The requested appointment could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/appointments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
        <p className="text-muted-foreground">
          Viewing appointment information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(appointment.date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(appointment.date), 'p')} ({appointment.duration} mins)
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground">{appointment.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  appointment.status === 'upcoming'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {appointment.status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Notes</p>
              <p className="text-sm text-muted-foreground">{appointment.notes}</p>
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
              <span className="font-medium">{appointment.patientName}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patientDetails.age} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patientDetails.contact}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patientDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button>
          Reschedule Appointment
        </Button>
        <Button variant="outline">
          Cancel Appointment
        </Button>
      </div>
    </div>
  );
} 