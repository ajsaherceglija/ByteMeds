'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type PrescriptionMedication = {
  id: string;
  medication: {
    id: string;
    name: string;
    description: string | null;
    side_effects: string | null;
  };
  prescription: {
    id: string;
    created_at: string;
    valid_until: string | null;
    status: string | null;
  };
  prescription_medications: {
    dosage: string | null;
    frequency: string | null;
  }[];
};

type DatabasePrescription = {
  id: string;
  created_at: string;
  valid_until: string | null;
  status: string | null;
  prescription_medications: {
    id: string;
    dosage: string | null;
    frequency: string | null;
    medications: {
      id: string;
      name: string;
      description: string | null;
      side_effects: string | null;
    };
  }[] | null;
};

export default function MedicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeMedications, setActiveMedications] = useState<PrescriptionMedication[]>([]);
  const [historyMedications, setHistoryMedications] = useState<PrescriptionMedication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const fetchMedications = async () => {
      if (!session?.user?.id) {
        console.log('No user session found');
        return;
      }

      try {
        console.log('Fetching medications for user:', session.user.id);

        // Debug: Check medications table
        const { data: allMedications, error: medicationsError } = await supabase
          .from('medications')
          .select('*');
        
        console.log('All medications in database:', allMedications);
        if (medicationsError) console.error('Error fetching medications:', medicationsError);

        // Debug: Check prescription_medications table
        const { data: allPrescriptionMeds, error: prescriptionMedsError } = await supabase
          .from('prescription_medications')
          .select('*');
        
        console.log('All prescription_medications in database:', allPrescriptionMeds);
        if (prescriptionMedsError) console.error('Error fetching prescription_medications:', prescriptionMedsError);

        // Debug: Check ALL prescriptions
        const { data: allPrescriptions, error: allPrescriptionsError } = await supabase
          .from('prescriptions')
          .select('*');
        
        console.log('All prescriptions in database (with details):', 
          allPrescriptions?.map(p => ({
            id: p.id,
            patient_id: p.patient_id,
            status: p.status,
            created_at: p.created_at
          }))
        );
        if (allPrescriptionsError) console.error('Error fetching all prescriptions:', allPrescriptionsError);

        // Debug: Check prescriptions for this user
        const { data: userPrescriptions, error: userPrescriptionsError } = await supabase
          .from('prescriptions')
          .select('*')
          .eq('patient_id', session.user.id);
        
        console.log('All prescriptions for this user:', userPrescriptions);
        if (userPrescriptionsError) console.error('Error fetching user prescriptions:', userPrescriptionsError);

        // First, get active prescriptions
        const { data: activeData, error: activeError } = await supabase
          .from('medications')
          .select(`
            id,
            name,
            description,
            side_effects,
            prescription_medications!inner (
              id,
              dosage,
              frequency,
              prescription:prescriptions!inner (
                id,
                created_at,
                valid_until,
                status,
                patient_id
              )
            )
          `)
          .eq('prescription_medications.prescription.patient_id', session.user.id)
          .eq('prescription_medications.prescription.status', 'active')
          .returns<any[]>();

        if (activeError) {
          console.error('Active prescriptions error:', activeError);
          throw activeError;
        }

        // Transform the data structure
        const transformedActiveData = (activeData || []).map(medication => ({
          id: medication.prescription_medications[0]?.id,
          medication: {
            id: medication.id,
            name: medication.name,
            description: medication.description,
            side_effects: medication.side_effects,
          },
          prescription: medication.prescription_medications[0]?.prescription,
          prescription_medications: [{
            dosage: medication.prescription_medications[0]?.dosage,
            frequency: medication.prescription_medications[0]?.frequency
          }]
        }));

        console.log('Active medications:', transformedActiveData);

        // Get medications from non-active prescriptions
        const { data: historyData, error: historyError } = await supabase
          .from('prescriptions')
          .select(`
            id,
            created_at,
            valid_until,
            status,
            prescription_medications (
              id,
              dosage,
              frequency,
              medications (
                id,
                name,
                description,
                side_effects
              )
            )
          `)
          .eq('patient_id', session.user.id)
          .neq('status', 'active')
          .returns<DatabasePrescription[]>();

        if (historyError) {
          console.error('History prescriptions error:', historyError);
          throw historyError;
        }

        // Transform the history data to match the expected format
        const transformedHistoryData: PrescriptionMedication[] = (historyData || []).flatMap(prescription => 
          (prescription.prescription_medications || [])
            .filter(pm => pm.medications) // Ensure medication exists
            .map(pm => ({
              id: pm.id,
              medication: {
                id: pm.medications.id,
                name: pm.medications.name,
                description: pm.medications.description,
                side_effects: pm.medications.side_effects,
              },
              prescription: {
                id: prescription.id,
                created_at: prescription.created_at,
                valid_until: prescription.valid_until,
                status: prescription.status
              },
              prescription_medications: [{
                dosage: pm.dosage,
                frequency: pm.frequency
              }]
            }))
        );

        console.log('History medications:', transformedHistoryData);

        setActiveMedications(transformedActiveData);
        setHistoryMedications(transformedHistoryData);
      } catch (error) {
        console.error('Error fetching medications:', error);
        toast.error('Failed to load medications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedications();
  }, [session, supabase]);

  // Show loading state while session is loading
  if (status === 'loading' || isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // If no session and not loading, redirect to login
  if (!session?.user?.id) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-muted-foreground">
            Manage your medications and prescriptions
          </p>
        </div>
      </div>

      {/* Active Medications */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Medications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {activeMedications.map((medication) => (
            <Card key={medication.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{medication.medication.name}</CardTitle>
                    <CardDescription>
                      {medication.prescription_medications[0]?.dosage} - {medication.prescription_medications[0]?.frequency}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                      Active
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>
                        {format(new Date(medication.prescription.created_at), 'PPP')} -{' '}
                        {medication.prescription.valid_until 
                          ? format(new Date(medication.prescription.valid_until), 'PPP')
                          : 'Ongoing'}
                      </span>
                    </div>
                    {medication.prescription.valid_until && (
                      <div className="flex items-center text-sm">
                        <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>
                          {Math.ceil((new Date(medication.prescription.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                        </span>
                      </div>
                    )}
                  </div>
                  {(medication.medication.description || medication.medication.side_effects) && (
                    <div className="rounded-lg bg-muted p-3 text-sm">
                      {medication.medication.description && (
                        <>
                          <p className="font-medium">Description:</p>
                          <p className="text-muted-foreground">{medication.medication.description}</p>
                        </>
                      )}
                      {medication.medication.side_effects && (
                        <>
                          <p className="font-medium mt-2">Side Effects:</p>
                          <p className="text-muted-foreground">{medication.medication.side_effects}</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {activeMedications.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">No active medications</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Medication History */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Medication History</h2>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyMedications.map((medication) => (
                  <TableRow key={medication.id}>
                    <TableCell className="font-medium">{medication.medication.name}</TableCell>
                    <TableCell>{medication.prescription_medications[0]?.dosage}</TableCell>
                    <TableCell>{medication.prescription_medications[0]?.frequency}</TableCell>
                    <TableCell>
                      {format(new Date(medication.prescription.created_at), 'MMM d')} -{' '}
                      {medication.prescription.valid_until
                        ? format(new Date(medication.prescription.valid_until), 'MMM d, yyyy')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                        {medication.prescription.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {historyMedications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No medication history
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 