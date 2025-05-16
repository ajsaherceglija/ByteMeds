'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const appointmentFormSchema = z.object({
  patientName: z.string({
    required_error: 'Please enter patient name',
  }),
  date: z.date({
    required_error: 'Please select a date',
  }),
  time: z.string({
    required_error: 'Please select a time',
  }),
  duration: z.string({
    required_error: 'Please select duration',
  }),
  type: z.string({
    required_error: 'Please select appointment type',
  }),
  notes: z.string().optional(),
});

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const durations = {
  'Check-up': [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' }
  ],
  'Follow-up': [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' }
  ],
  'Consultation': [
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' }
  ],
  'Test/Screening': [
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' }
  ],
  'Vaccination': [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' }
  ]
};

const appointmentTypes = [
  'Check-up',
  'Follow-up',
  'Consultation',
  'Initial Visit',
  'Emergency'
];

interface Patient {
  id: string;
  name: string;
}

interface DoctorAppointment {
  appointment_date: string;
  duration: number;
}

interface Appointment {
  appointment_date: string;
  duration: number;
}

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<Appointment[]>([]);
  const supabase = createClientComponentClient<Database>();

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
  });

  // Add useEffect to fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name')
          .eq('is_doctor', false);

        if (error) {
          console.error('Error fetching patients:', error);
          return;
        }

        setPatients(data || []);
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, [supabase]);

  // Add function to check time slot availability
  const isTimeSlotAvailable = (time: string) => {
    if (!form.getValues('date') || !form.getValues('patientName')) return true;

    const selectedDate = new Date(form.getValues('date'));
    const [hours, minutes] = time.split(':');
    selectedDate.setHours(parseInt(hours), parseInt(minutes));

    // Check doctor's schedule
    const isDoctorAvailable = !doctorAppointments.some(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000);
      return selectedDate >= appointmentDate && selectedDate < appointmentEnd;
    });

    // Check patient's schedule
    const isPatientAvailable = !patientAppointments.some(appointment => {
      const appointmentDate = new Date(appointment.appointment_date);
      const appointmentEnd = new Date(appointmentDate.getTime() + appointment.duration * 60000);
      return selectedDate >= appointmentDate && selectedDate < appointmentEnd;
    });

    return isDoctorAvailable && isPatientAvailable;
  };

  // Add effect to fetch both doctor's and patient's appointments when date or patient changes
  useEffect(() => {
    const fetchAppointments = async () => {
      const selectedDate = form.getValues('date');
      const selectedPatient = patients.find(p => p.name === form.getValues('patientName'));

      if (!session?.user?.id || !selectedDate) {
        setDoctorAppointments([]);
        setPatientAppointments([]);
        return;
      }

      try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Fetch doctor's appointments
        const { data: doctorData, error: doctorError } = await supabase
          .from('appointments')
          .select('appointment_date, duration')
          .eq('doctor_id', session.user.id)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString())
          .eq('is_active', true);

        if (doctorError) throw doctorError;
        setDoctorAppointments(doctorData || []);

        // Fetch patient's appointments if a patient is selected
        if (selectedPatient) {
          const { data: patientData, error: patientError } = await supabase
            .from('appointments')
            .select('appointment_date, duration')
            .eq('patient_id', selectedPatient.id)
            .gte('appointment_date', startOfDay.toISOString())
            .lte('appointment_date', endOfDay.toISOString())
            .eq('is_active', true);

          if (patientError) throw patientError;
          setPatientAppointments(patientData || []);
        } else {
          setPatientAppointments([]);
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, [form.watch('date'), form.watch('patientName'), session?.user?.id, supabase, patients]);

  async function onSubmit(values: z.infer<typeof appointmentFormSchema>) {
    if (!session?.user?.id) {
      console.error('No user session found');
      return;
    }

    try {
      setIsLoading(true);

      // Find patient ID from the selected patient
      const selectedPatient = patients.find(p => p.name === values.patientName);
      if (!selectedPatient) {
        throw new Error('Selected patient not found');
      }

      // Combine date and time
      const appointmentDate = new Date(values.date);
      const [hours, minutes] = values.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      // Create the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: selectedPatient.id,
          doctor_id: session.user.id,
          appointment_date: appointmentDate.toISOString(),
          duration: parseInt(values.duration),
          type: values.type,
          notes: values.notes || null,
          is_active: true
        });

      if (appointmentError) {
        throw new Error(`Failed to create appointment: ${appointmentError.message}`);
      }

      // Navigate back to appointments page
      router.push('/doctor-dashboard/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
      // You might want to add toast notification here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/doctor-dashboard/appointments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Schedule New Appointment</h1>
        <p className="text-muted-foreground">
          Create a new appointment for a patient
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            Fill in the details for the new appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.name}>
                                {patient.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Appointment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appointmentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {form.watch('type') && durations[form.watch('type') as keyof typeof durations]?.map((duration) => (
                              <SelectItem key={duration.value} value={duration.value}>
                                {duration.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <div className="rounded-md border">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date.getDay() === 0 || date.getDay() === 6
                            }
                            initialFocus
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {timeSlots.map((time) => {
                              const isAvailable = isTimeSlotAvailable(time);
                              return (
                                <SelectItem 
                                  key={time} 
                                  value={time}
                                  disabled={!isAvailable}
                                >
                                  {time} {!isAvailable && '(Booked)'}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes about the appointment..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="mr-2">Creating...</span>
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/doctor-dashboard/appointments">
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 