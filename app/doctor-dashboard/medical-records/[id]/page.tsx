'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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

// Mock data - replace with actual API calls
const mockMedicalRecords = [
  {
    id: 1,
    patientName: 'John Doe',
    recordType: 'Lab Results',
    date: '2024-03-15T10:00:00Z',
    description: 'Blood work analysis',
    status: 'completed',
    patientDetails: {
      age: 35,
      contact: '+1 234-567-8900',
      email: 'john.doe@email.com'
    }
  },
  {
    id: 2,
    patientName: 'Jane Smith',
    recordType: 'Imaging',
    date: '2024-03-14T14:30:00Z',
    description: 'Chest X-ray results',
    status: 'pending',
    patientDetails: {
      age: 28,
      contact: '+1 234-567-8901',
      email: 'jane.smith@email.com'
    }
  }
];

const recordTypes = [
  'Lab Results',
  'Imaging',
  'Prescription',
  'Consultation Notes',
  'Vaccination Record',
  'Surgery Report',
  'Other'
];

const recordStatuses = [
  'pending',
  'completed',
  'cancelled',
  'in_progress'
];

const formSchema = z.object({
  recordType: z.string({ required_error: 'Please select record type' }),
  description: z.string().min(1, 'Description is required'),
  status: z.string({ required_error: 'Please select status' }),
  notes: z.string().optional(),
});

type UpdateRecordModalProps = {
  open: boolean;
  onClose: () => void;
  record: typeof mockMedicalRecords[0];
  onUpdate: (data: z.infer<typeof formSchema>) => void;
};

function UpdateRecordModal({ open, onClose, record, onUpdate }: UpdateRecordModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recordType: record.recordType,
      description: record.description,
      status: record.status,
      notes: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      onUpdate(data);
      onClose();
    } catch (error) {
      console.error('Error updating record:', error);
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {recordStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Update Record</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function MedicalRecordDetailsPage() {
  const params = useParams();
  const recordId = Number(params.id);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [record, setRecord] = useState(mockMedicalRecords.find(r => r.id === recordId));
  
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

  const handleUpdateRecord = (data: z.infer<typeof formSchema>) => {
    // Here you would make an API call to update the record
    console.log('Updating record:', data);
    
    // Update local state (in a real app, this would happen after successful API call)
    setRecord(prev => ({
      ...prev!,
      ...data,
    }));
  };

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
              <span className="font-medium">{record.recordType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(record.date), 'PPP')}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground">{record.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  record.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {record.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{record.patientName}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Age</p>
              <p className="text-sm text-muted-foreground">
                {record.patientDetails.age} years
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Contact</p>
              <p className="text-sm text-muted-foreground">
                {record.patientDetails.contact}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">
                {record.patientDetails.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
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