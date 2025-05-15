'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AppointmentDetails {
  id: number;
  patient_id: string;
  appointment_date: string;
  duration: number;
  type: string;
  status: string;
  notes: string;
  patient: {
    name: string;
    email: string;
    phone: string;
    date_of_birth: string;
  };
}

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:patients (
              name,
              email,
              phone,
              date_of_birth
            )
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;

      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
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
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Fetching appointment details
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
              <span>{format(new Date(appointment.appointment_date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(appointment.appointment_date), 'p')} ({appointment.duration} mins)
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
                  appointment.status === 'scheduled'
                    ? 'bg-blue-100 text-blue-700'
                    : appointment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {appointment.status}
              </span>
            </div>
            {appointment.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{appointment.patient.name}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patient.date_of_birth
                  ? `${calculateAge(new Date(appointment.patient.date_of_birth))} years`
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patient.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {appointment.patient.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        {appointment.status === 'scheduled' && (
          <>
            <Button
              onClick={() => handleStatusUpdate('completed')}
              disabled={isUpdating}
            >
              Mark as Completed
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isUpdating}
            >
              Cancel Appointment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
} 