export interface Assessment {
  id: string
  user_id: string
  plan_type: string
  medication: string
  amount: number
  status: string | null
  assessment_date: string | null
  patient_weight: number | null
  patient_height: number | null
  medical_conditions: string[] | null
  created_at: string
  updated_at: string
  profiles?: {
    first_name: string | null
    last_name: string | null
  } | null
}

export interface Review {
  id: string
  user_id: string
  provider_notes: string | null
  approval_status: "Pending" | "Approved" | "Denied"
  created_at: string
  updated_at: string
  profiles: {
    first_name: string | null
    last_name: string | null
  } | null
}