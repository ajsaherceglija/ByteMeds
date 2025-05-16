'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
import { BookAppointmentModal } from './components/book-appointment-modal';
import { createClient } from '@/app/utils/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration: number;
  type: string;
  status: string;
  notes: string | null;
  doctor_name?: string;
  patient_name?: string;
}

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const isDoctor = session?.user?.is_doctor;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const supabase = createClient();

  const fetchAppointments = useCallback(async () => {
    // Skip if already loaded or no session
    if (hasLoaded || !session?.user?.id) return;

    try {
      setIsLoading(true);
      
      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq(isDoctor ? 'doctor_id' : 'patient_id', session.user.id)
        .order('appointment_date', { ascending: true });

      if (appointmentsError) {
        throw appointmentsError;
      }

      // Fetch user details for each appointment
      const appointmentsWithNames = await Promise.all((appointmentsData || []).map(async (appointment) => {
        const userId = isDoctor ? appointment.patient_id : appointment.doctor_id;
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name')
          .eq('id', userId)
          .single();

        if (userError) {
          console.warn('Error fetching user details:', userError);
          return {
            ...appointment,
            doctor_name: isDoctor ? session.user.name : 'Unknown Doctor',
            patient_name: isDoctor ? 'Unknown Patient' : session.user.name
          };
        }

        return {
          ...appointment,
          doctor_name: isDoctor ? session.user.name : userData.name,
          patient_name: isDoctor ? userData.name : session.user.name
        };
      }));

      setAppointments(appointmentsWithNames);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [session, isDoctor, supabase, hasLoaded]);

  // Reset hasLoaded when session or isDoctor changes
  useEffect(() => {
    setHasLoaded(false);
  }, [session?.user?.id, isDoctor]);

  // Fetch appointments when needed
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Function to manually refresh appointments
  const refreshAppointments = useCallback(() => {
    setHasLoaded(false); // This will trigger a new fetch
  }, []);

  const filteredAppointments = appointments.filter(
    (appointment) =>
      selectedDate &&
      format(new Date(appointment.appointment_date), 'yyyy-MM-dd') ===
        format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your {isDoctor ? 'patient appointments' : 'medical appointments'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAppointments} disabled={isLoading}>
            Refresh
          </Button>
          <Button onClick={() => setIsBookingModalOpen(true)}>
            {isDoctor ? 'Schedule Appointment' : 'Book Appointment'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, 'MMMM d, yyyy')
                : 'Select a date'}
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? 'Loading appointments...'
                : filteredAppointments.length
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
                      <p className="font-medium">
                        {isDoctor ? appointment.patient_name : appointment.doctor_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(appointment.appointment_date), 'h:mm a')} (
                        {appointment.duration} mins)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {appointment.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {appointment.type}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Implement view details functionality
                      toast({
                        title: 'Coming Soon',
                        description: 'Appointment details view is under development',
                      });
                    }}
                  >
                    View Details
                  </Button>
                </div>
              ))}
              {!isLoading && filteredAppointments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  No appointments scheduled for this date.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>

      <BookAppointmentModal
        open={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          refreshAppointments(); // Refresh appointments after booking
        }}
      />
    </div>
  );
} 