'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Database } from '@/types/supabase';

const appointmentTypes = [
  'Check-up',
  'Follow-up',
  'Consultation',
  'Test/Screening',
  'Vaccination',
];

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

interface DoctorWithSpecialty extends Doctor {
  specialty: string | null;
}

const formSchema = z.object({
  specialty: z.string({ required_error: 'Please select a specialty' }),
  doctorId: z.string({ required_error: 'Please select a doctor' }),
  date: z.date({ required_error: 'Please select a date' }),
  time: z.string({ required_error: 'Please select a time' }),
  type: z.string({ required_error: 'Please select appointment type' }),
  duration: z.string({ required_error: 'Please select duration' }),
  notes: z.string().optional(),
});

type BookAppointmentModalProps = {
  open: boolean;
  onClose: () => void;
};

interface Doctor {
  id: string;
  name: string;
}

type DbUser = Database['public']['Tables']['users']['Row'];

interface DoctorAppointment {
  appointment_date: string;
  duration: number;
}

export function BookAppointmentModal({ open, onClose }: BookAppointmentModalProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorWithSpecialty[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [doctorAppointments, setDoctorAppointments] = useState<DoctorAppointment[]>([]);
  const [patientAppointments, setPatientAppointments] = useState<DoctorAppointment[]>([]);
  const [appointmentsEnabled, setAppointmentsEnabled] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  // Check if appointments are enabled
  useEffect(() => {
    const checkAppointmentsStatus = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        if (data?.appointments?.enabled === false) {
          setAppointmentsEnabled(false);
          toast({
            title: "Appointment Booking Temporarily Disabled",
            description: "The appointment booking system is currently disabled by the administrator. This is typically done during schedule updates or system maintenance. Please try again later or contact support if you have an urgent medical need.",
            variant: "destructive",
            duration: 6000, // Show for 6 seconds due to longer message
          });
          onClose();
        }
      } catch (error) {
        console.error('Error checking appointments status:', error);
      }
    };

    if (open) {
      checkAppointmentsStatus();
    }
  }, [open, onClose, toast]);

  useEffect(() => {
    console.log('Modal open state:', open);
    console.log('Session status:', status);
    
    if (!open) {
      return;
    }

    const fetchSpecialties = async () => {
      if (!open) return;

      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('specialty')
          .not('specialty', 'is', null);

        if (error) throw error;

        // Get unique specialties
        const uniqueSpecialties = Array.from(new Set(data.map(d => d.specialty).filter(Boolean)));
        setSpecialties(uniqueSpecialties as string[]);
      } catch (error) {
        console.error('Error fetching specialties:', error);
        toast({
          title: 'Error',
          description: 'Failed to load specialties.',
          variant: 'destructive',
        });
      }
    };

    fetchSpecialties();
  }, [open, supabase, toast]);

  useEffect(() => {
    const fetchDoctors = async () => {
      const selectedSpecialty = form.getValues('specialty');
      if (!open || !selectedSpecialty) {
        setDoctors([]);
        return;
      }

      console.log('Fetching doctors for specialty:', selectedSpecialty);
      setIsLoading(true);
      
      try {
        // First get users who are doctors
        const { data: doctorUsers, error: userError } = await supabase
          .from('users')
          .select('id, name, is_doctor')
          .eq('is_doctor', true);

        if (userError) throw userError;

        if (!doctorUsers?.length) {
          setDoctors([]);
          return;
        }

        // Get additional doctor details with specialty filter
        const doctorIds = doctorUsers.map(user => user.id);
        const { data: doctorDetails, error: detailsError } = await supabase
          .from('doctors')
          .select('id, specialty, available_for_appointments')
          .in('id', doctorIds)
          .eq('specialty', selectedSpecialty)
          .eq('available_for_appointments', true);

        if (detailsError) throw detailsError;

        // Combine the data
        const availableDoctors = doctorUsers
          .filter(user => doctorDetails?.some(detail => detail.id === user.id))
          .map(user => {
            const details = doctorDetails?.find(detail => detail.id === user.id);
            return {
              id: user.id,
              name: user.name,
              specialty: details?.specialty || null
            };
          });

        setDoctors(availableDoctors);
      } catch (error: any) {
        console.error('Error fetching doctors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load doctors.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, [open, form.watch('specialty'), supabase, toast]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'specialty') {
        form.setValue('doctorId', '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update the time slot availability check
  const isTimeSlotAvailable = (time: string) => {
    if (!form.getValues('date') || !form.getValues('doctorId')) return true;

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

  // Update the effect to fetch both doctor's and patient's appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      const selectedDoctor = form.getValues('doctorId');
      const selectedDate = form.getValues('date');

      if (!selectedDoctor || !selectedDate || !session?.user?.id) {
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
          .eq('doctor_id', selectedDoctor)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString())
          .eq('is_active', true);

        if (doctorError) throw doctorError;
        setDoctorAppointments(doctorData || []);

        // Fetch patient's appointments
        const { data: patientData, error: patientError } = await supabase
          .from('appointments')
          .select('appointment_date, duration')
          .eq('patient_id', session.user.id)
          .gte('appointment_date', startOfDay.toISOString())
          .lte('appointment_date', endOfDay.toISOString())
          .eq('is_active', true);

        if (patientError) throw patientError;
        setPatientAppointments(patientData || []);

      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Error',
          description: 'Failed to check availability.',
          variant: 'destructive',
        });
      }
    };

    fetchAppointments();
  }, [form.watch('doctorId'), form.watch('date'), session?.user?.id, supabase, toast]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!appointmentsEnabled) {
      toast({
        title: "Appointment Booking Temporarily Disabled",
        description: "The appointment booking system is currently disabled by the administrator. This is typically done during schedule updates or system maintenance. Please try again later or contact support if you have an urgent medical need.",
        variant: "destructive",
        duration: 6000,
      });
      return;
    }

    console.log('Submitting appointment data:', data);
    
    if (status !== 'authenticated' || !session?.user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to book an appointment.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Combine date and time
      const appointmentDate = new Date(data.date);
      const [hours, minutes] = data.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const appointmentData = {
        patient_id: session.user.id,
        doctor_id: data.doctorId,
        appointment_date: appointmentDate.toISOString(),
        duration: parseInt(data.duration),
        type: data.type,
        notes: data.notes || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating appointment with:', appointmentData);

      const { data: newAppointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Appointment created:', newAppointment);

      toast({
        title: 'Success',
        description: 'Appointment booked successfully!',
      });
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error('Error booking appointment:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details below to book your appointment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Specialty</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Doctor</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading || !form.getValues('specialty')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={
                          !form.getValues('specialty') 
                            ? "First select a specialty" 
                            : isLoading 
                              ? "Loading doctors..." 
                              : "Select a doctor"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading doctors...
                          </SelectItem>
                        ) : doctors.length === 0 ? (
                          <SelectItem value="no-doctors" disabled>
                            No doctors available for this specialty
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Date</FormLabel>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || 
                            date < new Date('1900-01-01') ||
                            date.getDay() === 0 || // Sunday
                            date.getDay() === 6    // Saturday
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Time</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
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
                  </FormControl>
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
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {form.watch('type') && durations[form.watch('type') as keyof typeof durations]?.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes or concerns..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 