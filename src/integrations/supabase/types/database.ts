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
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
      }
      provider_reviews: {
        Row: {
          approval_status: "Pending" | "Approved" | "Denied"
          created_at: string
          id: string
          provider_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: "Pending" | "Approved" | "Denied"
          created_at?: string
          id?: string
          provider_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: "Pending" | "Approved" | "Denied"
          created_at?: string
          id?: string
          provider_notes?: string | null
          updated_at?: string
          user_id?: string
        }
      }
      assessments: {
        Row: {
          amount: number
          assessment_date: string | null
          created_at: string
          id: string
          medical_conditions: string[] | null
          medication: string
          patient_height: number | null
          patient_weight: number | null
          plan_type: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          assessment_date?: string | null
          created_at?: string
          id?: string
          medical_conditions?: string[] | null
          medication: string
          patient_height?: number | null
          patient_weight?: number | null
          plan_type: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          assessment_date?: string | null
          created_at?: string
          id?: string
          medical_conditions?: string[] | null
          medication?: string
          patient_height?: number | null
          patient_weight?: number | null
          plan_type?: string
          status?: string | null
          updated_at?: string
          user_id?: string
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
      approval_status: "Pending" | "Approved" | "Denied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}