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
      users: {
        Row: {
          id: string
          email: string
          name: string
          isDoctor: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          isDoctor?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          isDoctor?: boolean
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          date: string
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          date: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          date?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
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
  }
} 