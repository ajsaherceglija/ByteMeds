'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { use } from 'react';
import {
  getPrescriptionDetails,
  updatePrescription,
  type PrescriptionDetails,
  type UpdatePrescriptionData,
  type Medication,
  getMedications,
} from '../../actions';

const prescriptionSchema = z.object({
  validUntil: z.string().min(1, 'Valid until date is required'),
  medications: z.array(
    z.object({
      medicationId: z.string().min(1, 'Medication is required'),
      dosage: z.string().min(1, 'Dosage is required'),
      frequency: z.string().min(1, 'Frequency is required'),
    })
  ).min(1, 'At least one medication is required'),
  notes: z.string().optional(),
});

type PrescriptionFormData = UpdatePrescriptionData;

export default function EditPrescriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { id } = use(params);
  const [availableMedications, setAvailableMedications] = useState<Medication[]>([]);

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      validUntil: '',
      medications: [{ medicationId: '', dosage: '', frequency: '' }],
      notes: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [prescriptionData, medicationsData] = await Promise.all([
          getPrescriptionDetails(id),
          getMedications(),
        ]);

        setAvailableMedications(medicationsData);

        // Find medication IDs by name
        const medicationMap = new Map(
          medicationsData.map(med => [med.name, med.id])
        );

        form.reset({
          validUntil: format(new Date(prescriptionData.validUntil), 'yyyy-MM-dd'),
          medications: prescriptionData.medications.map(med => ({
            medicationId: medicationMap.get(med.name) || '',
            dosage: med.dosage,
            frequency: med.frequency,
          })),
          notes: prescriptionData.notes,
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, form]);

  async function onSubmit(data: PrescriptionFormData) {
    try {
      await updatePrescription(id, data);
      toast.success('Prescription updated successfully');
      router.push(`/doctor-dashboard/prescriptions/${id}`);
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
    }
  }

  const addMedication = () => {
    const medications = form.getValues('medications');
    form.setValue('medications', [
      ...medications,
      { medicationId: '', dosage: '', frequency: '' },
    ]);
  };

  const removeMedication = (index: number) => {
    const medications = form.getValues('medications');
    form.setValue(
      'medications',
      medications.filter((_, i) => i !== index)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading prescription details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Prescription</h1>
          <p className="text-muted-foreground">
            Update prescription details and medications
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Medications</h3>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedication}
                  >
                    Add Medication
                  </Button>
                </div>

                {form.watch('medications').map((_, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Medication {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        Remove
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`medications.${index}.medicationId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="">Select a medication</option>
                              {availableMedications.map((medication) => (
                                <option key={medication.id} value={medication.id}>
                                  {medication.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medications.${index}.dosage`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`medications.${index}.frequency`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Add any additional notes or instructions..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/doctor-dashboard/prescriptions/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 