'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

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

export async function createPatient(formData: {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  bloodType: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
}) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First check if user with this email exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', formData.email)
    .single();

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const now = new Date().toISOString();
  const newUserId = uuidv4();

  // Check if doctor record exists
  const { data: existingDoctor } = await supabase
    .from('doctors')
    .select('id')
    .eq('id', user.id)
    .single();

  // Create doctor record if it doesn't exist
  if (!existingDoctor) {
    const { error: doctorError } = await supabase
      .from('doctors')
      .insert({
        id: user.id,
        updated_at: now
      });

    if (doctorError) throw doctorError;
  }

  // Create new user
  const { data: newUser, error: userError } = await supabase
    .from('users')
    .insert({
      id: newUserId,
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
      DOB: new Date(new Date().getFullYear() - parseInt(formData.age), 0, 1).toISOString(),
      gender: formData.gender,
      address: formData.address,
      is_doctor: false,
      created_at: now
    })
    .select()
    .single();

  if (userError) throw userError;

  // Create patient record
  const { data: newPatient, error: patientError } = await supabase
    .from('patients')
    .insert({
      id: newUserId,
      blood_type: formData.bloodType,
      emergency_contact_name: formData.emergencyContact,
      emergency_contact_phone: formData.emergencyPhone,
      status: 'active'
    })
    .select()
    .single();

  if (patientError) throw patientError;

  // Create doctor-patient relationship
  const { error: relationshipError } = await supabase
    .from('doctor_patient_relationships')
    .insert({
      doctor_id: user.id,
      patient_id: newUserId,
      relationship_type: 'assigned',
      started_at: now
    });

  if (relationshipError) throw relationshipError;

  return { success: true, patientId: newUserId };
} 