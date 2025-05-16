'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

type AppointmentWithPatient = {
  id: string;
  appointment_date: string;
  type: string;
  patients: {
    users: {
      name: string;
    };
  };
};

export type DashboardStats = {
  totalPatients: number;
  appointmentsToday: number;
  pendingPrescriptions: number;
  recentRecords: number;
  recentActivity: Array<{
    type: 'appointment' | 'prescription' | 'record';
    date: string;
    description: string;
    patientName: string;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get total patients
  const { count: totalPatients, error: patientsError } = await supabase
    .from('doctor_patient_relationships')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .eq('relationship_type', 'assigned');

  if (patientsError) throw patientsError;

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count: appointmentsToday, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .gte('appointment_date', today.toISOString())
    .lt('appointment_date', tomorrow.toISOString());

  if (appointmentsError) throw appointmentsError;

  // Get pending prescriptions
  const { count: pendingPrescriptions, error: prescriptionsError } = await supabase
    .from('prescriptions')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .eq('status', 'pending');

  if (prescriptionsError) throw prescriptionsError;

  // Get recent medical records
  const { count: recentRecords, error: recordsError } = await supabase
    .from('medical_records')
    .select('*', { count: 'exact', head: true })
    .eq('doctor_id', user.id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

  if (recordsError) throw recordsError;

  // Get recent activity
  const { data: recentActivity, error: activityError } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      type,
      patients!inner (
        users!inner (
          name
        )
      )
    `)
    .eq('doctor_id', user.id)
    .order('appointment_date', { ascending: false })
    .limit(5);

  if (activityError) throw activityError;

  // Transform recent activity data
  const transformedActivity = (recentActivity as unknown as AppointmentWithPatient[] | null)?.map(appointment => ({
    type: 'appointment' as const,
    date: new Date(appointment.appointment_date).toLocaleDateString(),
    description: appointment.type,
    patientName: appointment.patients.users.name || 'Unknown Patient',
  })) || [];

  return {
    totalPatients: totalPatients || 0,
    appointmentsToday: appointmentsToday || 0,
    pendingPrescriptions: pendingPrescriptions || 0,
    recentRecords: recentRecords || 0,
    recentActivity: transformedActivity,
  };
} 