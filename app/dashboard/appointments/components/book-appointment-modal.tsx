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
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const durations = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '1 hour' },
];

const formSchema = z.object({
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

export function BookAppointmentModal({ open, onClose }: BookAppointmentModalProps) {
  const { data: session, status } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const supabase = createClientComponentClient<Database>();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: '',
      time: '',
      type: '',
      duration: '',
      notes: '',
    },
  });

  useEffect(() => {
    console.log('Modal open state:', open);
    console.log('Session status:', status);
    
    if (!open) {
      return;
    }

    const fetchDoctors = async () => {
      console.log('Starting to fetch doctors...');
      setIsLoadingDoctors(true);
      try {
        // First get users who are doctors
        const { data: doctorUsers, error: userError } = await supabase
          .from('users')
          .select('id, name, is_doctor')
          .eq('is_doctor', true);

        console.log('Doctor users response:', { doctorUsers, userError });

        if (userError) throw userError;

        if (!doctorUsers?.length) {
          console.log('No doctors found');
          setDoctors([]);
          return;
        }

        // Get additional doctor details
        const doctorIds = doctorUsers.map(user => user.id);
        const { data: doctorDetails, error: detailsError } = await supabase
          .from('doctors')
          .select('id, specialty, available_for_appointments')
          .in('id', doctorIds)
          .eq('available_for_appointments', true);

        console.log('Doctor details response:', { doctorDetails, detailsError });

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

        console.log('Available doctors:', availableDoctors);
        setDoctors(availableDoctors);
      } catch (error: any) {
        console.error('Error fetching doctors:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: 'Error',
          description: 'Failed to load doctors. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [open, status, supabase, toast]);

  // Add effect to monitor doctors state
  useEffect(() => {
    console.log('Current doctors state:', doctors);
    console.log('Current loading state:', isLoadingDoctors);
  }, [doctors, isLoadingDoctors]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
              name="doctorId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Doctor</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoadingDoctors}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select a doctor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDoctors ? (
                          <SelectItem value="loading" disabled>
                            <span className="text-muted-foreground">Loading doctors...</span>
                          </SelectItem>
                        ) : doctors.length === 0 ? (
                          <SelectItem value="no-doctors" disabled>
                            <span className="text-muted-foreground">No doctors available</span>
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
                            date < new Date() || date < new Date('1900-01-01')
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
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
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
                        {durations.map((duration) => (
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