import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  is_doctor: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, is_doctor } = signupSchema.parse(body);

    const { data: existingUser, error: searchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (searchError && searchError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: "Error checking existing user" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          is_doctor,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    // Then, store the user information in the users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        name,
        is_doctor: is_doctor || false,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      // If user table insertion fails, we should handle this case
      // Ideally, we would want to delete the auth user, but that's not possible with the current setup
      console.error('Failed to create user record:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Account created successfully! Please check your email for verification.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name,
          is_doctor,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error('Signup error:', error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 