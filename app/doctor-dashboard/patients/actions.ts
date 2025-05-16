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

type SharedPatient = {
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
};

type PatientWithSharingDoctor = SharedPatient & {
  sharingDoctor: string;
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

  // First get all shared patients
  const { data: sharedPatients, error: sharedError } = await supabase
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
    .eq('relationship_type', 'shared');

  if (sharedError) throw sharedError;
  if (!sharedPatients) return [];

  // For each shared patient, get the assigned doctor
  const patientsWithSharingDoctor = await Promise.all(
    (sharedPatients as unknown as SharedPatient[]).map(async (patient) => {
      const { data: assignedDoctor } = await supabase
        .from('doctor_patient_relationships')
        .select(`
          doctors (
            users (
              name
            )
          )
        `)
        .eq('patient_id', patient.patient_id)
        .eq('relationship_type', 'assigned')
        .single();

      const sharingDoctor = (assignedDoctor as any)?.doctors?.users?.name || 'Unknown';

      return {
        ...patient,
        sharingDoctor
      } as PatientWithSharingDoctor;
    })
  );

  // Transform the data to match our frontend interface
  return patientsWithSharingDoctor.map(rel => ({
    id: rel.patients.id,
    name: rel.patients.users.name,
    age: calculateAge(rel.patients.users.DOB),
    lastVisit: rel.started_at || new Date().toISOString(),
    condition: 'Active',
    status: rel.patients.status || 'Active',
    sharedBy: rel.sharingDoctor
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

export type Doctor = {
  id: string;
  name: string;
  specialty: string | null;
  hospital: string | null;
};

export async function getDoctors(): Promise<Doctor[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: doctors, error } = await supabase
    .from('doctors')
    .select(`
      id,
      specialty,
      hospital,
      users (
        name
      )
    `)
    .neq('id', user.id); // Exclude current doctor

  if (error) throw error;
  if (!doctors) return [];

  return doctors.map(doctor => ({
    id: doctor.id,
    name: (doctor.users as any).name,
    specialty: doctor.specialty,
    hospital: doctor.hospital
  }));
}

export async function sharePatient(patientId: string, doctorIds: string[]) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const now = new Date().toISOString();

  // First, delete any existing shared relationships for this patient
  const { error: deleteError } = await supabase
    .from('doctor_patient_relationships')
    .delete()
    .eq('patient_id', patientId)
    .eq('relationship_type', 'shared');

  if (deleteError) throw deleteError;

  // Then create new relationships for each selected doctor
  const relationships = doctorIds.map(doctorId => ({
    doctor_id: doctorId,
    patient_id: patientId,
    relationship_type: 'shared',
    started_at: now
  }));

  const { error } = await supabase
    .from('doctor_patient_relationships')
    .insert(relationships);

  if (error) throw error;

  return { success: true };
}

export async function getSharedDoctors(patientId: string): Promise<string[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: relationships, error } = await supabase
    .from('doctor_patient_relationships')
    .select('doctor_id')
    .eq('patient_id', patientId)
    .eq('relationship_type', 'shared');

  if (error) throw error;
  if (!relationships) return [];

  return relationships.map(rel => rel.doctor_id);
} 