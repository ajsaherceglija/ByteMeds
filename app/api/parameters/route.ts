import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Schema for parameter validation
const parameterSchema = z.object({
  parameter: z.enum([
    'weight',
    'bloodPressureSystolic',
    'bloodPressureDiastolic',
    'bloodSugar',
    'heartRate',
  ]),
  value: z.number().min(0),
  unit: z.string(),
  notes: z.string().optional().nullable(),
});

// GET /api/parameters
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Get parameters for the current user
    const { data, error } = await supabase
      .from('health_parameters')
      .select('*')
      .eq('patient_id', session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching parameters:', error);
      return NextResponse.json(
        { error: 'Failed to fetch parameters' },
        { status: 500 }
      );
    }

    // If no data exists, seed with mock data
    if (!data || data.length === 0) {
      const mockData = generateMockData(session.user.id);
      const { error: insertError } = await supabase
        .from('health_parameters')
        .insert(mockData);

      if (insertError) {
        console.error('Error inserting mock data:', insertError);
        return NextResponse.json(
          { error: 'Failed to seed mock data' },
          { status: 500 }
        );
      }

      // Fetch the newly inserted data
      const { data: seededData, error: fetchError } = await supabase
        .from('health_parameters')
        .select('*')
        .eq('patient_id', session.user.id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching seeded data:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch seeded data' },
          { status: 500 }
        );
      }

      return NextResponse.json(seededData);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/parameters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/parameters
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = parameterSchema.parse(body);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { error } = await supabase.from('health_parameters').insert({
      patient_id: session.user.id,
      parameter: validatedData.parameter,
      value: validatedData.value,
      unit: validatedData.unit,
      notes: validatedData.notes,
    });

    if (error) {
      console.error('Error inserting parameter:', error);
      return NextResponse.json(
        { error: 'Failed to add parameter' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Parameter added successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameter data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/parameters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/parameters
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = parameterSchema.parse(body);

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Update the most recent parameter of the given type
    const { error: selectError, data: existingData } = await supabase
      .from('health_parameters')
      .select('id')
      .eq('patient_id', session.user.id)
      .eq('parameter', validatedData.parameter)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error fetching parameter:', selectError);
      return NextResponse.json(
        { error: 'Failed to update parameter' },
        { status: 500 }
      );
    }

    if (!existingData) {
      return NextResponse.json(
        { error: 'Parameter not found' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('health_parameters')
      .update({
        value: validatedData.value,
        unit: validatedData.unit,
        notes: validatedData.notes,
      })
      .eq('id', existingData.id);

    if (updateError) {
      console.error('Error updating parameter:', updateError);
      return NextResponse.json(
        { error: 'Failed to update parameter' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Parameter updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameter data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/parameters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate mock data
function generateMockData(patientId: string) {
  const now = new Date();
  const mockData = [];

  // Generate data for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Weight (70-73 kg with some variation)
    mockData.push({
      patient_id: patientId,
      parameter: 'weight',
      value: 70 + Math.sin(i * 0.2) * 3,
      unit: 'kg',
      notes: null,
    });

    // Blood Pressure (120/80 with variation)
    mockData.push({
      patient_id: patientId,
      parameter: 'bloodPressureSystolic',
      value: 120 + Math.sin(i * 0.3) * 10,
      unit: 'mmHg',
      notes: null,
    });
    mockData.push({
      patient_id: patientId,
      parameter: 'bloodPressureDiastolic',
      value: 80 + Math.sin(i * 0.3) * 5,
      unit: 'mmHg',
      notes: null,
    });

    // Blood Sugar (random variation between 80-120)
    mockData.push({
      patient_id: patientId,
      parameter: 'bloodSugar',
      value: 100 + Math.sin(i * 0.4) * 20,
      unit: 'mg/dL',
      notes: null,
    });

    // Heart Rate (60-100 with variation)
    mockData.push({
      patient_id: patientId,
      parameter: 'heartRate',
      value: 80 + Math.sin(i * 0.5) * 20,
      unit: 'BPM',
      notes: null,
    });
  }

  return mockData;
} 