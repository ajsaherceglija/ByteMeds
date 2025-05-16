'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export type Consultation = {
  id: string;
  patientName: string;
  type: string;
  date: string;
  duration: number;
  symptoms: string | null;
  status: string;
};

export type ConsultationDetails = {
  id: string;
  patientName: string;
  type: string;
  date: string;
  duration: number;
  symptoms: string | null;
  status: string;
  patientDetails: {
    age: number | null;
    contact: string | null;
    email: string;
  };
  vitalSigns: {
    bloodPressure: string | null;
    temperature: string | null;
    heartRate: string | null;
    respiratoryRate: string | null;
  };
  notes: string | null;
  recommendations: string | null;
};

type AppointmentWithPatient = {
  id: string;
  appointment_date: string;
  duration: number;
  type: string;
  notes: string | null;
  is_active: boolean | null;
  patients: {
    users: {
      name: string;
      email: string;
      phone: string | null;
      DOB: string | null;
    };
    blood_type: string | null;
  };
};

export type UpdateConsultationData = {
  type: string;
  duration: number;
  notes: string;
  is_active: boolean;
};

export async function getConsultations(): Promise<Consultation[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: consultations, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      duration,
      type,
      notes,
      is_active,
      patients (
        users (
          name
        )
      )
    `)
    .eq('doctor_id', user.id)
    .order('appointment_date', { ascending: true });

  if (error) throw error;
  if (!consultations) return [];

  return (consultations as unknown as AppointmentWithPatient[]).map(consultation => ({
    id: consultation.id,
    patientName: consultation.patients?.users?.name || 'Unknown Patient',
    type: consultation.type,
    date: consultation.appointment_date,
    duration: consultation.duration,
    symptoms: consultation.notes,
    status: consultation.is_active ? 'scheduled' : 'completed'
  }));
}

export async function getConsultationDetails(id: string): Promise<ConsultationDetails | null> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: consultation, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      duration,
      type,
      notes,
      is_active,
      patients (
        users (
          name,
          email,
          phone,
          DOB
        ),
        blood_type
      )
    `)
    .eq('id', id)
    .eq('doctor_id', user.id)
    .single();

  if (error) throw error;
  if (!consultation) return null;

  const typedConsultation = consultation as unknown as AppointmentWithPatient;
  
  // Calculate age from DOB
  const age = typedConsultation.patients?.users?.DOB 
    ? Math.floor((new Date().getTime() - new Date(typedConsultation.patients.users.DOB).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  return {
    id: typedConsultation.id,
    patientName: typedConsultation.patients?.users?.name || 'Unknown Patient',
    type: typedConsultation.type,
    date: typedConsultation.appointment_date,
    duration: typedConsultation.duration,
    symptoms: typedConsultation.notes,
    status: typedConsultation.is_active ? 'scheduled' : 'completed',
    patientDetails: {
      age,
      contact: typedConsultation.patients?.users?.phone || null,
      email: typedConsultation.patients?.users?.email || 'No email provided'
    },
    vitalSigns: {
      bloodPressure: null, // These would come from a separate table in a real implementation
      temperature: null,
      heartRate: null,
      respiratoryRate: null
    },
    notes: typedConsultation.notes,
    recommendations: null // This would come from a separate table in a real implementation
  };
}

export async function updateConsultation(id: string, data: UpdateConsultationData): Promise<void> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('appointments')
    .update({
      type: data.type,
      duration: data.duration,
      notes: data.notes,
      is_active: data.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('doctor_id', user.id);

  if (error) throw error;
} 