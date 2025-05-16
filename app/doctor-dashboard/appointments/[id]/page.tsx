'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, ArrowLeft, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { useSession } from 'next-auth/react';

interface DatabaseResponse {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  duration: number;
  type: string;
  is_active: boolean | null;
  notes: string | null;
  users: {
    name: string;
    email: string;
  } | null;
}

interface AppointmentDetails {
  id: string;
  patient_id: string;
  appointment_date: string;
  duration: number;
  type: string;
  is_active: boolean;
  notes: string | null;
  patient: {
    name: string;
    email: string;
    phone: string | null;
    gender: string | null;
    date_of_birth: string | null;
  };
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '12:30', '13:00', '13:30', '14:00', '14:30', 
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

const appointmentTypes = [
  'Check-up',
  'Follow-up',
  'Consultation',
  'Test/Screening',
  'Vaccination',
];

export default function AppointmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedDate, setEditedDate] = useState<Date | null>(null);
  const [editedTime, setEditedTime] = useState<string>('');
  const [editedType, setEditedType] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const fetchAppointment = useCallback(async () => {
    // Reset error state
    setError(null);

    // Check if session is still loading
    if (status === 'loading') {
      console.log('Session is still loading...');
      return;
    }

    // Validate session and user ID
    if (!session?.user?.id) {
      console.log('No valid session found:', { session, status });
      setError('Authentication required');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      const appointmentId = params.id;
      
      if (!appointmentId) {
        setError('No appointment ID provided');
        return;
      }

      console.log('Fetching appointment:', {
        appointmentId,
        doctorId: session.user.id,
        timestamp: new Date().toISOString()
      });

      // Step 1: Basic appointment query without joins
      const { data: basicData, error: basicError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (basicError) {
        console.error('Basic query error:', {
          error: basicError,
          message: basicError.message,
          details: basicError.details,
          hint: basicError.hint,
          code: basicError.code,
          timestamp: new Date().toISOString()
        });
        setError(`Failed to fetch appointment: ${basicError.message}`);
        return;
      }

      if (!basicData) {
        console.log('No appointment found with ID:', appointmentId);
        setError('Appointment not found');
        return;
      }

      console.log('Basic appointment data:', {
        ...basicData,
        timestamp: new Date().toISOString()
      });

      // Verify this is the correct doctor's appointment
      if (basicData.doctor_id !== session.user.id) {
        console.error('Unauthorized access attempt:', {
          appointmentDoctorId: basicData.doctor_id,
          requestingDoctorId: session.user.id,
          timestamp: new Date().toISOString()
        });
        setError('Unauthorized access');
        router.push('/doctor-dashboard/appointments');
        return;
      }

      // Step 2: Get patient details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, phone, gender, DOB')
        .eq('id', basicData.patient_id)
        .single();

      if (userError) {
        console.error('User query error:', {
          error: userError,
          message: userError.message,
          details: userError.details,
          hint: userError.hint,
          code: userError.code,
          patientId: basicData.patient_id,
          timestamp: new Date().toISOString()
        });
        setError(`Failed to fetch patient details: ${userError.message}`);
        return;
      }

      if (!userData) {
        console.error('No user data found for patient:', {
          patientId: basicData.patient_id,
          timestamp: new Date().toISOString()
        });
        setError('Patient details not found');
        return;
      }

      console.log('User data:', {
        ...userData,
        timestamp: new Date().toISOString()
      });

      // Transform the data
      const appointmentData: AppointmentDetails = {
        id: basicData.id,
        patient_id: basicData.patient_id,
        appointment_date: basicData.appointment_date,
        duration: basicData.duration,
        type: basicData.type,
        is_active: basicData.is_active ?? true,
        notes: basicData.notes,
        patient: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          gender: userData.gender,
          date_of_birth: userData.DOB
        }
      };

      console.log('Final appointment data:', {
        ...appointmentData,
        timestamp: new Date().toISOString()
      });
      
      setAppointment(appointmentData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Unexpected error in fetchAppointment:', {
        error,
        errorType: error instanceof Error ? 'Error' : typeof error,
        errorMessage,
        errorStack: error instanceof Error ? error.stack : undefined,
        params: {
          appointmentId: params.id,
          doctorId: session?.user?.id
        },
        timestamp: new Date().toISOString()
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, session, status, router, supabase]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  const handleUpdateAppointment = async () => {
    if (!appointment || !editedDate || !editedTime) return;

    try {
      setIsUpdating(true);

      // Combine date and time
      const updatedDate = new Date(editedDate);
      const [hours, minutes] = editedTime.split(':');
      updatedDate.setHours(parseInt(hours), parseInt(minutes));

      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          appointment_date: updatedDate.toISOString(),
          type: editedType || appointment.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (updateError) throw updateError;

      toast.success('Appointment updated successfully');
      setIsEditModalOpen(false);
      
      // Refresh appointment data
      fetchAppointment();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Fetching appointment details
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/doctor-dashboard/appointments">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Appointment Not Found</CardTitle>
            <CardDescription>
              The requested appointment could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/doctor-dashboard/appointments">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Appointments
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointment Details</h1>
        <p className="text-muted-foreground">
          Viewing appointment information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(appointment.appointment_date), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(appointment.appointment_date), 'p')} ({appointment.duration} mins)
              </span>
            </div>
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground">{appointment.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  new Date(appointment.appointment_date) > new Date()
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {new Date(appointment.appointment_date) > new Date() ? 'Upcoming' : 'Completed'}
              </span>
            </div>
            {appointment.notes && (
              <div>
                <p className="text-sm font-medium">Notes</p>
                <p className="text-sm text-muted-foreground">{appointment.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setEditedDate(new Date(appointment.appointment_date));
                setEditedTime(format(new Date(appointment.appointment_date), 'HH:mm'));
                setEditedType(appointment.type);
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modify Appointment
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{appointment.patient.name}</span>
            </div>
            <div>
              <p className="text-sm font-medium">Gender</p>
              <p className="text-sm text-muted-foreground">{appointment.patient.gender}</p>
              <p className="text-sm font-medium">Date of Birth</p>
              <p className="text-sm text-muted-foreground">{appointment.patient.date_of_birth}</p>
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{appointment.patient.email}</p>
              <p className="text-sm font-medium">Phone</p>
              <p className="text-sm text-muted-foreground">{appointment.patient.phone}</p>
              
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={editedDate ? format(editedDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setEditedDate(new Date(e.target.value))}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time</label>
              <Select value={editedTime} onValueChange={setEditedTime}>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={editedType} onValueChange={setEditedType}>
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
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAppointment} 
              disabled={isUpdating || !editedDate || !editedTime}
            >
              {isUpdating ? 'Updating...' : 'Update Appointment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 