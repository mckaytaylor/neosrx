import { UtmParameters } from "@/types/utm";

export interface Assessment extends UtmParameters {
  id: string;
  user_id: string;
  plan_type: string;
  medication: string;
  amount: number;
  status: string | null;
  assessment_date: string | null;
  patient_weight: number | null;
  patient_height: number | null;
  medical_conditions: string[] | null;
  created_at: string;
  updated_at: string;
  denial_reason: string | null;
  date_of_birth: string | null;
  gender: string | null;
  cell_phone: string | null;
  other_medical_conditions: string | null;
  medullary_thyroid_cancer: boolean | null;
  family_mtc_history: boolean | null;
  men2: boolean | null;
  pregnant_or_breastfeeding: boolean | null;
  exercise_activity: string | null;
  taking_medications: boolean | null;
  medications_list: string | null;
  previous_glp1: boolean | null;
  recent_glp1: boolean | null;
  has_allergies: boolean | null;
  allergies_list: string | null;
  taking_blood_thinners: boolean | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export interface Review {
  id: string;
  user_id: string;
  provider_notes: string | null;
  approval_status: "Pending" | "Approved" | "Denied";
  created_at: string;
  updated_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}