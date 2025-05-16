'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export type PatientDetail = {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  bloodType: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  isActive: boolean;
  parameters: {
    current: {
      weight: string;
      bloodPressure: string;
      bloodSugar: string;
      heartRate: string;
      lastUpdated: string;
    };
    history: Array<{
      date: string;
      weight: string;
      bloodPressure: string;
      bloodSugar: string;
      heartRate: string;
    }>;
  };
  medicalHistory: Array<{
    date: string;
    condition: string;
    notes: string;
  }>;
  upcomingAppointments: Array<{
    date: string;
    time: string;
    type: string;
  }>;
  prescriptions: Array<{
    date: string;
    medication: string;
    dosage: string;
    frequency: string;
  }>;
};

type HealthParameter = {
  id: string;
  patient_id: string;
  parameter: string;
  value: number;
  unit: string;
  created_at: string;
};

type ParameterHistory = {
  date: string;
  weight: string;
  bloodPressure: string;
  bloodSugar: string;
  heartRate: string;
};

export async function getPatientDetails(patientId: string): Promise<PatientDetail> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Remove the 'P' prefix if it exists
  const cleanId = patientId.startsWith('P') ? patientId.slice(1) : patientId;

  // Fetch patient basic info
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select(`
      id,
      status,
      blood_type,
      emergency_contact_name,
      emergency_contact_phone,
      users (
        id,
        name,
        DOB,
        gender,
        phone,
        email,
        address
      )
    `)
    .eq('id', cleanId)
    .single();

  if (patientError) throw patientError;
  if (!patient) throw new Error('Patient not found');

  // Fetch all health parameters with a high limit to ensure we get all records
  const { data: parameters, error: parametersError } = await supabase
    .from('health_parameters')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false })
    .limit(1000); // Set a high limit to get all records

  if (parametersError) throw parametersError;

  // Group parameters by date and time for unique entries
  const groupedParameters = parameters?.reduce((acc, param) => {
    const dateTime = new Date(param.created_at);
    const date = dateTime.toLocaleDateString();
    const time = dateTime.toLocaleTimeString();
    const key = `${date} ${time}`; // Use both date and time as key to ensure uniqueness
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(param);
    return acc;
  }, {} as Record<string, HealthParameter[]>) || {};

  // Get the most recent readings for current display
  const latestDate = Object.keys(groupedParameters).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )[0];
  const latestReadings = latestDate ? groupedParameters[latestDate] : [];

  // Fetch medical records
  const { data: medicalRecords, error: recordsError } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false });

  if (recordsError) throw recordsError;

  // Fetch appointments
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patient.id)
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true });

  if (appointmentsError) throw appointmentsError;

  // Fetch prescriptions
  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from('prescriptions')
    .select(`
      *,
      prescription_medications (
        medications (
          name
        )
      )
    `)
    .eq('patient_id', patient.id)
    .order('created_at', { ascending: false });

  if (prescriptionsError) throw prescriptionsError;

  const patientWithUser = patient as unknown as {
    id: string;
    status: string;
    blood_type: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    users: {
      id: string;
      name: string;
      DOB: string | null;
      gender: string | null;
      phone: string | null;
      email: string;
      address: string | null;
    };
  };

  // Transform the data to match our frontend interface
  return {
    id: `P${patientWithUser.id.slice(0, 4)}`,
    name: patientWithUser.users.name,
    age: calculateAge(patientWithUser.users.DOB),
    gender: patientWithUser.users.gender || 'Not specified',
    contact: patientWithUser.users.phone || 'Not specified',
    email: patientWithUser.users.email,
    bloodType: patientWithUser.blood_type || 'Not specified',
    address: patientWithUser.users.address || 'Not specified',
    emergencyName: patientWithUser.emergency_contact_name || 'Not specified',
    emergencyPhone: patientWithUser.emergency_contact_phone || 'Not specified',
    isActive: patientWithUser.status === 'active',
    parameters: {
      current: {
        weight: latestReadings.find((r: HealthParameter) => r.parameter === 'weight')?.value
          ? `${latestReadings.find((r: HealthParameter) => r.parameter === 'weight')?.value} kg`
          : 'Not available',
        bloodPressure: latestReadings.find((r: HealthParameter) => r.parameter === 'bloodPressureSystolic')?.value
          ? `${latestReadings.find((r: HealthParameter) => r.parameter === 'bloodPressureSystolic')?.value}/${latestReadings.find((r: HealthParameter) => r.parameter === 'bloodPressureDiastolic')?.value || '-'} mmHg`
          : 'Not available',
        bloodSugar: latestReadings.find((r: HealthParameter) => r.parameter === 'bloodSugar')?.value
          ? `${latestReadings.find((r: HealthParameter) => r.parameter === 'bloodSugar')?.value} mg/dL`
          : 'Not available',
        heartRate: latestReadings.find((r: HealthParameter) => r.parameter === 'heartRate')?.value
          ? `${latestReadings.find((r: HealthParameter) => r.parameter === 'heartRate')?.value} bpm`
          : 'Not available',
        lastUpdated: latestDate || 'No data',
      },
      history: Object.entries(groupedParameters)
        .map(([dateTime, readings]): ParameterHistory => {
          const systolic = (readings as HealthParameter[]).find((r: HealthParameter) => r.parameter === 'bloodPressureSystolic')?.value;
          const diastolic = (readings as HealthParameter[]).find((r: HealthParameter) => r.parameter === 'bloodPressureDiastolic')?.value;
          const weight = (readings as HealthParameter[]).find((r: HealthParameter) => r.parameter === 'weight')?.value;
          const bloodSugar = (readings as HealthParameter[]).find((r: HealthParameter) => r.parameter === 'bloodSugar')?.value;
          const heartRate = (readings as HealthParameter[]).find((r: HealthParameter) => r.parameter === 'heartRate')?.value;

          return {
            date: dateTime, // Use the full date and time as the key
            weight: weight ? `${weight} kg` : 'Not available',
            bloodPressure: systolic ? `${systolic}/${diastolic || '-'} mmHg` : 'Not available',
            bloodSugar: bloodSugar ? `${bloodSugar} mg/dL` : 'Not available',
            heartRate: heartRate ? `${heartRate} bpm` : 'Not available',
          };
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    },
    medicalHistory: medicalRecords?.map(record => ({
      date: new Date(record.created_at).toLocaleDateString(),
      condition: record.record_type || 'Not specified',
      notes: record.notes || 'No notes available',
    })) || [],
    upcomingAppointments: appointments?.map(appointment => ({
      date: new Date(appointment.appointment_date).toLocaleDateString(),
      time: new Date(appointment.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: appointment.type,
    })) || [],
    prescriptions: prescriptions?.map(prescription => ({
      date: new Date(prescription.created_at).toLocaleDateString(),
      medication: prescription.prescription_medications?.[0]?.medications?.name || 'Not specified',
      dosage: 'Not specified',
      frequency: 'Not specified',
    })) || [],
  };
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

export async function updatePatientStatus(patientId: string, isActive: boolean): Promise<void> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Remove the 'P' prefix if it exists
  const cleanId = patientId.startsWith('P') ? patientId.slice(1) : patientId;

  const { error } = await supabase
    .from('patients')
    .update({ status: isActive ? 'active' : 'inactive' })
    .eq('id', cleanId);

  if (error) throw error;
}

export async function savePatientParameters(
  patientId: string,
  parameters: {
    weight?: string;
    bloodPressureSystolic?: string;
    bloodPressureDiastolic?: string;
    bloodSugar?: string;
    heartRate?: string;
  }
): Promise<void> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ 
    cookies: () => cookieStore 
  });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Remove the 'P' prefix if it exists
  const cleanId = patientId.startsWith('P') ? patientId.slice(1) : patientId;

  const timestamp = new Date().toISOString();
  const parametersToInsert = [];

  if (parameters.weight) {
    parametersToInsert.push({
      patient_id: cleanId,
      parameter: 'weight',
      value: parseFloat(parameters.weight),
      unit: 'kg',
      created_at: timestamp
    });
  }

  if (parameters.bloodPressureSystolic) {
    parametersToInsert.push({
      patient_id: cleanId,
      parameter: 'bloodPressureSystolic',
      value: parseFloat(parameters.bloodPressureSystolic),
      unit: 'mmHg',
      created_at: timestamp
    });
  }

  if (parameters.bloodPressureDiastolic) {
    parametersToInsert.push({
      patient_id: cleanId,
      parameter: 'bloodPressureDiastolic',
      value: parseFloat(parameters.bloodPressureDiastolic),
      unit: 'mmHg',
      created_at: timestamp
    });
  }

  if (parameters.bloodSugar) {
    parametersToInsert.push({
      patient_id: cleanId,
      parameter: 'bloodSugar',
      value: parseFloat(parameters.bloodSugar),
      unit: 'mg/dL',
      created_at: timestamp
    });
  }

  if (parameters.heartRate) {
    parametersToInsert.push({
      patient_id: cleanId,
      parameter: 'heartRate',
      value: parseFloat(parameters.heartRate),
      unit: 'bpm',
      created_at: timestamp
    });
  }

  if (parametersToInsert.length > 0) {
    const { error } = await supabase
      .from('health_parameters')
      .insert(parametersToInsert);

    if (error) throw error;
  }
}

export async function updatePatientDetails(
  patientId: string,
  details: {
    name: string;
    age: number;
    gender: string;
    contact: string;
    address: string;
    bloodType: string;
    emergencyName: string;
    emergencyPhone: string;
    status: 'active' | 'inactive';
  }
): Promise<void> {
  const cookieStore = cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });

  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // First, get the patient's full UUID and user ID
  const { data: patientData, error: patientError } = await supabase
    .from('patients')
    .select(`
      id,
      users!inner (
        id
      )
    `)
    .eq('id', patientId)
    .single();

  if (patientError) {
    console.error('Error fetching patient:', patientError);
    throw new Error('Failed to fetch patient data');
  }

  if (!patientData || !patientData.users) {
    throw new Error('Patient not found');
  }

  const users = patientData.users as unknown as { id: string };
  const userId = users.id;
  const fullPatientId = patientData.id;

  // Update users table
  const dob = details.age ? new Date(new Date().setFullYear(new Date().getFullYear() - details.age)).toISOString().slice(0, 10) : null;
  const { error: userError } = await supabase
    .from('users')
    .update({
      name: details.name,
      DOB: dob,
      gender: details.gender,
      phone: details.contact,
      address: details.address,
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user:', userError);
    throw new Error('Failed to update user data');
  }

  // Update patients table
  const { error: patientUpdateError } = await supabase
    .from('patients')
    .update({
      blood_type: details.bloodType,
      emergency_contact_name: details.emergencyName,
      emergency_contact_phone: details.emergencyPhone,
      status: details.status,
    })
    .eq('id', fullPatientId);

  if (patientUpdateError) {
    console.error('Error updating patient:', patientUpdateError);
    throw new Error('Failed to update patient data');
  }
} 