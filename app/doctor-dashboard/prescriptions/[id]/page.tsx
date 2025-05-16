'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPrescriptionDetails, type PrescriptionDetails } from '../actions';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { use } from 'react';

export default function PrescriptionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState<PrescriptionDetails | null>(null);
  const { id } = use(params);

  useEffect(() => {
    async function loadPrescription() {
      try {
        const data = await getPrescriptionDetails(id);
        setPrescription(data);
      } catch (error) {
        console.error('Error loading prescription:', error);
        toast.error('Failed to load prescription details');
      } finally {
        setLoading(false);
      }
    }

    loadPrescription();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading prescription details...</p>
        </div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Prescription Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The prescription you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/doctor-dashboard/prescriptions')}
          >
            Back to Prescriptions
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'expired':
        return 'bg-red-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Details</h1>
          <p className="text-muted-foreground">
            View detailed information about this prescription
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/doctor-dashboard/prescriptions')}
          >
            Back to List
          </Button>
          <Link href={`/doctor-dashboard/prescriptions/${id}/edit`}>
            <Button>
              Edit Prescription
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Patient</dt>
                <dd className="text-lg font-medium">{prescription.patientName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Prescribed By</dt>
                <dd className="text-lg font-medium">{prescription.doctorName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="text-lg font-medium">{prescription.date}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Valid Until</dt>
                <dd className="text-lg font-medium">{prescription.validUntil}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge className={getStatusColor(prescription.status)}>
                    {prescription.status}
                  </Badge>
                </dd>
              </div>
              {prescription.appointmentDate && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Appointment Date</dt>
                  <dd className="text-lg font-medium">{prescription.appointmentDate}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <h3 className="font-medium">{medication.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Dosage:</span>{' '}
                      {medication.dosage}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>{' '}
                      {medication.frequency}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {prescription.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{prescription.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 