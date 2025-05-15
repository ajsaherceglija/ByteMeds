'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export type PatientWithDetails = {
  id: string;
  name: string;
  age: number;
  lastVisit: string;
  condition: string;
  status: string;
  sharedBy?: string;
};

type PatientRelationship = {
  patient_id: string;
  relationship_type: string;
  started_at: string | null;
  notes: string | null;
  patients: {
    id: string;
    status: string | null;
    users: {
      id: string;
      name: string;
      DOB: string | null;
    };
  };
  doctors?: {
    users: {
      name: string;
    };
  };
};

export async function getMyPatients(): Promise<PatientWithDetails[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: patients, error } = await supabase
    .from('doctor_patient_relationships')
    .select(`
      patient_id,
      relationship_type,
      started_at,
      notes,
      patients (
        id,
        status,
        users (
          id,
          name,
          DOB
        )
      )
    `)
    .eq('doctor_id', user.id)
    .eq('relationship_type', 'assigned');

  if (error) throw error;
  if (!patients) return [];

  // Transform the data to match our frontend interface
  return (patients as unknown as PatientRelationship[]).map(rel => ({
    id: rel.patients.id,
    name: rel.patients.users.name,
    age: calculateAge(rel.patients.users.DOB),
    lastVisit: rel.started_at || new Date().toISOString(),
    condition: 'Active',
    status: rel.patients.status || 'Active',
  }));
}

export async function getSharedPatients(): Promise<PatientWithDetails[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: patients, error } = await supabase
    .from('doctor_patient_relationships')
    .select(`
      patient_id,
      relationship_type,
      started_at,
      notes,
      patients (
        id,
        status,
        users (
          id,
          name,
          DOB
        )
      ),
      doctors:doctor_id (
        users (
          name
        )
      )
    `)
    .eq('doctor_id', user.id)
    .eq('relationship_type', 'shared');

  if (error) throw error;
  if (!patients) return [];

  // Transform the data to match our frontend interface
  return (patients as unknown as PatientRelationship[]).map(rel => ({
    id: rel.patients.id,
    name: rel.patients.users.name,
    age: calculateAge(rel.patients.users.DOB),
    lastVisit: rel.started_at || new Date().toISOString(),
    condition: 'Active',
    status: rel.patients.status || 'Active',
    sharedBy: rel.doctors?.users.name,
  }));
}

function calculateAge(dateOfBirth: string | null): number {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
} 