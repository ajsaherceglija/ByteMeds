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
          phone: string | null
          is_doctor: boolean
          is_admin: boolean
          name: string
          DOB: string | null
          gender: string | null
          address: string | null
          city: string | null
          country: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          is_doctor?: boolean
          is_admin?: boolean
          name: string
          DOB?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          is_doctor?: boolean
          is_admin?: boolean
          name?: string
          DOB?: string | null
          gender?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
        }
      }

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

      doctors: {
        Row: {
          id: string
          specialty: string | null
          license_number: string | null
          hospital: string | null
          department: string | null
          years_of_experience: number | null
          education: string | null
          available_for_appointments: boolean | null
          updated_at: string
        }
        Insert: {
          id: string
          specialty?: string | null
          license_number?: string | null
          hospital?: string | null
          department?: string | null
          years_of_experience?: number | null
          education?: string | null
          available_for_appointments?: boolean | null
          updated_at?: string
        }
        Update: {
          id?: string
          specialty?: string | null
          license_number?: string | null
          hospital?: string | null
          department?: string | null
          years_of_experience?: number | null
          education?: string | null
          available_for_appointments?: boolean | null
          updated_at?: string
        }
      }

      patients: {
        Row: {
          id: string
          status: string | null
          blood_type: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
        }
        Insert: {
          id: string
          status?: string | null
          blood_type?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
        }
        Update: {
          id?: string
          status?: string | null
          blood_type?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
        }
      }

      appointments: {
        Row: {
          id: string
          patient_id: string | null
          doctor_id: string | null
          appointment_date: string
          duration: number
          type: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
          is_active: boolean | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          appointment_date: string
          duration: number
          type: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          appointment_date?: string
          duration?: number
          type?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
          is_active?: boolean | null
        }
      }

      health_parameters: {
        Row: {
          id: string
          patient_id: string | null
          parameter: string | null
          value: number | null
          unit: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          parameter?: string | null
          value?: number | null
          unit?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          parameter?: string | null
          value?: number | null
          unit?: string | null
          notes?: string | null
          created_at?: string
        }
      }

      prescriptions: {
        Row: {
          id: string
          patient_id: string | null
          doctor_id: string | null
          created_at: string
          valid_until: string | null
          status: string | null
          appointment_id: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          created_at?: string
          valid_until?: string | null
          status?: string | null
          appointment_id?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          created_at?: string
          valid_until?: string | null
          status?: string | null
          appointment_id?: string | null
        }
      }

      prescription_medications: {
        Row: {
          id: string
          prescription_id: string | null
          medication_id: string | null
          dosage: string | null
          frequency: string | null
        }
        Insert: {
          id?: string
          prescription_id?: string | null
          medication_id?: string | null
          dosage?: string | null
          frequency?: string | null
        }
        Update: {
          id?: string
          prescription_id?: string | null
          medication_id?: string | null
          dosage?: string | null
          frequency?: string | null
        }
      }

      medications: {
        Row: {
          id: string
          name: string
          description: string | null
          side_effects: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          side_effects?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          side_effects?: string | null
          created_at?: string
        }
      }

      medical_records: {
        Row: {
          id: string
          patient_id: string | null
          doctor_id: string | null
          record_type: string | null
          description: string | null
          notes: string | null
          order_requested: boolean | null
          order_description: string | null
          created_at: string
          updated_at: string
          is_active: boolean | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          record_type?: string | null
          description?: string | null
          notes?: string | null
          order_requested?: boolean | null
          order_description?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          record_type?: string | null
          description?: string | null
          notes?: string | null
          order_requested?: boolean | null
          order_description?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
        }
      }

      medical_reports: {
        Row: {
          id: string
          patient_id: string | null
          doctor_id: string | null
          diagnosis: string | null
          notes: string | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          diagnosis?: string | null
          notes?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string | null
          doctor_id?: string | null
          diagnosis?: string | null
          notes?: string | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      doctor_patient_relationships: {
        Row: {
          id: string
          doctor_id: string
          patient_id: string
          relationship_type: string | null
          started_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          doctor_id: string
          patient_id: string
          relationship_type?: string | null
          started_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          doctor_id?: string
          patient_id?: string
          relationship_type?: string | null
          started_at?: string | null
          notes?: string | null
        }
      }

      system_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
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