export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          date_of_birth: string | null 
          gender: string | null
          address: string | null
          city: string | null
          country: string | null
          blood_type: string | null
          emergency_contact: string | null
          updated_at: string
        }
        Insert: {
          id: string 
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          blood_type?: string | null
          emergency_contact?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          date_of_birth?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          blood_type?: string | null
          emergency_contact?: string | null
          updated_at?: string
        }
      }      
      users: {
        Row: {
          id: string
          email: string
          name: string
          is_doctor: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          is_doctor?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          is_doctor?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          is_active: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          date: string
          is_active: true
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          date?: string
          is_active: boolean
          notes?: string | null
          created_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          diagnosis: string
          treatment: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          diagnosis: string
          treatment: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          diagnosis?: string
          treatment?: string
          notes?: string | null
          created_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          medication: string
          dosage: string
          frequency: string
          duration: string
          notes: string | null
          status: 'active' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          medication: string
          dosage: string
          frequency: string
          duration: string
          notes?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          medication?: string
          dosage?: string
          frequency?: string
          duration?: string
          notes?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
      health_parameters: {
        Row: {
          id: string
          patient_id: string
          parameter: string
          value: number
          unit: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          parameter: string
          value: number
          unit: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          parameter?: string
          value?: number
          unit?: string
          notes?: string | null
          created_at?: string
        }
      }
      
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 