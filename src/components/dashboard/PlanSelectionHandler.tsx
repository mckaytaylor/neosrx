import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

  const handlePlanSelect = async (plan: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return;
      }

      // Calculate amount before database operations
      const medication = formData.selectedMedication?.toLowerCase();
      const amount = calculateAmount(medication, plan);
      
      if (!amount) {
        toast({
          title: "Error",
          description: "Invalid plan or medication selected",
          variant: "destructive",
        });
        return;
      }

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();

      if (existingDraft) {
        // Update existing draft with the calculated amount
        const { data, error } = await supabase
          .from('assessments')
          .update({
            medication: medication,
            plan_type: plan,
            amount: amount,
            medical_conditions: Array.isArray(formData.selectedConditions) ? formData.selectedConditions : [],
            patient_height: calculateHeight(formData.heightFeet, formData.heightInches),
            patient_weight: parseFloat(formData.weight) || null,
            date_of_birth: formData.dateOfBirth || null,
            gender: formData.gender || null,
            cell_phone: formData.cellPhone || null,
            other_medical_conditions: formData.otherCondition || null,
            medullary_thyroid_cancer: formData.medullaryThyroidCancer === "yes",
            family_mtc_history: formData.familyMtcHistory === "yes",
            men2: formData.men2 === "yes",
            pregnant_or_breastfeeding: formData.pregnantOrBreastfeeding === "yes",
            exercise_activity: formData.exerciseActivity || null,
            taking_medications: formData.takingMedications === "yes",
            medications_list: formData.medicationsList || null,
            previous_glp1: formData.previousGlp1 === "yes",
            recent_glp1: formData.recentGlp1 === "yes",
            has_allergies: formData.hasAllergies === "yes",
            allergies_list: formData.allergiesList || null,
            taking_blood_thinners: formData.takingBloodThinners === "yes",
          })
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (error) throw error;
        if (data) onSuccess(plan, data.id);
        return;
      }

      // If no existing draft, create a new one with the calculated amount
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: user.id,
          medication: medication,
          plan_type: plan,
          amount: amount,
          medical_conditions: Array.isArray(formData.selectedConditions) ? formData.selectedConditions : [],
          patient_height: calculateHeight(formData.heightFeet, formData.heightInches),
          patient_weight: parseFloat(formData.weight) || null,
          date_of_birth: formData.dateOfBirth || null,
          gender: formData.gender || null,
          cell_phone: formData.cellPhone || null,
          other_medical_conditions: formData.otherCondition || null,
          medullary_thyroid_cancer: formData.medullaryThyroidCancer === "yes",
          family_mtc_history: formData.familyMtcHistory === "yes",
          men2: formData.men2 === "yes",
          pregnant_or_breastfeeding: formData.pregnantOrBreastfeeding === "yes",
          exercise_activity: formData.exerciseActivity || null,
          taking_medications: formData.takingMedications === "yes",
          medications_list: formData.medicationsList || null,
          previous_glp1: formData.previousGlp1 === "yes",
          recent_glp1: formData.recentGlp1 === "yes",
          has_allergies: formData.hasAllergies === "yes",
          allergies_list: formData.allergiesList || null,
          taking_blood_thinners: formData.takingBloodThinners === "yes",
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      if (data) onSuccess(plan, data.id);
    } catch (error: any) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateAmount = (medication: string, plan: string): number | null => {
    const amounts: Record<string, Record<string, number>> = {
      tirzepatide: {
        "1 month": 499,
        "3 months": 810,
        "5 months": 1300,
      },
      semaglutide: {
        "1 month": 399,
        "4 months": 640,
        "7 months": 1050,
      },
    };

    if (!medication || !amounts[medication] || !amounts[medication][plan]) {
      console.error('Invalid amount calculation:', { medication, plan });
      return null;
    }

    return amounts[medication][plan];
  };

  const calculateHeight = (feet: string, inches: string): number | null => {
    const feetNum = parseInt(feet);
    const inchesNum = parseInt(inches || '0');
    if (isNaN(feetNum)) return null;
    return feetNum * 12 + (isNaN(inchesNum) ? 0 : inchesNum);
  };

  return { handlePlanSelect };
};