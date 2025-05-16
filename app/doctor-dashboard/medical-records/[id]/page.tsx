'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { FileText, User, ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';
import { Database } from '@/types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const recordTypes = [
  'Lab Results',
  'Imaging',
  'Prescription',
  'Consultation Notes',
  'Vaccination Record',
  'Surgery Report',
  'Other'
];

type MedicalRecord = {
  id: string;
  patient_id: string | null;
  doctor_id: string | null;
  record_type: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean | null;
  patient_name?: string;
  patient_details?: {
    email: string;
    phone: string;
    DOB: string | null;
  };
};

const formSchema = z.object({
  record_type: z.string({ required_error: 'Please select record type' }),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  is_active: z.boolean().optional(),
});

type UpdateRecordModalProps = {
  open: boolean;
  onClose: () => void;
  record: MedicalRecord;
  onUpdate: (data: z.infer<typeof formSchema>) => void;
};

function UpdateRecordModal({ open, onClose, record, onUpdate }: UpdateRecordModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      record_type: record.record_type || '',
      description: record.description || '',
      notes: record.notes || '',
      is_active: record.is_active ?? true,
    },
  });

  // Reset form when record changes
  useEffect(() => {
    if (record) {
      form.reset({
        record_type: record.record_type || '',
        description: record.description || '',
        notes: record.notes || '',
        is_active: record.is_active ?? true,
      });
    }
  }, [record, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await onUpdate(data);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Medical Record</DialogTitle>
          <DialogDescription>
            Update the details of this medical record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="record_type"
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

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'true')} 
                      value={field.value ? 'true' : 'false'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update Record'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function MedicalRecordDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // Initialize Supabase client on the client side only
  useEffect(() => {
    setSupabase(createClient());
  }, []);

  useEffect(() => {
    const fetchMedicalRecord = async () => {
      if (!session?.user?.id || !supabase || !params.id) return;

      try {
        const { data: recordData, error: recordError } = await supabase
          .from('medical_records')
          .select(`
            *,
            patients!medical_records_patient_id_fkey (
              users!patients_id_fkey (
                name,
                email,
                phone,
                DOB
              )
            )
          `)
          .eq('id', params.id)
          .eq('doctor_id', session.user.id)
          .single();

        if (recordError) {
          console.error('Error fetching record:', recordError);
          toast.error('Failed to load medical record');
          return;
        }

        if (!recordData) {
          toast.error('Medical record not found');
          return;
        }

        const transformedRecord: MedicalRecord = {
          ...recordData,
          patient_name: recordData.patients?.users?.name || 'Unknown Patient',
          patient_details: {
            email: recordData.patients?.users?.email || 'N/A',
            phone: recordData.patients?.users?.phone || 'N/A',
            DOB: recordData.patients?.users?.DOB || null,
          }
        };

        setRecord(transformedRecord);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load medical record');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalRecord();
  }, [session, supabase, params.id]);

  const handleUpdateRecord = async (data: z.infer<typeof formSchema>) => {
    if (!session?.user?.id || !supabase || !record) {
      toast.error('Unable to update record');
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          record_type: data.record_type,
          description: data.description,
          notes: data.notes || null,
          is_active: data.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id)
        .eq('doctor_id', session.user.id);

      if (error) throw error;

      // Update local state
      setRecord(prev => prev ? {
        ...prev,
        record_type: data.record_type,
        description: data.description,
        notes: data.notes || null,
        is_active: data.is_active || false,
        updated_at: new Date().toISOString()
      } : null);

      toast.success('Medical record updated successfully');
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update medical record');
    }
  };

  // Show loading state while session is loading
  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If no session and not loading, redirect to login
  if (!session?.user?.id) {
    router.push('/login');
    return null;
  }

  if (!record) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/medical-records">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Medical Records
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Medical Record Not Found</CardTitle>
            <CardDescription>
              The requested medical record could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/medical-records">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Medical Records
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Medical Record Details</h1>
        <p className="text-muted-foreground">
          Viewing medical record information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{record.record_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(record.created_at), 'PPP')}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{record.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  record.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {record.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {record.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{record.notes}</p>
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
              <span className="font-medium">{record.patient_name}</span>
            </div>
            {record.patient_details?.DOB && (
              <div>
                <p className="text-sm font-medium">Date of Birth</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(record.patient_details.DOB), 'PPP')}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {record.patient_details?.phone}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {record.patient_details?.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button onClick={() => setIsUpdateModalOpen(true)}>
          Update Record
        </Button>
      </div>

      <UpdateRecordModal
        open={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        record={record}
        onUpdate={handleUpdateRecord}
      />
    </div>
  );
} 