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
  specialty: string | null;
  available: boolean;
}

type DbUser = Database['public']['Tables']['users']['Row'];

export function BookAppointmentModal({ open, onClose }: BookAppointmentModalProps) {
  const { data: session, status } = useSession();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
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

  // Watch for date and time changes to fetch available doctors
  const selectedDate = form.watch('date');
  const selectedTime = form.watch('time');
  const selectedDuration = form.watch('duration');

  // Fetch available doctors when date or time changes
  useEffect(() => {
    if (!open || !selectedDate || !selectedTime || !selectedDuration) {
      return;
    }

    const fetchAvailableDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        // Calculate appointment start and end times
        const appointmentDate = new Date(selectedDate);
        const [hours, minutes] = selectedTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes));
        
        const endDate = new Date(appointmentDate);
        endDate.setMinutes(endDate.getMinutes() + parseInt(selectedDuration));

        // First get all doctors
        const { data: doctorUsers, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            doctors (
              specialty
            )
          `)
          .eq('is_doctor', true);

        if (userError) throw userError;

        if (!doctorUsers?.length) {
          setDoctors([]);
          return;
        }

        // Then check their appointments for conflicts
        const { data: existingAppointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('doctor_id, appointment_date, duration')
          .eq('is_active', true)
          .gte('appointment_date', appointmentDate.toISOString())
          .lte('appointment_date', endDate.toISOString());

        if (appointmentsError) throw appointmentsError;

        // Filter out doctors with conflicting appointments
        const availableDoctors = doctorUsers.map(doctor => {
          const doctorAppointments = existingAppointments?.filter(
            apt => apt.doctor_id === doctor.id
          ) || [];

          const hasConflict = doctorAppointments.some(apt => {
            const aptStart = new Date(apt.appointment_date);
            const aptEnd = new Date(aptStart);
            aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

            return (
              (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
              (endDate > aptStart && endDate <= aptEnd)
            );
          });

          return {
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.doctors?.[0]?.specialty || null,
            available: !hasConflict
          };
        });

        console.log('Available doctors:', availableDoctors);
        setDoctors(availableDoctors.filter(d => d.available));
      } catch (error: any) {
        console.error('Error fetching doctors:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available doctors. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchAvailableDoctors();
  }, [open, selectedDate, selectedTime, selectedDuration, supabase, toast]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      console.log('Form data received:', data);

      // Basic validation
      if (!data.doctorId || !data.date || !data.time || !data.type || !data.duration) {
        throw new Error('Please fill in all required fields');
      }

      // Format the date
      const appointmentDate = new Date(data.date);
      const [hours, minutes] = data.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Log the formatted date
      console.log('Formatted appointment date:', appointmentDate.toISOString());

      // Create appointment data
      const appointmentData = {
        patient_id: session?.user?.id,
        doctor_id: data.doctorId,
        appointment_date: appointmentDate.toISOString(),
        duration: parseInt(data.duration),
        type: data.type,
        notes: data.notes || null,
        is_active: true
      };

      console.log('Attempting to insert appointment with data:', appointmentData);

      // First check if there's a conflicting appointment
      const { data: existingAppointments, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('doctor_id', data.doctorId)
        .eq('appointment_date', appointmentDate.toISOString())
        .eq('is_active', true);

      if (checkError) {
        console.error('Error checking existing appointments:', checkError);
        throw new Error('Failed to check appointment availability');
      }

      if (existingAppointments && existingAppointments.length > 0) {
        throw new Error('This time slot is already booked');
      }

      // Insert the appointment
      const { data: result, error: insertError } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select('*')
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw new Error(insertError.message);
      }

      if (!result) {
        throw new Error('Failed to create appointment - no data returned');
      }

      console.log('Successfully created appointment:', result);

      toast({
        title: 'Success',
        description: 'Your appointment has been booked successfully!',
      });
      
      onClose();
      form.reset();
    } catch (error: any) {
      console.error('Full error details:', {
        message: error.message,
        error: error
      });

      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment. Please try again.',
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
            Select your preferred date and time to see available doctors.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
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
            </div>

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
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Doctor</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoadingDoctors || !selectedDate || !selectedTime}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            !selectedDate || !selectedTime 
                              ? "First select date and time" 
                              : isLoadingDoctors 
                                ? "Loading available doctors..." 
                                : "Select a doctor"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDoctors ? (
                          <SelectItem value="loading" disabled>
                            Loading available doctors...
                          </SelectItem>
                        ) : doctors.length === 0 ? (
                          <SelectItem value="no-doctors" disabled>
                            No doctors available at this time
                          </SelectItem>
                        ) : (
                          doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              Dr. {doctor.name}
                              {doctor.specialty && ` - ${doctor.specialty}`}
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
              <Button 
                type="submit" 
                disabled={isLoading || isLoadingDoctors || doctors.length === 0}
              >
                {isLoading ? 'Booking...' : 'Request Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 