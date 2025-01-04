import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatPlanType, validatePlan, calculateAmount } from "@/utils/planUtils";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

  const prepareAssessmentData = (
    userId: string,
    medication: string,
    formattedPlan: string,
    amount: number,
    formData: any
  ) => {
    const height = parseInt(formData.heightFeet) * 12 + parseInt(formData.heightInches || '0');
    const weight = parseFloat(formData.weight);
    const medicalConditions = Array.isArray(formData.selectedConditions) 
      ? formData.selectedConditions 
      : [];

    const data = {
      user_id: userId,
      medication: medication.toLowerCase(),
      plan_type: formattedPlan,
      amount: amount,
      medical_conditions: medicalConditions,
      patient_height: isNaN(height) ? null : height,
      patient_weight: isNaN(weight) ? null : weight,
      status: 'draft' as const
    };

    console.log('Prepared assessment data:', data);
    return data;
  };

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

      const medication = formData.selectedMedication;
      validatePlan(plan, medication);

      const formattedPlan = formatPlanType(plan);
      console.log('Selected plan:', { plan, formattedPlan });

      const amount = calculateAmount(medication, formattedPlan);
      console.log('Calculated amount:', amount);

      const assessmentData = prepareAssessmentData(
        user.id,
        medication,
        formattedPlan,
        amount,
        formData
      );

      // First check if there's an existing draft
      const { data: existingDraft } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .single();

      console.log('Saving assessment with data:', assessmentData);

      let data;
      if (existingDraft) {
        const { data: updatedData, error: updateError } = await supabase
          .from('assessments')
          .update(assessmentData)
          .eq('id', existingDraft.id)
          .select()
          .single();

        if (updateError) throw updateError;
        data = updatedData;
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('assessments')
          .insert(assessmentData)
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      }

      if (!data) {
        throw new Error("Failed to save assessment");
      }

      console.log('Assessment saved successfully:', data);
      onSuccess(formattedPlan, data.id);
    } catch (error: any) {
      console.error("Error selecting plan:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { handlePlanSelect };
};