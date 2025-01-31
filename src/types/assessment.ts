import { UtmParameters } from "./utm";

export interface AssessmentFormData {
  dateOfBirth: string;
  gender: string;
  cellPhone: string;
  selectedConditions: string[];
  otherCondition: string;
  medullaryThyroidCancer: string;
  familyMtcHistory: string;
  men2: string;
  pregnantOrBreastfeeding: string;
  weight: string;
  heightFeet: string;
  heightInches: string;
  exerciseActivity: string;
  takingMedications: string;
  medicationsList: string;
  previousGlp1: string;
  recentGlp1: string;
  hasAllergies: string;
  allergiesList: string;
  takingBloodThinners: string;
  selectedMedication: string;
  selectedPlan: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  assessment: any | null;
}

export interface Assessment extends UtmParameters {
  id: string;
  user_id: string;
  status: 'draft' | 'completed' | 'prescribed' | 'denied';
  medication: string;
  plan_type: string;
  amount: number;
  date_of_birth?: string;
  gender?: string;
  cell_phone?: string;
  medical_conditions?: string[];
  other_medical_conditions?: string;
  medullary_thyroid_cancer?: boolean;
  family_mtc_history?: boolean;
  men2?: boolean;
  pregnant_or_breastfeeding?: boolean;
  patient_height?: number;
  patient_weight?: number;
  exercise_activity?: string;
  taking_medications?: boolean;
  medications_list?: string;
  previous_glp1?: boolean;
  recent_glp1?: boolean;
  has_allergies?: boolean;
  allergies_list?: string;
  taking_blood_thinners?: boolean;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
}