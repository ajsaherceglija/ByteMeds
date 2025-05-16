import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';
import { Database } from '@/types/supabase';

// Validation schema for settings
const settingSchema = z.object({
  key: z.enum(['registration', 'appointments', 'notifications', 'maintenance']),
  value: z.object({}).passthrough(), // Allow any object structure for value
});

// GET /api/settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const { data, error } = await supabase
      .from('system_settings')
      .select('*');

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings', details: error },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      // If no settings exist, return default settings
      const defaultSettings = {
        registration: { enabled: true },
        appointments: {
          enabled: true,
          default_duration: 30,
          max_daily: 8,
        },
        notifications: { enabled: true },
        maintenance: { enabled: false },
      };

      // Insert default settings
      const { error: insertError } = await supabase
        .from('system_settings')
        .upsert(
          Object.entries(defaultSettings).map(([key, value]) => ({
            key,
            value,
            updated_at: new Date().toISOString(),
          }))
        );

      if (insertError) {
        console.error('Error inserting default settings:', insertError);
      }

      return NextResponse.json(defaultSettings);
    }

    const settingsMap = data.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}

// PUT /api/settings
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request body
    try {
      settingSchema.parse(body);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid setting data', details: validationError },
        { status: 400 }
      );
    }

    const { key, value } = body;

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Directly perform upsert without checking existing setting
    const { error: upsertError } = await supabase
      .from('system_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key'
      });

    if (upsertError) {
      console.error('Error updating setting:', upsertError);
      return NextResponse.json(
        { error: 'Failed to update setting', details: upsertError },
        { status: 500 }
      );
    }

    // Get the updated setting
    const { data: updatedSetting, error: fetchError } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (fetchError) {
      console.error('Error fetching updated setting:', fetchError);
      return NextResponse.json(
        { error: 'Setting updated but failed to fetch the new value', details: fetchError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Setting updated successfully',
      setting: updatedSetting
    });
  } catch (error) {
    console.error('Error in PUT /api/settings:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 