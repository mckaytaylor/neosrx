export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          allergies_list: string | null
          amount: number
          assessment_date: string | null
          cell_phone: string | null
          created_at: string
          date_of_birth: string | null
          denial_reason: string | null
          exercise_activity: string | null
          family_mtc_history: boolean | null
          gender: string | null
          has_allergies: boolean | null
          id: string
          medical_conditions: string[] | null
          medication: string
          medications_list: string | null
          medullary_thyroid_cancer: boolean | null
          men2: boolean | null
          other_medical_conditions: string | null
          patient_height: number | null
          patient_weight: number | null
          plan_type: string
          pregnant_or_breastfeeding: boolean | null
          previous_glp1: boolean | null
          recent_glp1: boolean | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_state: string | null
          shipping_zip: string | null
          status: Database["public"]["Enums"]["assessment_status"]
          taking_blood_thinners: boolean | null
          taking_medications: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies_list?: string | null
          amount: number
          assessment_date?: string | null
          cell_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          denial_reason?: string | null
          exercise_activity?: string | null
          family_mtc_history?: boolean | null
          gender?: string | null
          has_allergies?: boolean | null
          id?: string
          medical_conditions?: string[] | null
          medication: string
          medications_list?: string | null
          medullary_thyroid_cancer?: boolean | null
          men2?: boolean | null
          other_medical_conditions?: string | null
          patient_height?: number | null
          patient_weight?: number | null
          plan_type: string
          pregnant_or_breastfeeding?: boolean | null
          previous_glp1?: boolean | null
          recent_glp1?: boolean | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_state?: string | null
          shipping_zip?: string | null
          status?: Database["public"]["Enums"]["assessment_status"]
          taking_blood_thinners?: boolean | null
          taking_medications?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies_list?: string | null
          amount?: number
          assessment_date?: string | null
          cell_phone?: string | null
          created_at?: string
          date_of_birth?: string | null
          denial_reason?: string | null
          exercise_activity?: string | null
          family_mtc_history?: boolean | null
          gender?: string | null
          has_allergies?: boolean | null
          id?: string
          medical_conditions?: string[] | null
          medication?: string
          medications_list?: string | null
          medullary_thyroid_cancer?: boolean | null
          men2?: boolean | null
          other_medical_conditions?: string | null
          patient_height?: number | null
          patient_weight?: number | null
          plan_type?: string
          pregnant_or_breastfeeding?: boolean | null
          previous_glp1?: boolean | null
          recent_glp1?: boolean | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_state?: string | null
          shipping_zip?: string | null
          status?: Database["public"]["Enums"]["assessment_status"]
          taking_blood_thinners?: boolean | null
          taking_medications?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_profiles_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: []
      }
      provider_reviews: {
        Row: {
          approval_status: string | null
          created_at: string
          id: string
          provider_notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          created_at?: string
          id?: string
          provider_notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string | null
          created_at?: string
          id?: string
          provider_notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_reviews_user_id_profiles_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_provider_metadata: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      approval_status: "Pending" | "Approved" | "Denied"
      assessment_status: "draft" | "completed" | "prescribed" | "denied"
      provider_role: "admin" | "provider"
      user_role: "user" | "provider"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
