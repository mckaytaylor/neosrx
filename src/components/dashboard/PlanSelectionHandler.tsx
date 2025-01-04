import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlanSelectionHandlerProps {
  formData: any;
  onSuccess: (plan: string, assessmentId: string) => void;
}

export const usePlanSelection = ({ formData, onSuccess }: PlanSelectionHandlerProps) => {
  const { toast } = useToast();

  const prepareAssessmentData = (
    userId: string,
    medication: string,
    plan: string,
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
      plan_type: plan,
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

      if (!plan || typeof plan !== 'string') {
        throw new Error('Invalid plan selection');
      }

      const medication = formData.selectedMedication;
      if (!medication || typeof medication !== 'string') {
        throw new Error('Please select a medication first');
      }

      console.log('Processing plan selection:', { plan, medication }); // Debug log

      // Format the plan type to match the database format (e.g., "1 month" to "1_month")
      const formattedPlan = plan.toLowerCase().replace(/\s+/g, '_');

      // Calculate amount based on plan and medication
      const amounts: Record<string, Record<string, number>> = {
        tirzepatide: {
          "1_month": 499,
          "3_months": 810,
          "5_months": 1300,
        },
        semaglutide: {
          "1_month": 399,
          "4_months": 640,
          "7_months": 1050,
        },
      };

      const amount = amounts[medication.toLowerCase()]?.[formattedPlan];
      if (amount === undefined) {
        throw new Error('Invalid plan and medication combination');
      }

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