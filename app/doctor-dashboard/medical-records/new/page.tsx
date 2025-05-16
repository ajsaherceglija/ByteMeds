'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

const recordTypes = [
  'Lab Results',
  'Imaging',
  'Prescription',
  'Consultation Notes',
  'Vaccination Record',
  'Surgery Report',
  'Other'
];

const formSchema = z.object({
  patientId: z.string({ required_error: 'Please select a patient' }),
  recordType: z.string({ required_error: 'Please select record type' }),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
});

type Relationship = {
  patient_id: string;
};

type UserData = {
  id: string;
  name: string;
};

type Patient = {
  id: string;
  name: string;
};

export default function NewMedicalRecordPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Initialize Supabase client on the client side only
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!session?.user?.id || !supabase) {
        return;
      }

      try {
        console.log('Fetching patients for doctor:', session.user.id);
        
        const { data: relationships, error: relationshipsError } = await supabase
          .from('doctor_patient_relationships')
          .select('patient_id')
          .eq('doctor_id', session.user.id);

        if (relationshipsError) {
          console.error('Error fetching relationships:', relationshipsError);
          throw relationshipsError;
        }

        if (!relationships || relationships.length === 0) {
          console.log('No patient relationships found');
          setPatients([]);
          return;
        }

        const patientIds = relationships.map((rel: Relationship) => rel.patient_id);
        console.log('Found patient IDs:', patientIds);

        const { data: patientData, error: patientsError } = await supabase
          .from('users')
          .select('id, name')
          .in('id', patientIds)
          .eq('is_doctor', false);

        if (patientsError) {
          console.error('Error fetching patient details:', patientsError);
          throw patientsError;
        }

        console.log('Fetched patient data:', patientData);

        const formattedPatients = (patientData || []).map((user: UserData) => ({
          id: user.id,
          name: user.name
        }));

        setPatients(formattedPatients);
      } catch (error) {
        console.error('Error details:', error);
        toast.error('Failed to load patients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [session, supabase]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: '',
      recordType: '',
      description: '',
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast.error('You must be logged in to create a record');
      return;
    }

    if (!supabase) {
      toast.error('Unable to connect to the database');
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: data.patientId,
          doctor_id: session.user.id,
          record_type: data.recordType,
          description: data.description,
          notes: data.notes || null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast.success('Medical record created successfully');
      router.push('/doctor-dashboard/medical-records');
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error('Failed to create medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while session is loading
  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If no session and not loading, don't render anything
  if (!session?.user?.id) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/medical-records" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Medical Records
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Medical Record</h1>
        <p className="text-muted-foreground">
          Create a new medical record for a patient
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
          <CardDescription>
            Fill in the details for the new medical record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
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
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select record type" />
                        </SelectTrigger>
                        <SelectContent>
                          {recordTypes.map((type) => (
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter record description..."
                        {...field}
                      />
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
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/doctor-dashboard/medical-records')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Record'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 