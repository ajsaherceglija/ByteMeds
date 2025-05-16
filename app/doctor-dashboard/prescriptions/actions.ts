'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

type PrescriptionWithRelations = {
  id: string;
  created_at: string;
  valid_until: string | null;
  status: string | null;
  notes: string | null;
  appointment_id: string | null;
  patients: {
    users: {
      name: string;
    };
  };
  doctors: {
    users: {
      name: string;
    };
  };
  prescription_medications: Array<{
    medications: {
      name: string;
    };
    dosage: string | null;
    frequency: string | null;
  }>;
  appointments: Array<{
    appointment_date: string;
  }>;
};

type PrescriptionDetailsWithRelations = PrescriptionWithRelations & {
  notes: string | null;
  appointment_id: string | null;
  doctors: {
    users: {
      name: string;
    };
  };
  appointments: Array<{
    appointment_date: string;
  }>;
};

export type Prescription = {
  id: string;
  patientName: string;
  date: string;
  status: string;
  validUntil: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
};

export type PrescriptionDetails = Prescription & {
  doctorName: string;
  notes: string;
  appointmentId: string | null;
  appointmentDate: string | null;
};

export type CreatePrescriptionData = {
  patientId: string;
  validUntil: string;
  medications: Array<{
    medicationId: string;
    dosage: string;
    frequency: string;
  }>;
  notes?: string;
};

export type Patient = {
  id: string;
  name: string;
};

export type Medication = {
  id: string;
  name: string;
};

export type UpdatePrescriptionData = {
  validUntil: string;
  medications: Array<{
    medicationId: string;
    dosage: string;
    frequency: string;
  }>;
  notes?: string;
};

export async function getPrescriptions(): Promise<Prescription[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, fetch prescriptions with patient details
  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from('prescriptions')
    .select(`
      id,
      created_at,
      valid_until,
      status,
      patients!inner (
        users!inner (
          name
        )
      )
    `)
    .eq('doctor_id', user.id)
    .order('created_at', { ascending: false });

  if (prescriptionsError) {
    console.error('Error fetching prescriptions:', prescriptionsError);
    throw new Error(`Failed to fetch prescriptions: ${prescriptionsError.message}`);
  }

  if (!prescriptions) {
    return [];
  }

  // Then, fetch medications for each prescription
  const prescriptionIds = prescriptions.map(p => p.id);
  const { data: medications, error: medicationsError } = await supabase
    .from('prescription_medications')
    .select(`
      prescription_id,
      medications!inner (
        name
      ),
      dosage,
      frequency
    `)
    .in('prescription_id', prescriptionIds);

  if (medicationsError) {
    console.error('Error fetching medications:', medicationsError);
    throw new Error(`Failed to fetch medications: ${medicationsError.message}`);
  }

  // Group medications by prescription_id
  const medicationsByPrescription = ((medications || []) as unknown as Array<{
    prescription_id: string;
    medications: {
      name: string;
    };
    dosage: string | null;
    frequency: string | null;
  }>).reduce((acc, med) => {
    if (!acc[med.prescription_id]) {
      acc[med.prescription_id] = [];
    }
    acc[med.prescription_id].push(med);
    return acc;
  }, {} as Record<string, Array<{
    prescription_id: string;
    medications: {
      name: string;
    };
    dosage: string | null;
    frequency: string | null;
  }>>);

  // Transform the data to match our frontend interface
  return (prescriptions as unknown as Array<{
    id: string;
    created_at: string;
    valid_until: string | null;
    status: string | null;
    patients: {
      users: {
        name: string;
      };
    };
  }>).map(prescription => ({
    id: prescription.id,
    patientName: prescription.patients?.users?.name || 'Unknown Patient',
    date: new Date(prescription.created_at).toLocaleDateString(),
    status: prescription.status || 'pending',
    validUntil: prescription.valid_until ? new Date(prescription.valid_until).toLocaleDateString() : 'Not specified',
    medications: (medicationsByPrescription[prescription.id] || []).map(pm => ({
      name: pm.medications.name || 'Unknown Medication',
      dosage: pm.dosage || 'Not specified',
      frequency: pm.frequency || 'Not specified',
    })),
  }));
}

export async function getPrescriptionDetails(prescriptionId: string): Promise<PrescriptionDetails> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch prescription details with all related information
  const { data: prescription, error } = await supabase
    .from('prescriptions')
    .select(`
      id,
      created_at,
      valid_until,
      status,
      notes,
      appointment_id,
      patients (
        users (
          name
        )
      ),
      doctors (
        users (
          name
        )
      ),
      prescription_medications (
        medications (
          name
        ),
        dosage,
        frequency
      ),
      appointments (
        appointment_date
      )
    `)
    .eq('id', prescriptionId)
    .eq('doctor_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching prescription details:', error);
    throw new Error(`Failed to fetch prescription details: ${error.message}`);
  }

  if (!prescription) {
    throw new Error('Prescription not found');
  }

  const prescriptionWithRelations = prescription as unknown as PrescriptionWithRelations;

  return {
    id: prescriptionWithRelations.id,
    patientName: prescriptionWithRelations.patients?.users?.name || 'Unknown Patient',
    date: new Date(prescriptionWithRelations.created_at).toLocaleDateString(),
    status: prescriptionWithRelations.status || 'pending',
    validUntil: prescriptionWithRelations.valid_until ? new Date(prescriptionWithRelations.valid_until).toLocaleDateString() : 'Not specified',
    medications: (prescriptionWithRelations.prescription_medications || []).map(pm => ({
      name: pm.medications?.name || 'Unknown Medication',
      dosage: pm.dosage || 'Not specified',
      frequency: pm.frequency || 'Not specified',
    })),
    doctorName: prescriptionWithRelations.doctors?.users?.name || 'Unknown Doctor',
    notes: prescriptionWithRelations.notes || 'No notes available',
    appointmentId: prescriptionWithRelations.appointment_id,
    appointmentDate: prescriptionWithRelations.appointments?.[0]?.appointment_date 
      ? new Date(prescriptionWithRelations.appointments[0].appointment_date).toLocaleDateString()
      : null,
  };
}

export async function createPrescription(data: CreatePrescriptionData) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    // Start a transaction
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: data.patientId,
        doctor_id: user.id,
        valid_until: data.validUntil,
        status: 'active',
        created_at: new Date().toISOString(),
        notes: data.notes || null,
      })
      .select()
      .single();

    if (prescriptionError) {
      console.error('Error creating prescription:', prescriptionError);
      throw new Error(`Failed to create prescription: ${prescriptionError.message}`);
    }

    if (!prescription) {
      throw new Error('Failed to create prescription: No data returned');
    }

    // Insert prescription medications
    const prescriptionMedications = data.medications.map(med => ({
      prescription_id: prescription.id,
      medication_id: med.medicationId,
      dosage: med.dosage,
      frequency: med.frequency,
    }));

    const { error: medicationsError } = await supabase
      .from('prescription_medications')
      .insert(prescriptionMedications);

    if (medicationsError) {
      console.error('Error creating prescription medications:', medicationsError);
      // Attempt to rollback the prescription creation
      await supabase
        .from('prescriptions')
        .delete()
        .eq('id', prescription.id);
      throw new Error(`Failed to create prescription medications: ${medicationsError.message}`);
    }

    return prescription;
  } catch (error) {
    console.error('Error in createPrescription:', error);
    throw error;
  }
}

export async function getPatients(): Promise<Patient[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch patients through doctor_patient_relationships
  const { data: relationships, error: relationshipsError } = await supabase
    .from('doctor_patient_relationships')
    .select(`
      patient_id,
      patients!inner (
        users!inner (
          name
        )
      )
    `)
    .eq('doctor_id', user.id);

  if (relationshipsError) {
    console.error('Error fetching patient relationships:', relationshipsError);
    throw relationshipsError;
  }

  type RelationshipData = {
    patient_id: string;
    patients: {
      users: {
        name: string;
      };
    };
  };

  return ((relationships || []) as unknown as RelationshipData[]).map(rel => ({
    id: rel.patient_id,
    name: rel.patients.users.name,
  }));
}

export async function getMedications(): Promise<Medication[]> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Fetch medications
  const { data: medicationsData, error: medicationsError } = await supabase
    .from('medications')
    .select('id, name');

  if (medicationsError) throw medicationsError;

  return medicationsData;
}

export async function updatePrescription(prescriptionId: string, data: UpdatePrescriptionData) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  try {
    // First, verify that the prescription exists and belongs to the current user
    const { data: existingPrescription, error: fetchError } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('id', prescriptionId)
      .eq('doctor_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching prescription:', fetchError);
      throw new Error(`Failed to fetch prescription: ${fetchError.message}`);
    }

    if (!existingPrescription) {
      throw new Error('Prescription not found or you do not have permission to update it');
    }

    // Update the prescription
    const { error: updateError } = await supabase
      .from('prescriptions')
      .update({
        valid_until: data.validUntil,
        notes: data.notes || null,
      })
      .eq('id', prescriptionId)
      .eq('doctor_id', user.id);

    if (updateError) {
      console.error('Error updating prescription:', updateError);
      throw new Error(`Failed to update prescription: ${updateError.message}`);
    }

    // Delete existing medications
    const { error: deleteError } = await supabase
      .from('prescription_medications')
      .delete()
      .eq('prescription_id', prescriptionId);

    if (deleteError) {
      console.error('Error deleting existing medications:', deleteError);
      throw new Error(`Failed to delete existing medications: ${deleteError.message}`);
    }

    // Insert new medications
    const prescriptionMedications = data.medications.map(med => ({
      prescription_id: prescriptionId,
      medication_id: med.medicationId,
      dosage: med.dosage,
      frequency: med.frequency,
    }));

    const { error: medicationsError } = await supabase
      .from('prescription_medications')
      .insert(prescriptionMedications);

    if (medicationsError) {
      console.error('Error creating prescription medications:', medicationsError);
      throw new Error(`Failed to create prescription medications: ${medicationsError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updatePrescription:', error);
    throw error;
  }
} 