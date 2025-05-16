'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AppointmentData {
  id: string;
  appointment_date: string;
  duration: number;
  type: string;
  is_active: boolean;
  patient: {
    name: string;
  };
}

// Modified to match actual database structure
interface RawAppointmentData {
  id: string;
  appointment_date: string;
  duration: number;
  type: string;
  is_active: boolean;
  patient_id: string;
  patient_name: string | null;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!session?.user?.id) {
        console.log('No user session found');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Fetching appointments for doctor:', session.user.id);

        // Approach 1: Join using two separate queries if foreign key isn't properly set up
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*')
          .eq('doctor_id', session.user.id)
          .order('appointment_date', { ascending: true });

        if (appointmentsError) {
          console.error('Error fetching appointments:', appointmentsError);
          throw appointmentsError;
        }

        // Fetch patient names in a separate query if needed
        const transformedData: AppointmentData[] = [];
        
        for (const appointment of appointmentsData || []) {
          let patientName = 'Unknown Patient';
          
          if (appointment.patient_id) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('name')
              .eq('id', appointment.patient_id)
              .single();
              
            if (!userError && userData) {
              patientName = userData.name;
            }
          }
          
          transformedData.push({
            id: appointment.id,
            appointment_date: appointment.appointment_date,
            duration: appointment.duration,
            type: appointment.type,
            is_active: appointment.is_active,
            patient: {
              name: patientName
            }
          });
        }

        console.log('Fetched appointments:', transformedData);
        setAppointments(transformedData);
      } catch (error: any) {
        console.error('Error fetching appointments:', error);
        toast('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [session?.user?.id, supabase]);

  // Show loading state while session is loading
  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If no session and not loading, redirect to login
  if (!session?.user?.id) {
    router.push('/login');
    return null;
  }

  const filteredAppointments = appointments.filter(
    (appointment) => {
      if (!selectedDate) return false;
      
      const appointmentDate = new Date(appointment.appointment_date);
      const selectedDateStart = new Date(selectedDate);
      selectedDateStart.setHours(0, 0, 0, 0);
      
      const selectedDateEnd = new Date(selectedDate);
      selectedDateEnd.setHours(23, 59, 59, 999);
      
      return appointmentDate >= selectedDateStart && appointmentDate <= selectedDateEnd;
    }
  );

  // Debug logs
  console.log('Selected date:', selectedDate);
  console.log('All appointments:', appointments);
  console.log('Filtered appointments:', filteredAppointments);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your patient appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/doctor-dashboard/appointments/new">
            Schedule Appointment
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Appointments List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? format(selectedDate, 'MMMM d, yyyy')
                  : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {filteredAppointments.length
                  ? `${filteredAppointments.length} appointments scheduled`
                  : 'No appointments scheduled'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{appointment.patient.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(new Date(appointment.appointment_date), 'h:mm a')} ({appointment.duration} mins)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            new Date(appointment.appointment_date) > new Date()
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {new Date(appointment.appointment_date) > new Date() ? 'upcoming' : 'completed'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {appointment.type}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/doctor-dashboard/appointments/${appointment.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))}
                {filteredAppointments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    No appointments scheduled for this date.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date || new Date())}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}