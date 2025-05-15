'use client';

import { useState } from 'react';
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
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

const durations = ['15', '30', '45', '60'];

const appointmentTypes = [
  'Check-up',
  'Follow-up',
  'Consultation',
  'Initial Visit',
  'Emergency'
];

// Mock patient data for testing
const mockPatients = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Alice Johnson' },
  { id: '4', name: 'Bob Wilson' },
];

export default function NewAppointmentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
  });

  async function onSubmit(values: z.infer<typeof appointmentFormSchema>) {
    try {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the form values
      console.log('Appointment created:', values);
      
      // Navigate back to appointments page
      router.push('/doctor-dashboard/appointments');
    } catch (error) {
      console.error('Error creating appointment:', error);
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
                            {mockPatients.map((patient) => (
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
                            {durations.map((duration) => (
                              <SelectItem key={duration} value={duration}>
                                {duration} minutes
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
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
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